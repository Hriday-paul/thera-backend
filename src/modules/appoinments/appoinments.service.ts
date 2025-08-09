import { isSameDay, getDay } from "date-fns"; // You can use date-fns for day calculations
import { User } from "../user/user.models";
import { IStaf, IUser } from "../user/user.interface";
import AppError from "../../error/AppError";
import moment from "moment";
import { IAppoinment, IOccurrencce, IStaffUnavilibility } from "./appoinments.interface";
import { Appointment, AppointmentOccurrence, StaffUnavailability } from "./appoinments.model";
import httpStatus from "http-status";
import { Types } from "mongoose";


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


const getFreeStaff = async (req_date: string, time: string, companyId: string) => {

  const date = new Date(req_date);
  const timeDate = new Date(time);

  const weekday = date.toLocaleString('en-US', { weekday: 'long' });

  interface ISStaff extends IUser {
    staf: IStaf
  }

  // Step 1: Get all staff who are scheduled to work on that day

  const availableUsers = await User.aggregate([
    {
      $match: {
        role: "staf",
        staf_company_id: new Types.ObjectId(companyId)
      }
    },
    {
      $lookup: {
        from: "stafs",
        localField: "staf",
        foreignField: "_id",
        as: "staf"
      }
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
        "staf.last_name": 1
      }
    },
    {
      $match: {
        $expr: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$staf.work_schedule",
                  as: "ws",
                  cond: {
                    $and: [
                      { $eq: ["$$ws.day", weekday] },
                      { $eq: ["$$ws.willWork", true] },
                      {
                        $let: {
                          vars: {
                            startTime: { $arrayElemAt: ["$$ws.times", 0] },
                            endTime: { $arrayElemAt: ["$$ws.times", 1] },
                            inputTime: timeDate
                          },
                          in: {
                            $and: [
                              {
                                $lte: [
                                  {
                                    $add: [
                                      { $multiply: [{ $hour: "$$startTime" }, 3600] },
                                      { $multiply: [{ $minute: "$$startTime" }, 60] },
                                      { $second: "$$startTime" }
                                    ]
                                  },
                                  {
                                    $add: [
                                      { $multiply: [{ $hour: "$$inputTime" }, 3600] },
                                      { $multiply: [{ $minute: "$$inputTime" }, 60] },
                                      { $second: "$$inputTime" }
                                    ]
                                  }
                                ]
                              },
                              {
                                $gte: [
                                  {
                                    $add: [
                                      { $multiply: [{ $hour: "$$endTime" }, 3600] },
                                      { $multiply: [{ $minute: "$$endTime" }, 60] },
                                      { $second: "$$endTime" }
                                    ]
                                  },
                                  {
                                    $add: [
                                      { $multiply: [{ $hour: "$$inputTime" }, 3600] },
                                      { $multiply: [{ $minute: "$$inputTime" }, 60] },
                                      { $second: "$$inputTime" }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            0
          ]
        }
      }
    }
  ]) as ISStaff[];

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

    const hasConflict = await AppointmentOccurrence.exists({
      staff_ids: { $in: [user._id] },
      start_datetime: { $lte: timeDate },
      end_datetime: { $gte: timeDate },
      status: { $ne: 'cancelled' }
    })

    if (!hasConflict) {
      finalFreeStaff.push(user);
    }
  }

  return availableUsers;
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
  updateAppointment,
  markStaffUnavailable
}