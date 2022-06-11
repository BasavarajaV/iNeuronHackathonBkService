import { NextFunction, query } from "express";
import mongoose = require("mongoose");
import { callbackify } from "util";
import { createBrotliCompress } from "zlib";
const { getCollectionObject } = require("../seed/getmodel");

const Schema = mongoose.Schema;
export let schema = new Schema({}, { strict: false, versionKey: false });

//insert data
export var add = (data: JSON, collectionName: string, callBack: Function) => {
  let startTime: any = new Date();
  getCollectionObject(collectionName, schema).insertMany(
    [data],
    function (err, data) {
      let responseTime = new Date().getTime() - startTime.getTime();
      callBack(err, data, responseTime);
    }
  );
};

//update data
export var updateOne = (
  data: JSON,
  id: string,
  collectionName: string,
  callBack: Function
) => {
  let startTime: any = new Date();
  getCollectionObject(collectionName, schema).updateOne(
    { _id: id },
    { $set: data },
    { upsert: false },
    function (err, data) {
      let responseTime = new Date().getTime() - startTime.getTime();
      callBack(err, responseTime);
    }
  );
};

export var upsertOne = (
  collectionName: string,
  id: string,
  data: JSON,
  callBack: Function
) => {
  let startTime: any = new Date();
  getCollectionObject(collectionName, schema).updateOne(
    { _id: id },
    { $set: data },
    { upsert: true },
    function (err, data) {
      let responseTime = new Date().getTime() - startTime.getTime();
      callBack(err, responseTime);
    }
  );
};

//find one
export var findOne = (
  id: string,
  collectionName: string,
  callBack: Function
) => {
  let startTime: any = new Date();
  getCollectionObject(collectionName, schema)
    .findById(id)
    .exec(function (err, data) {
      let responseTime = new Date().getTime() - startTime.getTime();
      callBack(err, data, responseTime);
    });
};
//delete data
export var deleteOne = (
  id: string,
  collectionName: string,
  callBack: Function
) => {
  let startTime: any = new Date();
  getCollectionObject(collectionName, schema).deleteOne(
    { _id: id },
    function (err) {
      let responseTime = new Date().getTime() - startTime.getTime();
      callBack(err, responseTime);
    }
  );
};


// for collections crud

export var addRecord: any = (collectionName: string, data: any): any => {
  let startTime: any = new Date();
  if (data && !data.length) {
    data = [data];
  }
  return getCollectionObject(collectionName, schema).insertMany(data);
};

// update record

export var updateRecord: any = (
  collectionName: string,
  id: any,
  data: any
): any => {
  return getCollectionObject(collectionName, schema).updateOne(
    { _id: id },
    { $set: data },
    { upsert: false }
  );
};

export var deleteRecord: any = (collectionName: string, id: any): any => {
  return getCollectionObject(collectionName, schema).deleteOne({ _id: id });
};

export var aggregate: any = (
  collectionName: string,
  aggregateArray: any
): any => {
  return getCollectionObject(collectionName, schema).aggregate(aggregateArray);
};

export var getTotalCountByAggregate = function (collectionName, array: any) {
  return getCollectionObject(collectionName, schema).aggregate([
    ...array,
    { $count: "total_count" },
  ]);
};

