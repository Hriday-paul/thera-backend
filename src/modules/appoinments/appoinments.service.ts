import { isSameDay, getDay } from "date-fns"; // You can use date-fns for day calculations
import { User } from "../user/user.models";
import { IReminder, IStaf, IUser } from "../user/user.interface";
import AppError from "../../error/AppError";
import moment from "moment";
import { IAppoinment, IOccurrencce, IStaffUnavilibility } from "./appoinments.interface";
import { Appointment, AppointmentOccurrence, StaffUnavailability } from "./appoinments.model";
import httpStatus from "http-status";
import mongoose, { ObjectId, Types } from "mongoose";
import { sendNotification } from "../notification/notification.utils";
import { INotification } from "../notification/notification.inerface";
import { google } from 'googleapis';
import fs from 'fs';
import { createRecurringGoogleEvent } from "../../utils/google_meet";
import config from "../../config";
import { sendEmail } from "../../utils/mailSender";
import { sendSMSMessage } from "../../utils/SmsSender";
import agenda from "../../config/agenda";
import path from "path";

interface IIApoinment extends IAppoinment {
  location: {
    isOnline: boolean,
    address: string
  }
}

interface IIOccurrencce {
  _id: ObjectId
  appointment: IAppoinment,
  start_datetime: Date,
  end_datetime: Date,
  staff_ids: IUser[],
  patient_id: IUser,
  location: {
    isOnline: boolean,
    address: string
  },
  company_id: IUser
  status: "upcoming" | "completed" | "cancelled" | "no_show"
}

const ReminderFunc = async ({ occurenceId, msgType, userId }: { occurenceId: string, msgType?: string, userId?: string }) => {

  const occurence = await AppointmentOccurrence.findOne({ _id: new Types.ObjectId(occurenceId) })
    .populate({
      path: "patient_id",
      populate: {
        path: "patient"
      }
    })
    .populate({
      path: "staff_ids",
      populate: {
        path: "staf"
      }
    })
    .populate({
      path: "company_id",
      populate: {
        path: "company"
      }
    }) as unknown as IIOccurrencce;

  if (!occurence) return;

  const staffs = occurence?.staff_ids;
  const patient = occurence?.patient_id;
  const company = occurence?.company_id;


  const emailTempalte = occurence?.company_id?.company?.msg_templates?.email?.message || "";
  const smsTemplate = occurence?.company_id?.company?.msg_templates?.sms?.message || "";

  const patientfullname = patient?.patient?.f_name + " " + patient?.patient?.middle_name + " " + patient?.patient?.last_name
  const appointmentdate = moment(occurence?.start_datetime).format('MMMM Do YYYY')
  const appointmentTime = moment(occurence?.start_datetime).format('h:mm:ss a')

  const staff_first_names = staffs?.map(i => {
    return i?.staf?.f_name
  }).join(', ')

  const staff_full_names = staffs?.map(i => {
    return i?.staf?.f_name + "" + i?.staf?.middle_name + "" + i?.staf?.last_name
  }).join(', ')


  const address = occurence?.location?.address

  const realEmailTemplate = emailTempalte
    .replace("{{ClientFullName}}", patientfullname)
    .replace("{{ClientFirstName}}", patient?.patient?.f_name!)
    .replace("{{ClientPreferredName}}", patient?.patient?.preferred_name ?? patientfullname)
    .replace("{{Date}}", appointmentdate)
    .replace("{{Time}}", appointmentTime)
    .replace("{{TelehealthLink}}", config.client_Url!)
    .replace("{{StaffFirstName}}", staff_first_names)
    .replace("{{StaffFullName}}", staff_full_names)
    .replace("{{Location}}", address)
    .replace("{{OrgCallbackNumber}}", company?.company?.org_phone || "")
    .replace("{{OrganisationName}}", company?.company?.organization_name!)

  const realSmsTemplate = smsTemplate
    .replace("{{ClientFullName}}", patientfullname)
    .replace("{{ClientFirstName}}", patient?.patient?.f_name!)
    .replace("{{ClientPreferredName}}", patient?.patient?.preferred_name ?? patientfullname)
    .replace("{{Date}}", appointmentdate)
    .replace("{{Time}}", appointmentTime)
    .replace("{{TelehealthLink}}", config.client_Url!)
    .replace("{{StaffFirstName}}", staff_first_names)
    .replace("{{StaffFullName}}", staff_full_names)
    .replace("{{Location}}", address)
    .replace("{{OrgCallbackNumber}}", company?.company?.org_phone || "")
    .replace("{{OrganisationName}}", company?.company?.organization_name!)


  // ------------ push notifications -------------
  // for staffs
  const fcmTokens: string[] = (staffs?.map(i => i?.fcmToken).filter(Boolean)) as string[] || [];

  const notifications = (staffs?.map(i => {
    if (i?.fcmToken) {
      return {
        title: `Appointment Reminder`,
        message: `New appointment coming at ${moment(occurence.start_datetime).format('MMMM Do YYYY, h:mm:ss a')}`,
        receiver: i._id,
        receiverEmail: i.email,
        receiverRole: i.role,
        sender: userId ? new Types.ObjectId(userId) : i._id
      } satisfies INotification;
    }
    return null;
  }) ?? []).filter((n): n is NonNullable<typeof n> => n !== null);

  // for patient
  patient?.fcmToken && fcmTokens.push(patient?.fcmToken)
  notifications.push({
    title: `Appointment Reminder`,
    message: `New appointment coming at ${moment(occurence.start_datetime).format('MMMM Do YYYY, h:mm:ss a')}`,
    receiver: patient?._id,
    receiverEmail: patient?.email,
    receiverRole: patient?.role,
    sender: userId ? new Types.ObjectId(userId) : patient?._id
  })

  if (fcmTokens?.length > 0) {
    sendNotification(fcmTokens, notifications, { title: `Appoinment Reminder`, message: `New appoinment coming at ${moment(occurence?.start_datetime).format('MMMM Do YYYY, h:mm:ss a')}` });
  }
  // ------------------push notification end-----------------

  // Send your reminder logic (email, SMS)

  // ---------send reminder to patient email----------
  if (occurence?.company_id?.company?.msg_templates?.email?.isActive && patient?.patient?.contactPreferences?.allowEmail && (!msgType || msgType == "Email")) {
    sendEmail(
      patient?.email,
      'Appoinment Reminder',
      realEmailTemplate
    );
  }

  // ---------send reminder to staffs email----------
  if (occurence?.company_id?.company?.msg_templates?.email?.isActive && (!msgType || msgType == "Email")) {

    for (let staff of staffs) {

      if (staff?.email) {
        sendEmail(
          staff?.email,
          'Appoinment Reminder',
          realEmailTemplate
        );
      }

    }
  }

  // ---------send sms reminder to patient----------
  // if (occurence?.company_id?.company?.msg_templates?.sms?.isActive && patient?.patient?.contactPreferences?.allowText && patient?.patient?.phone && (!msgType || msgType == "SMS")) {
  //   sendSMSMessage(
  //     patient?.patient?.phone,
  //     // 'Appoinment Reminder',
  //     realSmsTemplate
  //   );
  // }

  return null

}


