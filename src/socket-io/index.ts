import * as UserModel from "../models/users";
import * as Message from "../models/chats";
const { ObjectId } = require("mongodb");
let globalIo: any;

export const EventType = {
  //chat events

  CLIENT_SEND_MESSAGE: "CLIENT_SEND_MESSAGE",
  SERVER_UPDATE_MESSAGE: "SERVER_UPDATE_MESSAGE",

  CLIENT_UPDATE_ALL_MSG_READ: "CLIENT_UPDATE_ALL_MSG_READ",
  SERVER_UPDATE_ALL_MSG_READ: "SERVER_UPDATE_ALL_MSG_READ",

  CLIENT_TYPING_MESSAGE: "CLIENT_TYPING_MESSAGE",
  SERVER_UPDATE_CLIENT_MESSAGE_STATUS: "SERVER_UPDATE_CLIENT_MESSAGE_STATUS",

  CLIENT_STOP_TYPING_MESSAGE: "CLIENT_STOP_TYPING_MESSAGE",
  SERVER_UPDATE_CLIENT_STOP_TYPING_MESSAGE:
    "SERVER_UPDATE_CLIENT_STOP_TYPING_MESSAGE",

 
  NOTIFICATION: "notification",
  READ_NOTIFICATION: "read_notification",

};

export function initSocket(io: any) {
  globalIo = io;

  io.on("connection", function (socket) {
    let userId = socket.handshake.query.userId;
    socket.id = userId;
    console.log("Socket connected", socket.id);
    //======================= chat events  ===========================

    // socket.on(EventType.CLIENT_UPLOAD_IMAGE + '-' + socket.id, (data) => {
    //   console.log('data is ', data)
    //   console.log('event:' + EventType.CLIENT_UPLOAD_IMAGE + '-' + data)

    //   // data.user = socket.user;
    //   console.log('user data', data)
    //   io.emit(
    //     EventType.SERVER_UPDATE_IMAGE_STATUS + '-' + data.TO,
    //     data.message,
    //   )
    // })

    socket.on(EventType.CLIENT_SEND_MESSAGE + "-" + socket.id, (data) => {
      data = JSON.parse(JSON.stringify(data));
      console.log("ddata", data);

      if (!data.FROM || !data.TO || !data.message || !data.messageType) {
        console.log("Missing mandatory inputs to send a message");
        return;
      }

      socket.broadcast.emit(
        EventType.SERVER_UPDATE_MESSAGE + "-" + data.TO,
        data
      );

      const messageId = data.FROM.substring(4, 16).concat(
        data.TO.substring(4, 16)
      );
      const messageId1 = data.TO.substring(4, 16).concat(
        data.FROM.substring(4, 16)
      );
      Message.findOne(
        { messageId: messageId },
        {},
        { sort: { createdOn: -1 } },
        (err, info) => {
          Message.findOne(
            { messageId: messageId1 },
            {},
            { sort: { createdOn: -1 } },
            (err, info1) => {
              if (info) {
                console.log("info");

                let obj = {
                  messageId: messageId,
                  owner: new ObjectId(data.FROM),
                  contact: new ObjectId(data.TO),
                  direction: "To",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                };

                let obj1 = {
                  messageId: messageId,
                  owner: new ObjectId(data.TO),
                  contact: new ObjectId(data.FROM),
                  direction: "From",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                };

                addMessage([obj, obj1], (err: any, result) => {
                  if (err) {
                    console.log("Error:", err);
                  } else {
                    console.log("Message added successfully",result);
                  }
                });
              } else if (info1) {
                console.log("info1..");

                let obj = {
                  messageId: messageId,
                  owner: new ObjectId(data.FROM),
                  contact: new ObjectId(data.TO),
                  direction: "To",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                };

                let obj1 = {
                  messageId: messageId,
                  owner: new ObjectId(data.TO),
                  contact: new ObjectId(data.FROM),
                  direction: "From",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                };

                addMessage([obj, obj1], (err: any, result) => {
                  if (err) {
                    console.log("Error:", err);
                  } else {
                  }
                });
              } else {
                let obj = {
                  messageId: messageId,
                  owner: new ObjectId(data.FROM),
                  contact: new ObjectId(data.TO),
                  direction: "To",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                };

                let obj1 = {
                  messageId: messageId,
                  owner: new ObjectId(data.TO),
                  contact: new ObjectId(data.FROM),
                  direction: "From",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                };

                addMessage([obj, obj1], (err: any, result) => {
                  if (err) {
                    console.log("Error:", err);
                  } else {
                    console.log("Message added successfully",result);
                  }
                });
              }
            }
          );
        }
      );

      socket.broadcast.emit(
        EventType.SERVER_UPDATE_MESSAGE + "-" + data.FROM,
        data
      );
    });
    //======================= message read  ===========================
    socket.on(
      EventType.CLIENT_UPDATE_ALL_MSG_READ + "-" + socket.id,
      (data) => {
        console.log("message", data);
        let obj = {
          isRead: true,
        };
        io.emit(EventType.SERVER_UPDATE_ALL_MSG_READ + "-" + data.TO, data);
        io.emit(EventType.SERVER_UPDATE_ALL_MSG_READ + "-" + data.FROM, data);
        updateMessage(data.messageId, obj, (err: any, result) => {
          if (err) {
            console.log("Error:", err);
          } else {
            console.log("Message added successfully", result);
          }
        });
      }
    );

    //======================= message typing  ===========================
    socket.on(EventType.CLIENT_TYPING_MESSAGE + "-" + socket.id, (data) => {
      io.emit(
        EventType.SERVER_UPDATE_CLIENT_MESSAGE_STATUS + "-" + data.TO,
        data
      );
    });

    //======================= stop message typing  ===========================

    socket.on(
      EventType.CLIENT_STOP_TYPING_MESSAGE + "-" + socket.id,
      (data) => {
        console.log("data is ", data);
        // data.user = socket.user;

        io.emit(
          EventType.SERVER_UPDATE_CLIENT_STOP_TYPING_MESSAGE + "-" + data.TO,
          data
        );
      }
    );

    
  });
}

//======================= comment video  ===========================

//==============================================================//

function addMessage(userObj, cb) {
  console.log("userObj", userObj);
  
  Message.createChat(userObj, (err, result) => {
    if (err) {
      console.log("error:", err);
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
}

function updateMessage(messageID, obj, cb) {
  Message.updateChatById(messageID, obj, (err, result) => {
    if (err) {
      console.log('error:', err)
      cb(err, null)
    } else {
      cb(null, result)
    }
  })
}
