import Twilio from "twilio"
import config from "../config";
import AppError from "../error/AppError";
import httpStatus from "http-status"
 
const client = Twilio(config.message?.twilioAccountSID, config.message?.twilioAuthToken);
 
export const sendSMSMessage = async (phoneNumber: string, message: string) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: config.message.twilioPhoneNumber, // Your Twilio number
      to: phoneNumber,
    });
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new AppError(httpStatus.FORBIDDEN, "Sms Sender forbiden")
  }
};