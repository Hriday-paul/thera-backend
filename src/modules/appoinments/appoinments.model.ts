
import mongoose, { model } from "mongoose";
import { IAppoinment, IOccurrencce, IStaffUnavilibility } from "./appoinments.interface";

const appointmentSchema = new mongoose.Schema<IAppoinment>({
    title: { type: String },
    appoinment_type: { type: String, enum: ["group", "individual"], default: "individual" },
    note: { type: String },
    start_date: { type: Date },
    times: { type: [Date] },
    isRepeat: { type: Boolean, default: false },
    repeat_type: {
        type: String,
        enum: ["none", "daily", "weekly", "monthly", "yearly"],
        default: "none"
    },
    repeat_count: { type: Number, default: 1 },
    staff_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
}, { timestamps: true });

const LocationSchema = new mongoose.Schema({
    isOnline : {type : Boolean, default : false},
    address : {type : String}
})

const appointmentOccurrenceSchema = new mongoose.Schema<IOccurrencce>({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointments" },
    start_datetime: { type: Date },
    end_datetime: { type: Date },
    staff_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    location : {type : LocationSchema},
    status: {
        type: String,
        enum: ["upcoming", "completed", "cancelled", "no_show"],
        default: "upcoming"
    }
}, { timestamps: true });



const staffUnavailabilitySchema = new mongoose.Schema<IStaffUnavilibility>({
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    occurrence_id: { type: mongoose.Schema.Types.ObjectId, ref: "AppointmentOccurrences" },
    reason: { type: String },
}, { timestamps: true });



export const Appointment = model<IAppoinment>("Appointments", appointmentSchema);

export const AppointmentOccurrence = mongoose.model<IOccurrencce>("AppointmentOccurrences", appointmentOccurrenceSchema);

export const StaffUnavailability = mongoose.model<IStaffUnavilibility>("StaffUnavailabilities", staffUnavailabilitySchema);


