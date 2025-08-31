/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// socketIO.js
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import httpStatus from 'http-status';
import { Types } from 'mongoose';


import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import config from './config';
import AppError from './error/AppError';
import { IUser } from './modules/user/user.interface';
import { User } from './modules/user/user.models';
import Message from './modules/messages/messages.models';
import { chatService } from './modules/chat/chat.service';
import { IChat } from './modules/chat/chat.interface';
import Chat from './modules/chat/chat.models';
import { callbackFn } from './utils/CallbackFn';


const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Online users
  // const onlineUser = new Set();

  io.on('connection', async socket => {
    console.log('connected', socket?.id);

    try {
      //----------------------user token get from front end-------------------------//
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.token;
      //----------------------check Token and return user details-------------------------//
      const decode = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;

      const user: any = await User.findOneAndUpdate({ _id: decode.userId }, { isOnline: true }, { new: true }).select('-password');

      if (!user) {
        io.emit('io-error', { success: false, message: 'invalid Token' });
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }

      socket.join(user?._id?.toString());

      //----------------------user id set in online array-------------------------//
      // onlineUser.add(user?._id?.toString());

      //----------------------online array send for front end------------------------//
      // io.emit('onlineUser', Array.from(onlineUser));
      const chatList = await chatService.getMyChatList(user?._id);
      const myChat = 'chat-list::' + user?._id;

      io.emit(myChat, chatList);

      //----------------------user details and messages send for front end -->(as need to use)------------------------//
      socket.on('message-page', async (data, callback) => {

        try {

          const { userId } = data

          if (!userId) {
            callbackFn(callback, {
              success: false,
              message: 'userId is required',
            });
            io.emit('io-error', {
              success: false,
              message: 'userId id is required',
            });
          }

          const receiverDetails: IUser | null = await User.findById(
            userId,
          ).select('_id email role image name');

          if (!receiverDetails) {
            callbackFn(callback, {
              success: false,
              message: 'user is not found!',
            });
            io.emit('io-error', {
              success: false,
              message: 'user is not found!',
            });
          }
          const payload = {
            _id: receiverDetails?._id,
            name: receiverDetails?.name,
            email: receiverDetails?.email,
            image: receiverDetails?.image,
            role: receiverDetails?.role,
          };

          socket.emit('user-details', payload);

          const getPreMessage = await Message.find({
            $or: [
              { sender: user?._id, receiver: userId },
              { sender: userId, receiver: user?._id },
            ],
          }).sort({ createdAt: 1 });

          socket.emit('message', getPreMessage || []);

          // Notification
          // const allUnReaddMessage = await Message.countDocuments({
          //   receiver: user?._id,
          //   seen: false,
          // });
          // const variable = 'new-notifications::' + user?._id;
          // io.emit(variable, allUnReaddMessage);

          // const allUnReaddMessage2 = await Message.countDocuments({
          //   receiver: userId,
          //   seen: false,
          // });
          // const variable2 = 'new-notifications::' + userId;
          // io.emit(variable2, allUnReaddMessage2);

          //end Notification//
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          io.emit('io-error', { success: false, message: error });
          console.error('Error in message-page event:', error);
        }
      });

      //----------------------chat list------------------------//
      socket.on('my-chat-list', async (data, callback) => {
        try {
          const chatList = await chatService.getMyChatList(user?._id);
          const myChat = 'chat-list::' + user?._id;

          io.emit(myChat, chatList);

          callbackFn(callback, { success: true, message: chatList });
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          io.emit('io-error', { success: false, message: error.message });
        }
      });

      //----------------------chat search------------------------//
      socket.on('chat-list-search', async (data, callback) => {
        try {
          const { searchTerm } = data;

          console.log(searchTerm)

          const chatList = await chatService.getMyChatList(user?._id, searchTerm);

          console.log(chatList.length)
          const myChat = 'chat-list::' + user?._id;

          io.emit(myChat, chatList);

          callbackFn(callback, { success: true, message: chatList });
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          io.emit('io-error', { success: false, message: error.message });
        }
      });

      //----------------------seen message-----------------------//
      socket.on('seen', async (req_payload, callback) => {

        try {
          const { chatId } = req_payload;

          if (!chatId) {
            callbackFn(callback, {
              success: false,
              message: 'chatId id is required',
            });
            io.emit('io-error', {
              success: false,
              message: 'chatId id is required',
            });
          }

          const chatList: IChat | null = await Chat.findById(chatId);
          if (!chatList) {
            callbackFn(callback, {
              success: false,
              message: 'chat id is not valid',
            });
            io.emit('io-error', {
              success: false,
              message: 'chat id is not valid',
            });
            throw new AppError(httpStatus.BAD_REQUEST, 'chat id is not valid');
          }

          const messageIdList = await Message.aggregate([
            {
              $match: {
                chat: new Types.ObjectId(chatId),
                seen: false,
                sender: { $ne: new Types.ObjectId(user?._id) },
              },
            },
            { $group: { _id: null, ids: { $push: '$_id' } } },
            { $project: { _id: 0, ids: 1 } },
          ]);
          const unseenMessageIdList =
            messageIdList.length > 0 ? messageIdList[0].ids : [];

          const updateMessages = await Message.updateMany(
            { _id: { $in: unseenMessageIdList } },
            { $set: { seen: true } },
          );

          const user1 = chatList.participants[0];
          const user2 = chatList.participants[1];
          // //----------------------ChatList------------------------//
          const ChatListUser1 = await chatService.getMyChatList(
            user1.toString(),
          );

          const ChatListUser2 = await chatService.getMyChatList(
            user2.toString(),
          );


          const allUnReaddMessage = await Message.countDocuments({
            receiver: user1,
            seen: false,
          });
          const variable = 'new-notifications::' + user1;
          io.emit(variable, allUnReaddMessage);

          const allUnReaddMessage2 = await Message.countDocuments({
            receiver: user2,
            seen: false,
          });
          const variable2 = 'new-notifications::' + user2;
          io.emit(variable2, allUnReaddMessage2);

          // const getPreMessage = await Message.find({
          //   $or: [
          //     { sender: user1, receiver: user2 },
          //     { sender: user2, receiver: user1 },
          //   ],
          // }).sort({ updatedAt: 1 });

          // socket.emit('message', getPreMessage || []);

          const user1Chat = 'chat-list::' + user1;
          const user2Chat = 'chat-list::' + user2;

          io.emit(user1Chat, ChatListUser1);
          io.emit(user2Chat, ChatListUser2);

        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          console.error('Error in seen event:', error);
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('send-message', async (req_payload, callback) => {

        let payload;

        // validate payload
        if (typeof req_payload === 'string') {
          try {
            payload = JSON.parse(req_payload);
          } catch {
            return callbackFn(callback, {
              statusCode: 400,
              success: false,
              message: 'Invalid JSON payload',
            });
          }
        } else if (typeof req_payload === 'object' && req_payload !== null) {
          payload = req_payload;
        } else {
          return callbackFn(callback, {
            statusCode: 400,
            success: false,
            message: 'Payload must be an object',
          });
        }

        payload.sender = user?._id;

        const alreadyExists = await Chat.findOne({
          participants: { $all: [payload.sender, payload.receiver] },
        }).populate(['participants']);

        if (!alreadyExists) {
          const chatList = await Chat.create({
            participants: [payload.sender, payload.receiver],
          });

          payload.chat = chatList?._id;
        } else {
          payload.chat = alreadyExists?._id;
        }

        console.log("==============chatId==============", payload.chat);

        const result = await Message.create(payload);

        if (!result) {
          callbackFn(callback, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Message sent failed',
          });
        }

        // const receiverMessage = 'new-message::' + payload.chat.toString();
        const receiverMessage = 'new-message::' + payload.sender;
        const senderMessage = 'sent-message::' + payload.receiver;

        // const receiverMessage = 'new-message::' + payload.sender;
        // const senderMessage = 'sent-message::' + payload.sender; // FIXED


        // console.log( senderMessage)

        io.emit(receiverMessage, result);
        io.emit(senderMessage, result);

        // //----------------------ChatList------------------------//
        const ChatListSender = await chatService.getMyChatList(
          result?.sender.toString(),
        );
        const senderChat = 'chat-list::' + result.sender.toString();
        io.emit(senderChat, ChatListSender);

        const ChatListReceiver = await chatService.getMyChatList(
          result?.receiver.toString(),
        );

        const receiverChat = 'chat-list::' + result.receiver.toString();

        io.emit(receiverChat, ChatListReceiver);

        // Notification
        const allUnReaddMessage = await Message.countDocuments({
          receiver: result.sender,
          seen: false,
        });

        const variable = 'new-notifications::' + result.sender;
        io.emit(variable, allUnReaddMessage);
        const allUnReaddMessage2 = await Message.countDocuments({
          receiver: result.receiver,
          seen: false,
        });

        const variable2 = 'new-notifications::' + result.receiver;
        io.emit(variable2, allUnReaddMessage2);

        //end Notification//
        callbackFn(callback, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Message sent successfully!',
          data: result,
        });
      });

      //-----------------------Typing------------------------//
      socket.on('typing', function (payload, callback) {

        try {

          const { receiver } = payload

          const chat = 'typing::' + receiver.toString();
          const message = user?.first_name + ' is typing...';
          socket.emit(chat, { message: message });

        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          console.error('Error in seen event:', error);
          // socket.emit('error', { message: error.message });
        }

      });

      socket.on('stopTyping', function (payload, callback) {
        try {
          const { receiver } = payload;

          const chat = 'stopTyping::' + receiver.toString();
          const message = user?.first_name + ' is stop typing...';
          socket.emit(chat, { message: message });

        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          console.error('Error in seen event:', error);
          // socket.emit('error', { message: error.message });
        }
      });

      //-----------------------Seen All------------------------//
      socket.on('message-notification', async ({ }, callback) => {
        try {
          const allUnReaddMessage = await Message.countDocuments({
            receiver: user?._id,
            seen: false,
          });
          const variable = 'new-notifications::' + user?._id;
          io.emit(variable, allUnReaddMessage);
          callbackFn(callback, { success: true, message: allUnReaddMessage });
        } catch (error) {
          callbackFn(callback, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to retrieve notifications',
          });
        }
      });

      //-----------------------Disconnect------------------------//
      socket.on('disconnect', async () => {
        // onlineUser.delete(user?._id?.toString());
        await User.updateOne({ _id: user?._id }, { isOnline: false })
        // io.emit('onlineUser', Array.from(onlineUser));

        const chatList = await chatService.getMyChatList(user?._id);
        const myChat = 'chat-list::' + user?._id;
        io.emit(myChat, chatList);

        console.log('disconnect user ', socket.id);
      });

    } catch (error) {
      console.error('-- socket.io connection error --', error);
      socket.emit('error', { message: "connection error" })
    }
  });

  return io;
};

export default initializeSocketIO;