// -----------------------------schedule reminder------------------

agenda.define("send appointment reminder", async (job: any) => {

  console.log("---------reminder schedule called------------")

  const { occurenceId, appointmentId, companyId, type } = job.attrs.data;

  const res = ReminderFunc({ occurenceId, msgType: type })

  return res;

});


const generateOccurrences = async (appointment: IIApoinment, companyId: ObjectId, guestEmails: { email: string }[]): Promise<IOccurrencce[]> => {

  const {
    _id: appointmentId,
    start_date,
    times,
    location,
    repeat_type,
    repeat_count = 1,
    staff_ids,
    patient_id,
  } = appointment;

  if (!start_date || !Array.isArray(times) || times.length !== 2) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid or missing start_date/times for appointment.');
  }

  const [startTime, endTime] = times;

  const baseStart = moment(start_date)
    .hour(moment(startTime).hour())
    .minute(moment(startTime).minute())
    .second(0)       // reset seconds
    .millisecond(0); // reset milliseconds

  const baseEnd = moment(start_date)
    .hour(moment(endTime).hour())
    .minute(moment(endTime).minute())
    .second(0)
    .millisecond(0);


  // const scopes = ['https://www.googleapis.com/auth/calendar.events'];

  // const url = oAuth2Client.generateAuthUrl({
  //   access_type: 'offline', // so you get a refresh token
  //   scope: scopes,
  // });

  // console.log(url)

  // const { tokens } = await oAuth2Client.getToken("refresh token");



  let meetLink = "";

  if (location?.isOnline) {

    const oAuth2Client = new google.auth.OAuth2(
      config.meet.client_id,
      config.meet.secret_id,
      config.meet.redirect_url,
    );

    oAuth2Client.setCredentials({
      refresh_token: config.meet.refresh_token,
    });

    meetLink = await createRecurringGoogleEvent(oAuth2Client, appointment, guestEmails)

  }

  // console.log(meetLink, "-----------------meetlink-----------------")


  const occurrences: IOccurrencce[] = [];

  for (let i = 0; i < repeat_count; i++) {

    let occurrenceStart = baseStart.clone();
    let occurrenceEnd = baseEnd.clone();

    switch (repeat_type) {
      case "daily":
        occurrenceStart.add(i, "days");
        occurrenceEnd.add(i, "days");
        break;
      case "weekly":
        occurrenceStart.add(i, "weeks");
        occurrenceEnd.add(i, "weeks");
        break;
      case "monthly":
        occurrenceStart.add(i, "months");
        occurrenceEnd.add(i, "months");
        break;
      case "yearly":
        occurrenceStart.add(i, "years");
        occurrenceEnd.add(i, "years");
        break;
      case "none":
        if (i > 0) continue; // skip if somehow repeat_count > 1
        break;
      default:
        if (i > 0) continue; // skips any repeat after the first
        break;
    }

    occurrences.push({
      appointment: appointmentId,
      start_datetime: occurrenceStart.toDate(),
      end_datetime: occurrenceEnd.toDate(),
      staff_ids,
      location: { isOnline: location?.isOnline, address: location?.isOnline ? meetLink : location?.address },
      // location: location,
      status: "upcoming",
      patient_id,
      company_id: companyId
    });

  }

  return occurrences;
};


function getOffsetInMinutes(reminder: IReminder): number {
  switch (reminder.time_type) {
    case "Days": return reminder.long_ago * 24 * 60;
    case "Hours": return reminder.long_ago * 60;
    case "Minutes": return reminder.long_ago;
    default: return 0;
  }
}

