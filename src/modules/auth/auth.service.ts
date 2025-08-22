import { IICompany, IUser } from "../user/user.interface"
import AppError from "../../error/AppError"
import httpStatus from 'http-status'
import bcrypt from 'bcrypt'
import { createToken, verifyToken } from "./auth.utils"
import config from "../../config"
import path from 'path';
import fs from 'fs';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { generateOtp } from "../../utils/otpGenerator"
import moment from "moment"
import { sendEmail } from "../../utils/mailSender"
import { Company, User } from "../user/user.models"
import { paymentsService } from "../payments/payments.service"


const createUser = async (payload: IICompany, packag: string) => {

    const { name, email, password = '', organization_name, site_short_name, legal_organization_name, business_type, company_type, tax_type, tax_id, organization_liscence, organization_npi = "", facility_npi = '', diagnostic_code, pregnancy_related_services = false, track_pqrs_measure = false, cfr_part2 = false } = payload

    let isExist = await User.findOne({ email })

    //check user is exist or not
    if (isExist && isExist?.isverified) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Another account found with this email',
        );
    }

    // creat encrypted password
    const hashedPassword = await bcrypt.hash(password, 15);

    const company = await Company.insertOne({
        organization_name,
        site_short_name,
        legal_organization_name,
        business_type,
        company_type,
        tax_type,
        tax_id,
        organization_liscence,
        organization_npi,
        facility_npi,
        diagnostic_code,
        pregnancy_related_services,
        track_pqrs_measure,
        cfr_part2
    });

    const user = await User.findOneAndUpdate({ email }, {
        name,
        email,
        password: hashedPassword,
        role: "company",
        company: company?._id
    }, { upsert: true, new: true })

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Account creation failed');
    }

    const link = await paymentsService.checkout(packag, user?._id as unknown as string, "/auth/verify-otp?next=/auth/login")

    return { user, link };
};

// Login
const loginUser = async (payload: { email: string, password: string, fcmToken?: string, role: string }) => {

    const user: IUser | null = await User.findOne({ email: payload?.email, role: payload?.role });

    if (!user) {
        // If user not found, throw error
        throw new AppError(httpStatus.NOT_FOUND, 'Account not found');
    }
    else {
        if (!user?.status) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked');
        }

        if (user?.isDeleted) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account is deleted');
        }

        if (!user?.isverified) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Your account is not verified');
        }

        // Handle verify password
        const passwordMatched = await bcrypt.compare(payload?.password, user?.password);

        if (!passwordMatched) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Please check your credentials and try again');
        }

    }

    // Update FCM token if provided
    let updatedUser = user;

    if (payload?.fcmToken) {
        updatedUser = await User.findOneAndUpdate(
            { email: payload.email },
            { fcmToken: payload.fcmToken },
            { new: true }
        ) as IUser;
    }

    const jwtPayload: { userId: string; role: string } = {
        userId: user?._id?.toString() as string,
        role: user?.role,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        60 * 60 * 24 * 7, //7 days
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        60 * 60 * 24 * 30, // 30 days
    );

    return {
        user,
        accessToken,
        refreshToken,
    };
};

//admin login
const adminLogin = async (payload: { email: string, password: string }) => {

    const user: IUser | null = await User.findOne({ email: payload?.email, role: "admin" });

    if (!user) {
        // If user not found, throw error
        throw new AppError(httpStatus.NOT_FOUND, 'admin not found');
    } else {

        if (!user?.isverified) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account is not verified');
        }

        // Handle verify password
        const passwordMatched = await bcrypt.compare(payload?.password, user?.password);

        if (!passwordMatched) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Please check your credentials and try again');
        }

    }

    const jwtPayload: { userId: string; role: string } = {
        userId: user?._id?.toString() as string,
        role: user?.role,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        60 * 60 * 24 * 7, //7 days
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        60 * 60 * 24 * 30, //  30 days
    );

    return {
        user,
        accessToken,
        refreshToken,
    };
};


// Change password
const changePassword = async (id: string, payload: { oldPassword: string, newPassword: string, confirmPassword: string }) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const passwordMatched = await bcrypt.compare(payload?.oldPassword, user?.password);

    if (!passwordMatched) {
        throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
    }
    if (payload?.newPassword !== payload?.confirmPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'New password and confirm password do not match',
        );
    }

    const hashedPassword = await bcrypt.hash(
        payload?.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    const result = await User.findByIdAndUpdate(
        id,
        {
            $set: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
        }
    );

    return result;
};


// Forgot password
const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const jwtPayload = {
        email: email,
        userId: user?._id,
    };

    const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
        expiresIn: '3m',
    });

    const currentTime = new Date();
    const otp = generateOtp();
    const expiresAt = moment(currentTime).add(3, 'minute');

    await User.findByIdAndUpdate(user?._id, {
        verification: {
            otp,
            expiresAt,
        },
    });

    const otpEmailPath = path.join(
        __dirname,
        '../../public/view/forgot_pass_mail.html',
    );

    await sendEmail(
        user?.email,
        'Your reset password OTP is',
        fs
            .readFileSync(otpEmailPath, 'utf8')
            .replace('{{otp}}', otp)
            .replace('{{email}}', user?.email),
    );

    return { email, token };
};


// Reset password
const resetPassword = async (token: string, payload: { newPassword: string, confirmPassword: string }) => {
    let decode;
    try {
        decode = jwt.verify(
            token,
            config.jwt_access_secret as string,
        ) as JwtPayload;
    } catch (err) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'Session has expired. Please try again',
        );
    }

    const user: IUser | null = await User.findById(decode?.userId).select(
        'verification',
    );

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (new Date() > user?.verification?.expiresAt) {
        throw new AppError(httpStatus.FORBIDDEN, 'Session has expired');
    }
    if (!user?.verification?.status) {
        throw new AppError(httpStatus.FORBIDDEN, 'OTP is not verified yet');
    }
    if (payload?.newPassword !== payload?.confirmPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'New password and confirm password do not match',
        );
    }

    const hashedPassword = await bcrypt.hash(
        payload?.newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    const result = await User.findByIdAndUpdate(decode?.userId, {
        password: hashedPassword,
        verification: {
            otp: 0,
            status: true,
        },
    });

    return result;
};


// Refresh token
const refreshToken = async (token: string) => {
    // Checking if the given token is valid
    const decoded = verifyToken(token, config.jwt_refresh_secret as string);
    const { userId } = decoded;
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const isDeleted = user?.isDeleted;

    if (isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
    }

    const jwtPayload = {
        userId: user?._id?.toString() as string,
        role: user.role,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        60 * 60 * 24 * 7, //7 days
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        60 * 60 * 24 * 30, //30 days
    );

    return {
        accessToken,
        refreshToken
    };
};


export const authService = {
    createUser,
    loginUser,
    forgotPassword,
    changePassword,
    resetPassword,
    refreshToken,
    adminLogin
}