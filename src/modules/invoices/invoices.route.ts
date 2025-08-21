import { Router } from 'express';
import { invoicesController } from './invoices.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { updateInvoiceValidate } from './invoices.validation';
import req_validator from '../../middleware/req_validation';

const router = Router();

router.post('/', auth(USER_ROLE.company), invoicesController.createinvoices);

router.patch('/update-status/:id', updateInvoiceValidate, req_validator(), auth(USER_ROLE.company), invoicesController.updateinvoiceStatus);

router.delete('/:id', invoicesController.deleteinvoices);

router.get('/by-patient/:id', auth(USER_ROLE.company), invoicesController.getAllinvoicesByPatient);
router.get('/by-company', auth(USER_ROLE.company), invoicesController.getAllinvoicesByCompany);
// router.get('/', invoicesController.getinvoices);

export const invoicesRoutes = router;