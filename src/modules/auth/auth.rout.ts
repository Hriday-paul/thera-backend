import { Router } from "express";
import { authController } from "./auth.controller";
import { changePasswordValidator, createAccountValidator, forgotPasswordValidator, loginAccountValidator, refreshTokenValidator, resetPasswordValidator } from "./auth.validator";
import req_validator from "../../middleware/req_validation";
import { otpResendValidator, otpVerifyValidator } from "../otp/otp.validation";
import { otpControllers } from "../otp/otp.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();
import { rateLimit } from 'express-rate-limit';

router.post('/create',
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: 2, // 5 requests per IP
        message: 'Too many request has been made. please try again after a minute',
    }),
    createAccountValidator,
    req_validator(),
    authController.createUser
)

router.post('/login',
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: 5, // 5 requests per IP
        message: 'Too many request has been made. please try again after a minute',
    }),
    loginAccountValidator,
    req_validator(),
    authController.loginUser
)

router.post('/admin/login',
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: 5, // 5 requests per IP
        message: 'Too many request has been made. please try again after a minute',
    }),
    loginAccountValidator,
    req_validator(),
    authController.adminLogin
)

router.patch(
    '/change-password',
    changePasswordValidator,
    req_validator(),
    auth(USER_ROLE.admin, USER_ROLE.company, USER_ROLE.patient, USER_ROLE.staf),
    authController.changePassword,
);

router.post('/refresh',
    refreshTokenValidator,
    req_validator(),
    authController.refreshToken
)

router.post(
    '/verify-otp',
    otpVerifyValidator,
    req_validator(),
    otpControllers.verifyOtp,
);

router.post(
    '/resend-otp',
    rateLimit({
        windowMs: 2 * 60 * 1000, // 2 minutes
        max: 1, // 5 requests per IP
        message: 'Too many request has been made. please try again after 2 minute',
    }),
    otpResendValidator,
    req_validator(),
    otpControllers.resendOtp,
);

router.post('/forgot-password', forgotPasswordValidator, req_validator(), authController.forgotPassword);
router.patch('/reset-password', resetPasswordValidator, req_validator(), authController.resetPassword);

export const authRouts = router