const createAppointment = async (companyId: string, payload: IIApoinment) => {

  const guestEmails: { email: string }[] = [];

  const company = await User.findOne({ _id: new Types.ObjectId(companyId) }).populate({ path: "company" })

  if (!company) {
    throw new AppError(httpStatus.NOT_FOUND, "Comapny not found")
  }

  if (!company?.company) {
    throw new AppError(httpStatus.NOT_FOUND, "Comapny not found")
  }

  guestEmails.push({ email: company?.email });

  const reminderSchedules = company?.company?.reminderTypes

  //--------------creae root appointment-------------
  const appoin = await Appointment.create({ ...payload, company_id: companyId });

  const staffs = await User.find({
    _id: { $in: payload.staff_ids }
  });

  for (let staff of staffs) {
    guestEmails.push({ email: staff?.email })
  }

  const appointment = appoin.toObject();

  // -----------------generate occurences----------------
  const occurrences = await generateOccurrences({ ...appointment, location: payload?.location }, companyId as unknown as ObjectId, guestEmails);

  const occurrenceList = await AppointmentOccurrence.insertMany(occurrences);

  //-----------reminder setup based on company setting---------
  for (let occurence of occurrenceList) {
    for (const reminder of reminderSchedules) {
      const offsetMinutes = getOffsetInMinutes(reminder);
      const reminderTime = new Date(occurence?.start_datetime.getTime() - offsetMinutes * 60 * 1000);

      if (reminderTime > new Date()) {
        await agenda.schedule(reminderTime, "send appointment reminder", {
          appointmentId: appoin?._id,
          occurenceId: occurence?._id,
          companyId: companyId,
          type: reminder.msg_type,   // Email or SMS
          offset: offsetMinutes
        });
      }
    }
  }

  return occurrenceList;
};

const reScheduleAgenda = async (occcurence: IIOccurrencce, new_date: Date) => {
  await agenda.cancel({ "data.occurenceId": occcurence?._id });

  for (let reminder of occcurence?.company_id?.company?.reminderTypes || []) {
    const offsetMinutes = getOffsetInMinutes(reminder);

    console.log(reminder.msg_type)

    const reminderTime = new Date(new_date.getTime() - offsetMinutes * 60 * 1000);

    if (reminderTime > new Date()) {
      agenda.schedule(reminderTime, "send appointment reminder", {
        appointmentId: occcurence?.appointment?._id,
        occurenceId: occcurence?._id,
        companyId: occcurence?.company_id?._id,
        type: reminder.msg_type,
        offset: offsetMinutes
      })
    }
  }
}


const updateStatusOccurence = async (occurrenceId: string, status: string, userId: string) => {

  const exist = await AppointmentOccurrence.findOne({ _id: occurrenceId }).populate({
    path: "patient_id",
    populate: {
      path: "patient"
    }
  })
    .populate({
      path: "staff_ids",
      populate: {
        path: "staf"
      }
    })
    .populate({
      path: "company_id",
      populate: {
        path: "company"
      }
    }).populate({
      path: "appointment",
    }) as unknown as IIOccurrencce;

  if (!exist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Appointment not found');
  }

  const res = await AppointmentOccurrence.updateOne(
    { _id: occurrenceId },
    { status }
  );

  // ----------sent notification if appointment is cancelled-------------
  if (status == "cancelled") {

    const staffs = exist?.staff_ids;
    const patient = exist?.patient_id;

    const fcmTokens: string[] = (staffs?.map(i => i?.fcmToken).filter(Boolean)) as string[] || [];

    const notifications = (staffs?.map(i => {
      if (i?.fcmToken) {
        return {
          title: `Appointment Cancelled`,
          message: `A appointment cancelled at ${moment(exist.start_datetime).format('MMMM Do YYYY, h:mm:ss a')} for ${exist?.patient_id?.name} patient`,
          receiver: i._id,
          receiverEmail: i.email,
          receiverRole: i.role,
          sender: userId ? new Types.ObjectId(userId) : i._id
        } satisfies INotification;
      }
      return null;
    }) ?? []).filter((n): n is NonNullable<typeof n> => n !== null);

    // for patient
    patient?.fcmToken && fcmTokens.push(patient?.fcmToken)

    notifications.push({
      title: `Appointment Cancelled`,
      message: `A appointment is cancelled for ${moment(exist.start_datetime).format('MMMM Do YYYY, h:mm:ss a')} date`,
      receiver: exist?.patient_id?._id,
      receiverEmail: exist?.patient_id?.email,
      receiverRole: exist?.patient_id?.role,
      sender: new Types.ObjectId(userId)
    })

    if (fcmTokens?.length > 0) {
      sendNotification(fcmTokens, notifications, { title: `Appointment cancelled`, message: `A appointment is cancelled for ${moment(exist.start_datetime).format('MMMM Do YYYY, h:mm:ss a')} date` });
    }

    const patient_cancel_temp = path.join(
      __dirname,
      '../../public/view/appointment_cancel_patient.html',
    );

    // ---------send cancelletion email to patient ----------
    if (exist?.company_id?.company?.msg_templates?.email?.isActive && patient?.patient?.contactPreferences?.allowEmail) {
      sendEmail(
        patient?.email,
        'Appoinment Cancelled',
        fs
          .readFileSync(patient_cancel_temp, 'utf8')
          .replace('{{name}}', patient?.name)
          .replace('{{service}}', exist?.appointment?.title)
          .replace('{{start_date}}', moment(exist?.start_datetime).format("MMMM Do YYYY"))
          .replace('{{start_time}}', moment(exist?.start_datetime).format("h:mm a"))
          .replace('{{end_time}}', moment(exist?.end_datetime).format("h:mm a"))
          .replace('{{location}}', exist?.location?.address)
      );
    }

    // ---------send reminder to staffs email----------
    const staff_cancel_temp = path.join(
      __dirname,
      '../../public/view/appointment_cancel_staff.html',
    );

    if (exist?.company_id?.company?.msg_templates?.email?.isActive) {
      for (let staff of staffs) {

        if (staff?.email) {
          sendEmail(
            staff?.email,
            'Appoinment Cancelled',
            fs
              .readFileSync(staff_cancel_temp, 'utf8')
              .replace('{{name}}', staff?.name)
              .replace('{{service}}', exist?.appointment?.title)
              .replace('{{start_date}}', moment(exist?.start_datetime).format("MMMM Do YYYY"))
              .replace('{{start_time}}', moment(exist?.start_datetime).format("h:mm a"))
              .replace('{{patient}}', patient?.name)
              .replace('{{location}}', exist?.location?.address)
          );
        }
      }
    }

  }


  return res;
};


