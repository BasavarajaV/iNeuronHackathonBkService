import { Document, Schema, Model, model } from "mongoose";
// import { findJsonInJsonArray, addJson } from "../utils/helper";
import { config } from "../config/config";

// export const TOKEN_EXPIRY: number = 60 * 6; // 6 hours in Minutes
export const TOKEN_EXPIRY: number = 24 * 60 * 60 *1000; // 6 hours in Minutes

export interface IAccessToken {
  token: string;
  userId: Schema.Types.ObjectId;

  createdAt?: Date;
}

export interface IAccessTokenModel extends IAccessToken, Document {}

var AccessTokenSchema: Schema = new Schema(
  {
    token: {
      type: String,
      index: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: TOKEN_EXPIRY}
    },
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false,
  }
);

export const AccessTokenModel: Model<IAccessTokenModel> =
  model<IAccessTokenModel>("accesstokens", AccessTokenSchema);


export let updateToken = function (
  token: string,
  userId: string,
  cb: Function
) {
  let tokenObj = new AccessTokenModel({ token, userId });
  tokenObj.save(function (err, result) {
    cb(err, result);
  });
};

export let findByToken = function (token: string, cb: Function) {
  AccessTokenModel.findOne({ token }, function (err, result) {
    cb(err, result);
  });
};

export let deleteToken = function (userId: string | any, cb: Function) {
  AccessTokenModel.deleteMany({ userId }, {}, (err: any) => {
    cb(err);
  });
};
