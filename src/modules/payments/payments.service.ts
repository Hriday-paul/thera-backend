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
import { IOrder } from '../order/order.interface';
import Order from '../order/order.model';


const stripe = new Stripe(config.stripe?.stripe_api_secret as string, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});

interface IIorder extends IOrder {
  _id: Types.ObjectId;
}

//-----------------create acheck out url---------------------
const checkout = async (payload: IIorder, userId: string, product_names: string) => {

  const order: IIorder | null = await Order.findById(
    payload?._id,
  )

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order Not Found!');
  }

  const createdPayment = await Payment.create({ user: userId, tranId: order?.tranId, total_amount: order?.total_amount, order: order?._id });


  if (!createdPayment) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create payment',
    );
  }

  if (!createdPayment) throw new AppError(httpStatus.BAD_REQUEST, 'payment create failed');

  const checkoutSession = await createCheckoutSession({
    // customerId: customer.id,
    product: {
      amount: order?.total_amount,
      //@ts-ignore
      name: product_names,
      quantity: 1,
    },


    //@ts-ignore
    paymentId: createdPayment?._id,
  });

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
    ).populate('user') as unknown as { _id: string, order: string, tranId: string, total_amount: number, createdAt: Date, user: IUser };

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment Not Found!');
    }

    // check user is exist or not
    const user = await User.findById(payment?.user).session(session);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Found!');
    }

    const order: IIorder | null = await Order.findById(
      payment?.order,
    ).session(session);

    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order Not Found!');
    }

    await Order.findByIdAndUpdate(
      payment?.order,
      {
        isPaid: true,
      },
      {
        session,
      }
    )

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


const getAllPayments = async () => {
  const payments = await Payment.find();
  if (!payments || payments.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No payments found');
  }
  return payments;
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

const generateInvoice = async (payload: any) => {
};

export const paymentsService = {
  // createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
  checkout,
  confirmPayment,
  getPaymentsByUserId,
  generateInvoice,
};
