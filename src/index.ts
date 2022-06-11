import express from "express";
import { Request, Response, NextFunction } from "express";
import { config } from "./config/config";
import * as http from "http";
import * as logger from "./models/logs";
import * as Token from "./models/accesstoken";
import * as Users from "./models/users";
import { ResponseObj } from "./models/models"
import passport from "passport";
import BearerStrategy from "passport-http-bearer";
import path from "path";
import errorhandler from "errorhandler";
var expressValidator = require("express-validator");
require("dotenv").config();

import * as Socket from "./socket-io/index";

import { DB } from "./models/db";

const cors = require('cors')

const app = express();

var corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: [
    'Origin',
    'Authorization',
    'X-Requested-With',
    'Content-Type',
    'Accept',
  ],
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

const server = http.createServer(app);
const db = new DB();
const port = config.port || 8000;
const mongodbURI: string = config.mongodbURI;
const LABEL = config.serviceName;

app.set("port", port);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

//Express Validator
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

// init socket
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
Socket.initSocket(io)



if ("development" === app.get("env")) {
  logger.info(
    logger.DEFAULT_MODULE,
    null,
    "Running in Development Environment ."
  );
  app.use(errorhandler());
}

app.use(passport.initialize());

// Bring in the database!
db.connectWithRetry(mongodbURI);

// passport strategy
passport.use(
  new BearerStrategy.Strategy(function (token, done) {
    console.log("token", token);
    
    // logger.debug("Passport Token: " + token);
    Token.findByToken(token, function (err: Error, tokenFromDb: any) {
      console.log("tokenFromDb", tokenFromDb);
      
      if (err) {
        let responseObj = new ResponseObj(401, "Unauthorized", undefined);
        return done(err, false, responseObj.toJsonString());
      }
      if (!tokenFromDb) {
        let responseObj = new ResponseObj(401, "Unauthorized", undefined);
        return done(null, false, responseObj.toJsonString());
      }
      Users.findById(tokenFromDb.userId, function (err: Error, user: any) {
        if (err) {
          let responseObj = new ResponseObj(401, "Unauthorized!", undefined);
          return done(err, false, responseObj.toJsonString());
        }
        if (!user) {
          let responseObj = new ResponseObj(401, "Unauthorized!", undefined);
          return done(null, false, responseObj.toJsonString());
        }
        return done(null, user, { scope: "all", message: LABEL });
      });
    });
  })
);

//allow requests from any host
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Authorization, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST,PUT, DELETE");
  next();
});

//ROUTES


app.use("/v1/auth", require("./routes/v1/auth"));
app.use("/v1/user", require("./routes/v1/user"));
app.use("/v1/tickets", require("./routes/v1/tickets"));
app.use("/v1/queries", require("./routes/v1/queries"));
app.use("/v1/comments", require("./routes/v1/comments"));
app.use("/v1/chats", require("./routes/v1/chat"));

app.use("/test", (req, res)=>{
  return res.status(200).send("query seupport Bakcend API's are live")
});

//server static files
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "../public")));
app.get("*", (req, res) => {
  console.log(__dirname);
  res.sendFile(path.join(__dirname + "/../public/index.html"));
});

// START THE SERVER
server.listen(port, () => {
  console.log(LABEL + " is running on port " + port);
});

//catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.status(404).send("Page/Api Not Found");
  return;
});

process.on("SIGINT", function () {
  process.exit(0);
});

process.on("SIGTERM", function () {
  process.exit(0);
});

module.exports = app;
