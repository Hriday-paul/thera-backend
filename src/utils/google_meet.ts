import { google } from 'googleapis';
import { IAppoinment } from '../modules/appoinments/appoinments.interface';
import moment from 'moment';
import AppError from '../error/AppError';
import httpstatus from "http-status"

// export async function createRecurringGoogleEvent(
//   auth: any,
//   appointment: IAppoinment,
//   guestEmails: { email: string }[]
// ): Promise<string> {
//   const calendar = google.calendar('v3');

//   const [startTime, endTime] = appointment.times;
//   const timeZone = 'Asia/Dhaka';

//   // Build recurrence rule
//   let recurrenceRule: string | null = null;
//   switch (appointment.repeat_type) {
//     case 'daily':
//       recurrenceRule = `RRULE:FREQ=DAILY;COUNT=${appointment.repeat_count}`;
//       break;
//     case 'weekly':
//       recurrenceRule = `RRULE:FREQ=WEEKLY;COUNT=${appointment.repeat_count}`;
//       break;
//     case 'monthly':
//       recurrenceRule = `RRULE:FREQ=MONTHLY;COUNT=${appointment.repeat_count}`;
//       break;
//     case 'yearly':
//       recurrenceRule = `RRULE:FREQ=YEARLY;COUNT=${appointment.repeat_count}`;
//       break;
//     default:
//       recurrenceRule = null;
//   }

//   const event = {
//     summary: 'Patient Appointment',
//     start: {
//       dateTime: moment(appointment.start_date)
//         .hour(moment(startTime).hour())
//         .minute(moment(startTime).minute())
//         .second(0)
//         .format(),
//       timeZone,
//     },
//     end: {
//       dateTime: moment(appointment.start_date)
//         .hour(moment(endTime).hour())
//         .minute(moment(endTime).minute())
//         .second(0)
//         .format(),
//       timeZone,
//     },
//     reminders: {
//       useDefault: false,
//       overrides: []
//     },

//     attendees: guestEmails,

//     recurrence: recurrenceRule ? [recurrenceRule] : undefined,
//     conferenceData: {
//       createRequest: {
//         requestId: `meet-${Date.now()}`,
//         conferenceSolutionKey: { type: 'hangoutsMeet' },
//       },
//     },
//   };

//   const response = await calendar.events.insert({
//     auth,
//     calendarId: 'primary',
//     requestBody: event,
//     conferenceDataVersion: 1,
//   });

//   return response.data.hangoutLink || '';
// }

export async function createZoomMeeting(
  accessToken: string,           // OAuth token for Zoom API             // Zoom account email that will be host
  appointment: IAppoinment,
  alternativeHosts: string[]     // staff emails
): Promise<string> {

  const [startTime, endTime] = appointment.times;
  const duration = moment(endTime).diff(moment(startTime), 'minutes');

  // Build Zoom recurrence (if needed)
  let recurrence: any = undefined;
  if (appointment.repeat_type && appointment.repeat_type !== "none" && appointment.repeat_count) {
    const typeMap: Record<string, number> = {
      daily: 1,
      weekly: 2,
      monthly: 3,
    };
    recurrence = {
      type: typeMap[appointment.repeat_type],
      repeat_interval: 1,
      end_date_time: moment(appointment.start_date).add(appointment.repeat_count - 1, appointment.repeat_type as any).format(),
    };
  }

  const body = {
    topic: 'Patient Appointment',
    type: recurrence ? 8 : 2,  // 8 = recurring, 2 = single
    start_time: moment(appointment.start_date)
      .hour(moment(startTime).hour())
      .minute(moment(startTime).minute())
      .second(0)
      .toISOString(),
    duration,
    timezone: 'Asia/Dhaka',
    settings: {
      join_before_host: true,
      alternative_hosts: alternativeHosts.join(','),
    },
    recurrence,
  };

  const response = await fetch(`https://api.zoom.us/v2/users/me/meetings`, {
    method: 'POST', // Must specify POST for creating a meeting
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body), // Convert your body object to JSON
  });

  const data = await response.json();
  console.log("------------------------", data, data.join_url); // The Zoom meeting link

  if (!response.ok || data.code) {
    throw new AppError(httpstatus.BAD_REQUEST, data.message);
  }

  return data.join_url; // Zoom meeting link

}