const markStaffUnavailable = async (staff_id: string, payload: IStaffUnavilibility) => {
  const exist = await StaffUnavailability.findOne({ staff_id, occurrence_id: payload?.occurrence_id });
  if (exist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Staff already not available',
    );
  }
  return await StaffUnavailability.create({ ...payload, staff_id });
};


// const getFreeStaff = async (req_date: string, time: string, companyId: string) => {

//   const date = new Date(req_date);
//   const timeDate = new Date(time);

//   // console.log(date, time)

//   const weekday = date.toLocaleString('en-US', { weekday: 'long' });

//   interface ISStaff extends IUser {
//     staf: IStaf
//   }

//   // Step 1: Get all staff who are scheduled to work on that day

//   const availableUsers = await User.aggregate([
//     {
//       $match: {
//         role: "staf",
//         staf_company_id: new Types.ObjectId(companyId)
//       }
//     },
//     {
//       $lookup: {
//         from: "stafs",
//         localField: "staf",
//         foreignField: "_id",
//         as: "staf"
//       }
//     },
//     { $unwind: "$staf" },
//     {
//       $project: {
//         name: 1,
//         email: 1,
//         image: 1,
//         "staf.work_schedule": 1,
//         "staf.offDays": 1,
//         "staf._id": 1,
//         "staf.f_name": 1,
//         "staf.middle_name": 1,
//         "staf.last_name": 1
//       }
//     },
//     {
//       $match: {
//         $expr: {
//           $gt: [
//             {
//               $size: {
//                 $filter: {
//                   input: "$staf.work_schedule",
//                   as: "ws",
//                   cond: {
//                     $and: [
//                       { $eq: ["$$ws.day", weekday] },
//                       { $eq: ["$$ws.willWork", true] },
//                       {
//                         $let: {
//                           vars: {
//                             startTime: { $arrayElemAt: ["$$ws.times", 0] },
//                             endTime: { $arrayElemAt: ["$$ws.times", 1] },
//                             inputTime: timeDate
//                           },
//                           in: {
//                             $and: [
//                               {
//                                 $lte: [
//                                   {
//                                     $add: [
//                                       { $multiply: [{ $hour: "$$startTime" }, 3600] },
//                                       { $multiply: [{ $minute: "$$startTime" }, 60] },
//                                       { $second: "$$startTime" }
//                                     ]
//                                   },
//                                   {
//                                     $add: [
//                                       { $multiply: [{ $hour: "$$inputTime" }, 3600] },
//                                       { $multiply: [{ $minute: "$$inputTime" }, 60] },
//                                       { $second: "$$inputTime" }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 $gte: [
//                                   {
//                                     $add: [
//                                       { $multiply: [{ $hour: "$$endTime" }, 3600] },
//                                       { $multiply: [{ $minute: "$$endTime" }, 60] },
//                                       { $second: "$$endTime" }
//                                     ]
//                                   },
//                                   {
//                                     $add: [
//                                       { $multiply: [{ $hour: "$$inputTime" }, 3600] },
//                                       { $multiply: [{ $minute: "$$inputTime" }, 60] },
//                                       { $second: "$$inputTime" }
//                                     ]
//                                   }
//                                 ]
//                               }
//                             ]
//                           }
//                         }
//                       }
//                     ]
//                   }
//                 }
//               }
//             },
//             0
//           ]
//         }
//       }
//     }
//   ]) as ISStaff[];

//   const finalFreeStaff = [];

//   for (const user of availableUsers) {

//     const isOff = user?.staf.offDays.some(off => {
//       if (off.dates.some(d => isSameDay(d, date))) return true;

//       if (off.repeat && off.repeat_type === 'weekly') {
//         return getDay(date) === getDay(off.dates[0]); // same weekday
//       }

//       return false;
//     });

//     if (isOff) continue;

//     const hasConflict = await AppointmentOccurrence.exists({
//       staff_ids: { $in: [new Types.ObjectId(user._id)] },
//       start_datetime: { $lte: timeDate },
//       end_datetime: { $gte: timeDate },
//       status: { $ne: 'cancelled' }
//     })

//     if (!hasConflict) {
//       finalFreeStaff.push(user);
//     }

//   }

//   return finalFreeStaff;
// };

