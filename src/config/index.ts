import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join((process.cwd(), '.env')) });

const stripe = {
  stripe_api_key: process.env.STRIPE_API_KEY,
  stripe_api_secret: process.env.STRIPE_API_SECRET,
};

const message = {
  twilioAccountSID: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
}

const meet = {
  client_id: process.env.MEET_CLIENT,
  secret_id: process.env.MEET_SECRET,
  redirect_url: process.env.MEET_CALLBACK,
  refresh_token: process.env.MEET_REFRESH_TOKEN,
}

const zoom = {
  client_id: process.env.ZOOM_CLIENT_ID,
  secret_id: process.env.ZOOM_CLIENT_SECRET,
  account_id: process.env.ZOOM_ACCOUNT_ID,
}

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  ip: process.env.IP,
  SERVER_URL: process.env.SERVER_URL,
  BASE_URL: process.env.BASE_URL,

  success_url: process.env.PAYMENT_SUCCESS_URL,
  cancel_url: process.env.PAYMENT_CANCEL_URL,
  database_url: process.env.DATABASE_URL,

  staff_client_url : process.env.STAFF_CLIENT_URL,
  patient_client_url : process.env.PATIENT_CLIENT_URL,

  client_Url: process.env.CLIENT_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  nodemailer_host_email: process.env.NODEMAILER_HOST_EMAIL,
  nodemailer_host_pass: process.env.NODEMAILER_HOST_PASS,
  socket_port: process.env.SOCKET_PORT,
  stripe_secret: process.env.STRIPE_API_SECRET,
  stripe_key: process.env.STRIPE_API_KEY,
  stripe,
  message,
  meet,
  zoom
};
