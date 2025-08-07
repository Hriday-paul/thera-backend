import { isSameDay, getDay } from "date-fns"; // You can use date-fns for day calculations
import { User } from "../user/user.models";
import { IStaf, IUser } from "../user/user.interface";
import AppError from "../../error/AppError";
import moment from "moment";
import { IAppoinment, IOccurrencce, IStaffUnavilibility } from "./appoinments.interface";
import { Appointment, AppointmentOccurrence, StaffUnavailability } from "./appoinments.model";
import httpStatus from "http-status";


const generateOccurrences = async (appointment: IAppoinment): Promise<IOccurrencce[]> => {
  const {
    _id: appointmentId,
    start_date,
    times,
    repeat_type,
    repeat_count = 1,
    staff_ids,
  } = appointment;

  if (!start_date || !Array.isArray(times) || times.length !== 2) {
    throw new Error("Invalid or missing start_date/times for appointment.");
  }

  const [startTime, endTime] = times;

  const baseStart = moment(start_date)
    .hour(moment(startTime).hour())
    .minute(moment(startTime).minute());
  const baseEnd = moment(start_date)
    .hour(moment(endTime).hour())
    .minute(moment(endTime).minute());

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
      default:
        if (i > 0) continue;
        break;
    }

    occurrences.push({
      appointment: appointmentId,
      start_datetime: occurrenceStart.toDate(),
      end_datetime: occurrenceEnd.toDate(),
      staff_ids,
      status: "upcoming",
    });
  }

  return occurrences;
};


const createAppointment = async (companyId: string, payload: IAppoinment) => {
  const appointment = await Appointment.create({ ...payload, company_id: companyId });

  const occurrences = await generateOccurrences(appointment);

  console.log(occurrences)
  // await AppointmentOccurrence.insertMany(occurrences);

  return appointment;
};


const cancelOccurrence = async (occurrenceId: string) => {
  return await AppointmentOccurrence.findByIdAndUpdate(
    occurrenceId,
    { status: "cancelled" },
    { new: true }
  );
};


const markStaffUnavailable = async (payload: IStaffUnavilibility) => {
  return await StaffUnavailability.create(payload);
};


const getFreeStaff = async (date: Date, time: Date) => {
  const weekday = date.toLocaleString('en-US', { weekday: 'long' });

  interface ISStaff extends IUser {
    staf: IStaf
  }

  // Step 1: Get all staff who are scheduled to work on that day
  const availableUsers = await User.find({
    role: "staf",
    work_schedule: {
      $elemMatch: {
        day: weekday,
        willWork: true,
        times: time, // or use $in to check presence
      }
    }
  }).populate("staf") as ISStaff[];

  const finalFreeStaff = [];

  for (const user of availableUsers) {
    const isOff = user?.staf.offDays.some(off => {
      if (off.dates.some(d => isSameDay(d, date))) return true;

      if (off.repeat && off.repeat_type === 'weekly') {
        return getDay(date) === getDay(off.dates[0]); // same weekday
      }

      return false;
    });

    if (isOff) continue;

    // Step 3: Check if staff is already booked
    const hasConflict = await AppointmentOccurrence.exists({
      staff: user._id,
      date,
      time,
      status: { $ne: 'cancelled' }, // only consider active
    });

    if (!hasConflict) {
      finalFreeStaff.push(user);
    }
  }

  return finalFreeStaff;
};



const allAppointmentsWithStaffStatus = async () => {
  const result = await AppointmentOccurrence.aggregate([
    {
      $lookup: {
        from: 'Appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointment'
      }
    },
    { $unwind: '$appointment' },
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
        let: { staffId: '$users', occurrenceId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$staffId', '$$staffId'] },
                  { $eq: ['$occurrenceId', '$$occurrenceId'] }
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
        status: {
          $cond: [
            { $gt: [{ $size: '$unavailability' }, 0] },
            'unavailable',
            'joined'
          ]
        }
      }
    },
    {
      $group: {
        _id: '$_id',
        date: { $first: '$date' },
        appointmentId: { $first: '$appointmentId' },
        staffs: {
          $push: {
            staffId: '$staffs',
            name: '$staffInfo.name',
            status: '$status'
          }
        }
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);

  return result;
};



const updateAppointment = async (id: string, payload: IAppoinment) => {
  const appointment = await Appointment.findByIdAndUpdate(id, payload, { new: true });

  if (!appointment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Appoinment not found',
    );
  }

  const allOccurrences = await AppointmentOccurrence.find({ appointment: id });

  const completedIds = allOccurrences
    .filter(o => o.status === "completed")
    .map(o => o._id.toString());

  // Delete only non-completed occurrences
  await AppointmentOccurrence.deleteMany({
    appointment: id,
    _id: { $nin: completedIds }
  });

  const newOccurrences = await generateOccurrences(appointment); // add await
  await AppointmentOccurrence.insertMany(newOccurrences);


  return appointment;
};

export const appoinmentsService = {
  createAppointment,
  cancelOccurrence,
  getFreeStaff,
  allAppointmentsWithStaffStatus,
  updateAppointment
}