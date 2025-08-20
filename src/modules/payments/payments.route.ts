import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';
import { checkoutValidator } from './payments.validation';
import req_validator from '../../middleware/req_validation';

const router = Router();

router.post('/checkout', checkoutValidator, req_validator(), auth(USER_ROLE.user), paymentsController.checkout);

// router.get(
//   '/userpayment',
//   auth(USER_ROLE.admin),
//   paymentsController.getPaymentsByUserId,
// );

router.get('/amount', auth(USER_ROLE.admin), paymentsController.paymentAmount);

router.get(
  '/paymentbyuserId/:id',
  auth(USER_ROLE.admin),
  paymentsController.getPaymentsByUserIdWithParams,
);

router.get('/confirm-payment', paymentsController.confirmPayment);

router.patch('/:id', auth(USER_ROLE.admin), paymentsController.updatePayments);

router.delete('/:id', auth(USER_ROLE.admin), paymentsController.deletePayments);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.admin),
  paymentsController.getPaymentsById,
);

router.get('/', auth(USER_ROLE.admin), paymentsController.getAllPayments);


export const paymentsRoutes = router;
