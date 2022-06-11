import { Document, Schema, Model, model, Mongoose } from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/config";

const saltRounds = 13;

export enum ROLE {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  MENTOR = "MENTOR",
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  isEnabled: boolean;
  isActive: boolean;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserModel extends IUser, Document {}

export const UserSchema: Schema = new Schema(
  {
    name: String,
    email: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.STUDENT, ROLE.MENTOR],
      default: ROLE.STUDENT,
    },
    password: String,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
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

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export const UserModel: Model<IUserModel> = model<IUserModel>(
  "users",
  UserSchema
);

// return a salted password
export var createSaltedPassword = function (
  password: string,
  callback: Function
) {
  if (password) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(password, salt, function (err1, hash) {
        callback(err1, hash);
      });
    });
  }
};

// return a boolean after comparing salted and inptu password
export var compareSaltedPassword = function (
  password: string,
  hash: string,
  callback: Function
) {
  bcrypt.compare(password, hash, function (err, isMatch) {
    callback(err, isMatch);
  });
};

export var findByUserId = function (userId: string, cb: Function) {
  UserModel.findOne({email: userId }, function (err, User) {
    cb(err, User);
  });
};

export var findById = function (id: Schema.Types.ObjectId, cb: Function) {
  UserModel.findById(id).exec(function (err, User) {
    cb(err, User);
  });
};

export var queryUser = (query: any, projection: any, options: any, cb: Function) => {
  UserModel.find(query, projection, options, (err, data) => {
    cb(err, data);
  });
};

export var createUser = function (userObj: any, cb: Function) {
  UserModel.insertMany([userObj], function (err, user) {
    cb(err, user);
  });
};

export var updateUserById = function (
  userId: string,
  userObj: any,
  cb: Function
) {
  UserModel.updateOne(
    { _id: userId },
    { $set: userObj },
    { upsert: false },
    function (err, user) {
      cb(err, user);
    }
  );
};

export var deleteUser = (UserId: string, cb: Function) => {
  UserModel.deleteOne({ userId: UserId }, (err) => {
    cb(err);
  });
};