const getFreeStaff = async (req_date: string, time: string, companyId: string) => {
  const date = new Date(req_date);
  const inputTime = moment(time); // appointment time

  const weekday = date.toLocaleString("en-US", { weekday: "long" });

  interface ISStaff extends IUser {
    staf: IStaf;
  }

  // Step 1: Fetch all staff from this company
  const staffList = (await User.aggregate([
    {
      $match: {
        role: "staf",
        staf_company_id: new Types.ObjectId(companyId),
      },
    },
    {
      $lookup: {
        from: "stafs",
        localField: "staf",
        foreignField: "_id",
        as: "staf",
      },
    },
    { $unwind: "$staf" },
    {
      $project: {
        name: 1,
        email: 1,
        image: 1,
        "staf.work_schedule": 1,
        "staf.offDays": 1,
        "staf._id": 1,
        "staf.f_name": 1,
        "staf.middle_name": 1,
        "staf.last_name": 1,
      },
    },
  ])) as ISStaff[];

  const finalFreeStaff: ISStaff[] = [];

  for (const user of staffList) {
    // --- Check Work Schedule ---
    const scheduleForDay = user.staf.work_schedule.find(
      (ws) => ws.day === weekday && ws.willWork
    );

    if (!scheduleForDay || scheduleForDay.times.length !== 2) continue;

    const [startStr, endStr] = scheduleForDay.times; // ["09:00", "18:00"]
    const startTime = moment(startStr, "HH:mm");
    const endTime = moment(endStr, "HH:mm");

    // normalize inputTime to only HH:mm
    const inputTimeOfDay = moment()
      .hour(inputTime.hour())
      .minute(inputTime.minute())
      .second(0);

    const isWithinSchedule =
      inputTimeOfDay.isSame(startTime) ||
      inputTimeOfDay.isSame(endTime) ||
      (inputTimeOfDay.isAfter(startTime) && inputTimeOfDay.isBefore(endTime));

    if (!isWithinSchedule) continue;

    // --- Check OffDays / Holidays ---
    const isOff = user.staf.offDays.some((off) => {
      // Exact date match
      if (off.dates.some((d) => isSameDay(new Date(d), date))) return true;

      // Weekly repeat
      if (off.repeat && off.repeat_type === "Weekly") {
        return getDay(date) === getDay(new Date(off.dates[0]));
      }

      // Monthly repeat
      if (off.repeat && off.repeat_type === "Monthly") {
        return date.getDate() === new Date(off.dates[0]).getDate();
      }

      // Yearly repeat
      if (off.repeat && off.repeat_type === "Yearly") {
        return (
          date.getDate() === new Date(off.dates[0]).getDate() &&
          date.getMonth() === new Date(off.dates[0]).getMonth()
        );
      }

      return false;
    });

    if (isOff) continue;

    // --- Check Appointment Conflicts ---
    const hasConflict = await AppointmentOccurrence.exists({
      staff_ids: { $in: [new Types.ObjectId(user._id)] },
      start_datetime: { $lte: time },
      end_datetime: { $gte: time },
      status: { $ne: "cancelled" },
    });

    if (hasConflict) continue;

    // If passed all conditions, staff is free
    finalFreeStaff.push(user);
  }

  return finalFreeStaff;
};



export interface ITOccurence {
  start: Date,
  end: Date,
  _id: string,
  appointment: IAppoinment,
  location: {
    isOnline: boolean,
    address: string
  },
  "status": "upcoming" | "completed" | "cancelled",
  staff_ids: IUser[],
  patient: IUser
}

const allAppointments_byCompany_WithStaffStatus = async (companyId: string, query: Record<string, any>) => {

  const status = query?.status;

  const matchCondition: any = {
    'appointment.company_id': new Types.ObjectId(companyId)
  };

  if (status) {
    matchCondition.status = status; // upcoming, completed, cancelled, no_show
  }

  const result = await AppointmentOccurrence.aggregate([
    {
      $lookup: {
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointment'
      }
    },
    { $unwind: '$appointment' },
    {
      $lookup: {
        from: 'users',
        localField: 'patient_id',
        foreignField: '_id',
        as: 'patient',
        pipeline: [
          {
            $project: {
              password: 0
            }
          }
        ]
      }
    },
    { $unwind: '$patient' },
    {
      $match: matchCondition,
    },
    {
      $unwind: '$staff_ids'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'staff_ids',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: '$staffInfo' },
    {
      $lookup: {
        from: 'staffunavailabilities',
        let: { staffId: '$staff_ids', occurrenceId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$staff_id', '$$staffId'] },
                  { $eq: ['$occurrence_id', '$$occurrenceId'] }
                ]
              }
            }
          }
        ],
        as: 'unavailability'
      }
    },
    {
      $addFields: {
        staffStatus: {
          $cond: [
            { $gt: [{ $size: '$unavailability' }, 0] },
            'Unavailable',
            'Attending'
          ]
        }
      }
    },
    {
      $group: {
        _id: '$_id',
        start: { $first: '$start_datetime' },
        end: { $first: '$end_datetime' },
        status: { $first: '$status' },
        appointment: { $first: '$appointment' },
        patient: { $first: '$patient' },
        location: { $first: '$location' },
        staff_ids: {
          $push: {
            _id: '$staff_ids',
            name: '$staffInfo.name',
            email: '$staffInfo.email',
            image: '$staffInfo.image',
            status: '$staffStatus'
          }
        }
      }

    },
    {
      $sort: { start: -1 }
    }
  ]) as unknown as ITOccurence[];

  return result;
};


