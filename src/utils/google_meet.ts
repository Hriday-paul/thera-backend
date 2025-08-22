import { google } from 'googleapis';
import { IAppoinment } from '../modules/appoinments/appoinments.interface';
import moment from 'moment';

export async function createRecurringGoogleEvent(
  auth: any,
  appointment: IAppoinment
): Promise<string> {
  const calendar = google.calendar('v3');

  const [startTime, endTime] = appointment.times;
  const timeZone = 'Asia/Dhaka';

  // Build recurrence rule
  let recurrenceRule: string | null = null;
  switch (appointment.repeat_type) {
    case 'daily':
      recurrenceRule = `RRULE:FREQ=DAILY;COUNT=${appointment.repeat_count}`;
      break;
    case 'weekly':
      recurrenceRule = `RRULE:FREQ=WEEKLY;COUNT=${appointment.repeat_count}`;
      break;
    case 'monthly':
      recurrenceRule = `RRULE:FREQ=MONTHLY;COUNT=${appointment.repeat_count}`;
      break;
    case 'yearly':
      recurrenceRule = `RRULE:FREQ=YEARLY;COUNT=${appointment.repeat_count}`;
      break;
    default:
      recurrenceRule = null;
  }

  const event = {
    summary: 'Patient Appointment',
    start: {
      dateTime: moment(appointment.start_date)
        .hour(moment(startTime).hour())
        .minute(moment(startTime).minute())
        .second(0)
        .format(),
      timeZone,
    },
    end: {
      dateTime: moment(appointment.start_date)
        .hour(moment(endTime).hour())
        .minute(moment(endTime).minute())
        .second(0)
        .format(),
      timeZone,
    },
    recurrence: recurrenceRule ? [recurrenceRule] : undefined,
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const response = await calendar.events.insert({
    auth,
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
  });

  return response.data.hangoutLink || '';
}