import { Schema, model } from 'mongoose';
import { IChat, IChatModel } from './chat.interface';

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    status: {
      type: String,
      enum: ['accepted', 'blocked'],
      default: 'accepted',
    },
  },
  { timestamps: true },
);

const Chat = model<IChat, IChatModel>('chats', chatSchema);
export default Chat;