const allAppointments_byStaff_WithStaffStatus = async (staffId: string, query: Record<string, any>) => {
  const status = query?.status

  const matchCondition: any = {
    'staff_ids': { $in: [new Types.ObjectId(staffId)] }
  };

  if (status) {
    matchCondition.status = status; // upcoming, completed, cancelled, no_show
  }

  const result = await AppointmentOccurrence.aggregate([
    {
      $lookup: {
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointment'
      }
    },
    { $unwind: '$appointment' },
    {
      $lookup: {
        from: 'users',
        localField: 'patient_id',
        foreignField: '_id',
        as: 'patient',
        pipeline: [
          {
            $project: {
              password: 0 // X exclude password
            }
          }
        ]
      }
    },
    { $unwind: '$patient' },
    // {
    //   $match: {
    //     'staff_ids': { $in: [new Types.ObjectId(staffId)] }
    //   }
    // },
    {
      $match: matchCondition
    },
    {
      $unwind: '$staff_ids'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'staff_ids',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: '$staffInfo' },
    {
      $lookup: {
        from: 'staffunavailabilities', // কালেকশন নাম lowercase plural হবে
        let: { staffId: '$staff_ids', occurrenceId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$staff_id', '$$staffId'] }, // ✅ ঠিক ফিল্ড নাম
                  { $eq: ['$occurrence_id', '$$occurrenceId'] } // ✅ ঠিক ফিল্ড নাম
                ]
              }
            }
          }
        ],
        as: 'unavailability'
      }
    },
    {
      $addFields: {
        staffStatus: {
          $cond: [
            { $gt: [{ $size: '$unavailability' }, 0] },
            'Unavailable',
            'Attending'
          ]
        }
      }
    },
    {
      $group: {
        _id: '$_id',
        start: { $first: '$start_datetime' },
        end: { $first: '$end_datetime' },
        status: { $first: '$status' },
        appointment: { $first: '$appointment' },
        patient: { $first: '$patient' },
        location: { $first: '$location' },
        staff_ids: {
          $push: {
            _id: '$staff_ids',
            name: '$staffInfo.name',
            email: '$staffInfo.email',
            image: '$staffInfo.image',
            status: '$staffStatus'
          }
        }
      }

    },
    {
      $sort: { start: -1 }
    }
  ]) as unknown as ITOccurence[];

  return result;
};

const allAppointments_byPatient_WithStaffStatus = async (patientId: string, query: Record<string, any>) => {
  const status = query?.status

  const matchCondition: any = {
    'patient_id': new Types.ObjectId(patientId)
  };

  if (status) {
    matchCondition.status = status; // upcoming, completed, cancelled, no_show
  }

  const result = await AppointmentOccurrence.aggregate([
    {
      $lookup: {
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointment'
      }
    },
    { $unwind: '$appointment' },
    {
      $lookup: {
        from: 'users',
        localField: 'patient_id',
        foreignField: '_id',
        as: 'patient',
        pipeline: [
          {
            $project: {
              password: 0 // X exclude password
            }
          }
        ]
      }
    },
    { $unwind: '$patient' },
    // {
    //   $match: {
    //     'staff_ids': { $in: [new Types.ObjectId(staffId)] }
    //   }
    // },
    {
      $match: matchCondition
    },
    {
      $unwind: '$staff_ids'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'staff_ids',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: '$staffInfo' },
    {
      $lookup: {
        from: 'staffunavailabilities', // কালেকশন নাম lowercase plural হবে
        let: { staffId: '$staff_ids', occurrenceId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$staff_id', '$$staffId'] }, // ✅ ঠিক ফিল্ড নাম
                  { $eq: ['$occurrence_id', '$$occurrenceId'] } // ✅ ঠিক ফিল্ড নাম
                ]
              }
            }
          }
        ],
        as: 'unavailability'
      }
    },
    {
      $addFields: {
        staffStatus: {
          $cond: [
            { $gt: [{ $size: '$unavailability' }, 0] },
            'Unavailable',
            'Attending'
          ]
        }
      }
    },
    {
      $group: {
        _id: '$_id',
        start: { $first: '$start_datetime' },
        end: { $first: '$end_datetime' },
        status: { $first: '$status' },
        appointment: { $first: '$appointment' },
        patient: { $first: '$patient' },
        location: { $first: '$location' },
        staff_ids: {
          $push: {
            _id: '$staff_ids',
            name: '$staffInfo.name',
            email: '$staffInfo.email',
            image: '$staffInfo.image',
            status: '$staffStatus'
          }
        }
      }

    },
    {
      $sort: { start: -1 }
    }
  ]);

  return result;
};


const allAppoinments_By_patient = async (patient_id: string, query: Record<string, any>) => {
  const status = query?.status;
  const quer = status ? { status, patient_id } : { patient_id };

  const appoinments = await AppointmentOccurrence.find(quer).populate("appointment").populate({ path: "staff_ids", select: "-password -verification" }).populate({ path: "patient_id", select: "-password -verification" });

  return appoinments;
}

const allAppoinments_By_staff = async (staff_id: string, query: Record<string, any>) => {
  const status = query?.status;
  const quer = status ? { status, staff_ids: { $in: [staff_id] } } : { staff_ids: { $in: [staff_id] } };

  const appoinments = await AppointmentOccurrence.find(quer).populate("appointment").populate({ path: "staff_ids", select: "-password -verification" }).populate({ path: "patient_id", select: "-password -verification" });

  return appoinments;
}

