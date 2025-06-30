import mongoose, { ObjectId } from 'mongoose';

export interface Icontact {
  fullname: string;
  email: string;
  subject : string
  description: string;
}
