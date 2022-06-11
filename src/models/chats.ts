import { Document, Schema, Model, model, Mongoose } from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/config";

const saltRounds = 13;

export enum STATUS {
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
}

export interface IChat {
  fromId: Schema.ObjectId;
  toId: Schema.ObjectId;
  content: string;
  messageType: string;
  mediaUrl: string;
  createdOn?: Date;
  updatedOn?: Date;
}

export interface IChatModel extends IChat, Document {}

export const ChatSchema: Schema = new Schema(
  {
    fromId: Schema.ObjectId,
    toId: Schema.ObjectId,
    content: {
      type: String,
    },

    messageType: String,
    mediaUrl: String,
    createdOn: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false,
  }
);

ChatSchema.set("toObject", { virtuals: true });
ChatSchema.set("toJSON", { virtuals: true });

export const ChatModel: Model<IChatModel> = model<IChatModel>(
  "chats",
  ChatSchema,
  "chats"
);


// export var findByChatId = function (chatId: string, cb: Function) {
//   ChatModel.findOne({ email: chatId }, function (err, Ticket) {
//     cb(err, Ticket);
//   });
// };

export var findById = function (id: Schema.Types.ObjectId, cb: Function) {
  ChatModel.findById(id).exec(function (err, Ticket) {
    cb(err, Ticket);
  });
};

export var queryChat = (
  query: any,
  projection: any,
  options: any,
  cb: Function
) => {
  ChatModel.find(query, projection, options, (err, data) => {
    cb(err, data);
  });
};

export var createChat = function (chatObj: any, cb: Function) {
  ChatModel.insertMany([chatObj], function (err, chat) {
    cb(err, chat);
  });
};

export var updateChatById = function (
  chatId: string,
  chatObj: any,
  cb: Function
) {
  ChatModel.updateOne(
    { _id: chatId },
    { $set: chatObj },
    { upsert: false },
    function (err, chat) {
      cb(err, chat);
    }
  );
};

export var aggregateChat = function (aggArray: any, cb: Function) {
    ChatModel.aggregate([aggArray], function (err, chat) {
      cb(err, chat);
    });
  };

export var deleteChat = (ChatId: string, cb: Function) => {
  ChatModel.deleteOne({ chatId: ChatId }, (err) => {
    cb(err);
  });
};