type AppointmentStatus = "completed" | "cancelled" | "upcoming";

interface AppointmentStats {
  completed: number;
  cancelled: number;
  upcoming: number;
  total: number;
}

const getMonthlyAppointmentStats = async (query: Record<string, any>): Promise<AppointmentStats> => {

  const staff = query?.staff || null;
  const pattient = query?.patient || null;

  const monthYear = query?.monthYear || null;

  const now = new Date();

  const [year, month] = monthYear ? monthYear.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const matchStage: Record<string, any> = {
    start_datetime: {
      $gte: startDate,
      $lt: endDate
    }
  };

  // If staffId or patient Id provided, add filter
  if (staff && staff !== null) {
    matchStage.staff_ids = { $in: [new mongoose.Types.ObjectId(staff)] };
  }
  else if (pattient && pattient !== null) {
    matchStage.patient_id = new mongoose.Types.ObjectId(pattient);
  }

  const stats = await AppointmentOccurrence.aggregate<{ _id: AppointmentStatus; count: number }>([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const result: AppointmentStats = {
    completed: 0,
    cancelled: 0,
    upcoming: 0,
    total: 0
  };

  stats.forEach(item => {
    result[item._id] = item.count;
    result.total += item.count;
  });

  return result;
};



const updateAppointment = async (id: string, payload: IIApoinment, occurenceId: string, userId: string) => {

  const {
    start_date,
    times,
    staff_ids,
    location,
  } = payload;

  const [start, end] = times;

  const start_time = moment(start_date)
    .set({
      hour: moment(start).hour(),
      minute: moment(start).minute(),
      second: moment(start).second(),
      millisecond: moment(start).millisecond(),
    });

  const end_time = moment(start_date)
    .set({
      hour: moment(end).hour(),
      minute: moment(end).minute(),
      second: moment(end).second(),
      millisecond: moment(end).millisecond(),
    });

  const appointment = await Appointment.findByIdAndUpdate(id, payload, { new: true });

  if (!appointment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Appoinment not found',
    );
  }

  const updatedOccurrences = await AppointmentOccurrence.findOneAndUpdate({ _id: occurenceId }, { staff_ids, start_datetime: start_time, end_datetime: end_time, location }, { new: true });

  const exist = await AppointmentOccurrence.findOne({ _id: occurenceId }).populate({
    path: "patient_id",
    populate: {
      path: "patient"
    }
  })
    .populate({
      path: "staff_ids",
      populate: {
        path: "staf"
      }
    })
    .populate({
      path: "company_id",
      populate: {
        path: "company"
      }
    }).populate({
      path: "appointment",
    }) as unknown as IIOccurrencce;

  const staffs = exist?.staff_ids;
  const patient = exist?.patient_id;

  const fcmTokens: string[] = (staffs?.map(i => i?.fcmToken).filter(Boolean)) as string[] || [];

  const notifications = (staffs?.map(i => {
    if (i?.fcmToken) {
      return {
        title: `Appointment Updated`,
        message: `A appointment Updated at ${moment(exist.start_datetime).format('MMMM Do YYYY, h:mm:ss a')} for ${exist?.patient_id?.name} patient`,
        receiver: i._id,
        receiverEmail: i.email,
        receiverRole: i.role,
        sender: userId ? new Types.ObjectId(userId) : i._id
      } satisfies INotification;
    }
    return null;
  }) ?? []).filter((n): n is NonNullable<typeof n> => n !== null);

  // for patient
  patient?.fcmToken && fcmTokens.push(patient?.fcmToken)

  notifications.push({
    title: `Appointment Updated`,
    message: `A Appointment Updated to ${moment(exist.start_datetime).format('MMMM Do YYYY, h:mm:ss a')} date`,
    receiver: exist?.patient_id?._id,
    receiverEmail: exist?.patient_id?.email,
    receiverRole: exist?.patient_id?.role,
    sender: new Types.ObjectId(userId)
  })

  if (fcmTokens?.length > 0) {
    sendNotification(fcmTokens, notifications, { title: `Appointment Updated`, message: `A appointment is Updated to ${moment(exist.start_datetime).format('MMMM Do YYYY, h:mm:ss a')} date` });
  }

  const patient_cancel_temp = path.join(
    __dirname,
    '../../public/view/appointment_reschedule_patient.html',
  );

  // ---------send cancelletion email to patient ----------
  if (exist?.company_id?.company?.msg_templates?.email?.isActive && patient?.patient?.contactPreferences?.allowEmail) {
    sendEmail(
      patient?.email,
      'Appoinment Updated',
      fs
        .readFileSync(patient_cancel_temp, 'utf8')
        .replace('{{name}}', patient?.name)
        .replace('{{service}}', exist?.appointment?.title)
        .replace('{{start_date}}', moment(exist?.start_datetime).format("MMMM Do YYYY"))
        .replace('{{start_time}}', moment(exist?.start_datetime).format("h:mm a"))
        .replace('{{end_time}}', moment(exist?.end_datetime).format("h:mm a"))
        .replace('{{location}}', exist?.location?.address)
    );
  }

  // ---------send reminder to staffs email----------
  const staff_cancel_temp = path.join(
    __dirname,
    '../../public/view/appointment_reschedule_staff.html',
  );

  if (exist?.company_id?.company?.msg_templates?.email?.isActive) {
    for (let staff of staffs) {

      if (staff?.email) {
        sendEmail(
          staff?.email,
          'Appoinment Updated',
          fs
            .readFileSync(staff_cancel_temp, 'utf8')
            .replace('{{name}}', staff?.name)
            .replace('{{service}}', exist?.appointment?.title)
            .replace('{{start_date}}', moment(exist?.start_datetime).format("MMMM Do YYYY"))
            .replace('{{start_time}}', moment(exist?.start_datetime).format("h:mm a"))
            .replace('{{patient}}', patient?.name)
            .replace('{{location}}', exist?.location?.address)
        );
      }
    }
  }

  if (!updatedOccurrences) return;

  // reschedule agenda
  reScheduleAgenda(exist, updatedOccurrences?.start_datetime)


  return appointment;
};


const sendNotificationReminder = async (occurenceId: string, userId: string) => {

  const res = await ReminderFunc({ occurenceId, userId })

  return res;
}


const appoinmentChart = async (company_id: string, query: Record<string, any>) => {
  const userYear = query?.year ?? moment().year();
  const startOfUserYear = moment().year(userYear).startOf('year');
  const endOfUserYear = moment().year(userYear).endOf('year');

  const occurrences = await AppointmentOccurrence.aggregate([
    {
      $match: {
        company_id: new Types.ObjectId(company_id),
        status: { $in: ["upcoming", "completed", "cancelled", "no_show"] },
        createdAt: {
          $gte: startOfUserYear.toDate(),
          $lte: endOfUserYear.toDate(),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          status: "$status",
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Prepare base structure: 12 months × 4 statuses
  const statuses = ["upcoming", "completed", "cancelled", "no_show"];
  const formatted = statuses.map(status => ({
    name: status,
    data: Array(12).fill(0),
  }));

  // Fill results into structure
  occurrences.forEach(entry => {
    const monthIndex = entry._id.month - 1; // 0-based
    const status = entry._id.status;
    const statusObj = formatted.find(s => s.name === status);
    if (statusObj) {
      statusObj.data[monthIndex] = entry.total;
    }
  });

  const totalAppoinment = await AppointmentOccurrence.countDocuments({ company_id: new Types.ObjectId(company_id) })

  return { data: formatted, total: totalAppoinment };
};

const appoinmentChartByStaff = async (staff_id: string, query: Record<string, any>) => {
  const userYear = query?.year ?? moment().year();
  const startOfUserYear = moment().year(userYear).startOf('year');
  const endOfUserYear = moment().year(userYear).endOf('year');

  const occurrences = await AppointmentOccurrence.aggregate([
    {
      $match: {
        staff_ids: { $in: [new Types.ObjectId(staff_id)] },
        status: { $in: ["upcoming", "completed", "cancelled", "no_show"] },
        createdAt: {
          $gte: startOfUserYear.toDate(),
          $lte: endOfUserYear.toDate(),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          status: "$status",
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Prepare base structure: 12 months × 4 statuses
  const statuses = ["upcoming", "completed", "cancelled", "no_show"];
  const formatted = statuses.map(status => ({
    name: status,
    data: Array(12).fill(0),
  }));

  // Fill results into structure
  occurrences.forEach(entry => {
    const monthIndex = entry._id.month - 1; // 0-based
    const status = entry._id.status;
    const statusObj = formatted.find(s => s.name === status);
    if (statusObj) {
      statusObj.data[monthIndex] = entry.total;
    }
  });

  const totalAppoinment = await AppointmentOccurrence.countDocuments({ staff_ids: { $in: [new Types.ObjectId(staff_id)] } });

  return { data: formatted, total: totalAppoinment };
};

const appoinmentChartByPatient = async (patient_id: string, query: Record<string, any>) => {
  const userYear = query?.year ?? moment().year();
  const startOfUserYear = moment().year(userYear).startOf('year');
  const endOfUserYear = moment().year(userYear).endOf('year');

  const occurrences = await AppointmentOccurrence.aggregate([
    {
      $match: {
        patient_id: new Types.ObjectId(patient_id),
        status: { $in: ["upcoming", "completed", "cancelled", "no_show"] },
        createdAt: {
          $gte: startOfUserYear.toDate(),
          $lte: endOfUserYear.toDate(),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          status: "$status",
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Prepare base structure: 12 months × 4 statuses
  const statuses = ["upcoming", "completed", "cancelled", "no_show"];
  const formatted = statuses.map(status => ({
    name: status,
    data: Array(12).fill(0),
  }));

  // Fill results into structure
  occurrences.forEach(entry => {
    const monthIndex = entry._id.month - 1; // 0-based
    const status = entry._id.status;
    const statusObj = formatted.find(s => s.name === status);
    if (statusObj) {
      statusObj.data[monthIndex] = entry.total;
    }
  });

  const totalAppoinment = await AppointmentOccurrence.countDocuments({ patient_id: new Types.ObjectId(patient_id) });

  return { data: formatted, total: totalAppoinment };
};



export const appoinmentsService = {
  createAppointment,
  updateStatusOccurence,
  getFreeStaff,
  allAppointments_byCompany_WithStaffStatus,
  allAppointments_byStaff_WithStaffStatus,
  allAppointments_byPatient_WithStaffStatus,
  updateAppointment,
  markStaffUnavailable,
  sendNotificationReminder,
  allAppoinments_By_patient,
  allAppoinments_By_staff,
  getMonthlyAppointmentStats,
  appoinmentChart,
  appoinmentChartByStaff,
  appoinmentChartByPatient
}