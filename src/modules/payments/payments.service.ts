import Stripe from 'stripe';
import config from '../../config';
import { IPayment } from './payments.interface';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import Payment from './payments.models';
import { createCheckoutSession } from './payments.utils';
import { startSession, Types } from 'mongoose';
import { User } from '../user/user.models';
import { IUser } from '../user/user.interface';
import generateRandomString from '../../utils/generateRandomString';
import { IPackage } from '../package/package.interface';
import Package from '../package/package.model';
import QueryBuilder from '../../builder/QueryBuilder';
import Active_Package from '../active_package/active_package.model';


const stripe = new Stripe(config.stripe?.stripe_api_secret as string, {
  apiVersion: "2025-03-31.basil", // Valid API version
  typescript: true,
});

//-----------------create acheck out url---------------------
const checkout = async (packageId: string, userId: string, clientNextUrl : string) => {
  const tranId = generateRandomString(10);

  const foundPackage: IPackage | null = await Package.findById(
    packageId,
  )

  if (!foundPackage) {
    throw new AppError(httpStatus.NOT_FOUND, 'Boasting Package Not Found!');
  }

  const startedAt = Date.now();
  const expiredAt = Date.now() + foundPackage.duration_day * 24 * 60 * 60 * 1000

  interface INewPayment extends IPayment {
    user: IUser // after population, user will be an object, not just an ID
  }

  const paymentData = await Payment.findOneAndUpdate(
    {
      isPaid: false,
      user: userId,
    },
    { user: userId, tranId, total_amount: foundPackage?.price, expiredAt, startedAt, package: foundPackage?._id, isPaid: false },
    { new: true, upsert: true },
  ).populate("user") as INewPayment;

  if (!paymentData) throw new AppError(httpStatus.BAD_REQUEST, 'payment not found');

  const checkoutSession = await createCheckoutSession({
    // customerId: customer.id,
    product: {
      amount: paymentData?.total_amount,
      //@ts-ignore
      name: foundPackage?.title,
      quantity: 1,
    },

    user: paymentData?.user,

    //@ts-ignore
    paymentId: paymentData?._id,

  },clientNextUrl );

  return checkoutSession?.url;

};


const confirmPayment = async (query: Record<string, any>) => {

  const { sessionId, paymentId } = query;
  const session = await startSession();
  const PaymentSession = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId = PaymentSession.payment_intent as string;

  if (PaymentSession.status !== 'complete') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment session is not completed',
    );
  }

  try {

    session.startTransaction();

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { isPaid: true, paymentIntentId: paymentIntentId },
      { new: true, session },
    ).populate('user')

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment Not Found!');
    }

    // check user is exist or not
    const user = await User.findById(payment?.user).session(session);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Found!');
    }

    const existActive_Package = await Active_Package.findOne({ user: user?._id });


    let new_expired
    const currentDate = new Date();

    if (existActive_Package) {
      const isNotExpired = new Date(existActive_Package.expiredAt) >= currentDate;


      new_expired = isNotExpired
        ? new Date(
          new Date(existActive_Package.expiredAt).getTime() +
          (payment?.expiredAt ? new Date(payment.expiredAt).getTime() - currentDate.getTime() : 0)
        )
        : payment?.expiredAt ? new Date(payment.expiredAt) : currentDate;

    } else {
      new_expired = payment?.expiredAt ? new Date(payment.expiredAt) : new Date();
    }

    const access_product = await Active_Package.updateOne({ user: user._id }, { expiredAt: new_expired, last_purchase_package: payment?.package, user: user?._id }, { upsert: true, session });

    await session.commitTransaction();
    return payment;

  } catch (error: any) {

    await session.abortTransaction();

    if (paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
        });
      } catch (refundError: any) {
        console.error('Error processing refund:', refundError.message);
      }
    }

    throw new AppError(httpStatus.BAD_GATEWAY, error.message);
  } finally {
    session.endSession();
  }
};


const getAllPayments = async (query: Record<string, any>) => {
  const paymentModel = new QueryBuilder(Payment.find({ isPaid: true }).populate({ path: "user", select: "-password -fcmToken" }).populate({ path: "package" }), query)
    .search(['name', 'email', 'contact'])
    .filter()
    .paginate()
    .sort();
  const data: any = await paymentModel.modelQuery;
  const meta = await paymentModel.countTotal();

  return { data, meta }
};

const getPaymentsByUserId = async (
  userId: string,
  query: Record<string, any>,
) => {
  // const paymentQueryBuilder = new QueryBuilder(
  //   Payment.find({ user: userId, isPaid: true }).populate({
  //     path: 'subscription',
  //     populate: { path: 'package' },
  //   }).populate('user'),
  //   query,
  // )
  //   .search(['paymentStatus', 'transactionId', 'subscription.name'])
  //   .filter()
  //   .paginate()
  //   .sort();

  // const data: any = await paymentQueryBuilder.modelQuery;
  // const meta = await paymentQueryBuilder.countTotal();

  // // if (!data || data.length === 0) {
  // //   throw new AppError(httpStatus.NOT_FOUND, 'No payments found for the user');
  // // }

  // return {
  //   data,
  //   meta,
  // };
};

// Get a payment by ID
const getPaymentsById = async (id: string) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }
  return payment;
};

// Update a payment by ID
const updatePayments = async (id: string, updatedData: IPayment) => {
  const updatedPayment = await Payment.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
  if (!updatedPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found to update');
  }
  return updatedPayment;
};

// Delete a payment by ID
const deletePayments = async (id: string) => {
  const deletedPayment = await Payment.findByIdAndDelete(id);
  if (!deletedPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found to delete');
  }
  return deletedPayment;
};

const paymentAmount = async () => {

  const totalEarning = await Payment.aggregate([
    {
      $match: { isPaid: true }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$total_amount" }
      }
    }
  ]);

  const totalAmount = totalEarning.length > 0 ? totalEarning[0].totalAmount : 0;



  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayEarning = await Payment.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$total_amount" }
      }
    }
  ]);

  const totalTodayEarning = todayEarning.length > 0 ? todayEarning[0].totalAmount : 0;

  return {
    totalEarning: totalAmount,
    todayEarning: totalTodayEarning
  }

}

export const paymentsService = {
  // createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
  checkout,
  confirmPayment,
  getPaymentsByUserId,
  paymentAmount
};
