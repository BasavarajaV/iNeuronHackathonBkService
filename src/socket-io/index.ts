import * as UserModel from "../models/users";
import * as Message from "../models/chats";
// import * as Notifications from '../models/notifications'
const { ObjectId } = require("mongodb");
let globalIo: any;
// import * as reactions from '../models/reactions'
// import * as comment from '../models/comment'

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

  // CLIENT_UPLOAD_IMAGE: 'CLIENT_UPLOAD_IMAGE',
  // SERVER_UPDATE_IMAGE_STATUS: 'SERVER_UPDATE_IMAGE_STATUS',

  NOTIFICATION: "notification",
  READ_NOTIFICATION: "read_notification",

  // ADMIN_NOTIFICATION: 'ADMIN_NOTIFICATION',
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
                  // requestStatus: info.requestStatus,
                };

                let obj1 = {
                  messageId: messageId,
                  owner: new ObjectId(data.TO),
                  contact: new ObjectId(data.FROM),
                  direction: "From",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                  // requestStatus: info.requestStatus,
                };

                addMessage([obj, obj1], (err: any, result) => {
                  if (err) {
                    console.log("Error:", err);
                  } else {
                    // console.log("Message added successfully",result);
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
                  // requestStatus: info1.requestStatus,
                };

                let obj1 = {
                  messageId: messageId,
                  owner: new ObjectId(data.TO),
                  contact: new ObjectId(data.FROM),
                  direction: "From",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  timestamp: new Date(),
                  // requestStatus: info1.requestStatus,
                };

                addMessage([obj, obj1], (err: any, result) => {
                  if (err) {
                    console.log("Error:", err);
                  } else {
                    // console.log("Message added successfully",result);
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
                  // requestStatus: "ACCEPTED",
                };

                let obj1 = {
                  messageId: messageId,
                  owner: new ObjectId(data.TO),
                  contact: new ObjectId(data.FROM),
                  direction: "From",
                  message: data.message,
                  messageType: data.message === "url" ? "url" : "text",
                  // requestStatus: "PENDING",
                  timestamp: new Date(),
                };

                addMessage([obj, obj1], (err: any, result) => {
                  if (err) {
                    console.log("Error:", err);
                  } else {
                    // console.log("Message added successfully",result);
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
      // data.user = socket.user;
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

    //======================= read notification  ===========================

    // data={
    //   _id: "qwertyukjfd",-- Notification id
    //   status: true,
    // }

    // socket.on(EventType.READ_NOTIFICATION, async (data: any) => {
    //   console.log('event:' + EventType.READ_NOTIFICATION)
    //   console.log(data)
    //   try {
    //     if (data && data.notificationId) {
    //       await Notifications.updateById(
    //         data.notificationId,
    //         {
    //           status: true,
    //         },
    //         (err, notification) => {
    //           if (err) {
    //             console.log(err)
    //           }
    //           console.log('NOTIFICATION READ ' + data.notificationId)
    //         },
    //       )
    //     }
    //   } catch (error) {
    //     console.log(error)
    //   }
    // })

    //======================= comment video  ===========================

    // socket.on(EventType.CLIENT_COMMENTED_ON_VIDEO, (data: any) => {
    //   // console.log(data)
    //   if (data.notification == 'comment_Video') {
    //     let queryObj: any = {
    //       notification: data.notification ? data.notification : null,
    //       video: data.video ? data.video : null,
    //       comment: data.comment ? data.comment : null,
    //       subcomment: data.subcomment ? data.subcomment : null,
    //       to: { uid: data.to }, //creator mongoId
    //       from: {
    //         uid: data.from && data.from.uid ? data.from.uid : null,
    //         profilePicture:
    //           data.from && data.from.profilePicture
    //             ? data.from.profilePicture
    //             : null,
    //         name: data.from && data.from.username ? data.from.username : null,
    //       }, //liked by userId mongoId
    //     }

    //     addNotification(queryObj.to.uid, queryObj, () => {})
    //   }
    // })

    //======================= share video  ===========================

    // socket.on(EventType.ADMIN_NOTIFICATION, (data: any) => {
    //   console.log(data)
    //   if (data.notification == 'admin_notification') {
    //     for (let x in data.to) {
    //       let queryObj: any = {
    //         notification: data.notification ? data.notification : null,
    //         to: { uid: data['to'][x] },
    //         from: {
    //           uid: data.from && data.from.uid ? data.from.uid : null,
    //           profilePicture:
    //             data.from && data.from.profilePicture
    //               ? data.from.profilePicture
    //               : null,
    //           name: data.from && data.from.username ? data.from.username : null,
    //         },
    //         message: data.message,
    //         title: data.title,
    //       }

    //       addNotification(queryObj.to.uid, queryObj, () => {})
    //     }
    //   }
    // })
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
// export async function addNotification(userId, queryObj, cb: Function) {
//   await Notifications.insert(queryObj, async (err, notification) => {
//     if (err) {
//       console.log(err)
//       cb(err, null)
//     }

//     queryObj['_id'] = notification.id
//     sendPushNotification(userId, queryObj)
//     cb(null, notification)
//   })
// }

// export function sendPushNotification(userId: any, payload: any) {
//   console.log('push', userId)
//   console.log('payload', payload)

//   try {
//     globalIo.sockets.emit(EventType.NOTIFICATION + '-' + userId, payload)
//     console.log(
//       'SEND PUSH NOTIFICATION : success for user ' +
//         userId +
//         ' with payload ' +
//         JSON.stringify(payload),
//     )
//   } catch (error) {
//     console.log(
//       'SEND PUSH NOTIFICATION : error for user ' +
//         userId +
//         ' with error ' +
//         error,
//     )
//   }
// }

// async function addFollowers(query, cb: Function) {
//   // console.log("hhq",query);

//   Followers.createFollowers(query, async (err, result) => {
//     if (err) {
//       // console.log(err);
//       cb(err, null)
//     }
//     // console.log(result);
//     cb(null, result)
//   })
// }

// async function addFollowing(query, cb: Function) {
//   // console.log("hhq",query);

//   Following.createFollowings(query, async (err, result) => {
//     if (err) {
//       // console.log(err);
//       cb(err, null)
//     }
//     // console.log(result);
//     cb(null, result)
//   })
// }

// async function deleteFollowers(query, cb: Function) {
//   // console.log("hhq",query);

//   Followers.deleteMany(query, async (err) => {
//     if (err) {
//       // console.log(err);
//       cb(err)
//     }
//   })
// }

// async function deleteFollowing(query, cb: Function) {
//   // console.log("hhq",query);

//   Following.deleteMany(query, async (err) => {
//     if (err) {
//       // console.log(err);
//       cb(err)
//     }
//   })
// }

// //=======================================
// //friend request created
// function isFriend(data, cb) {
//   let sender = data.FROM
//   let reciever = data.TO
//   FriendList.findFriend(reciever, sender, (err: Error, userObj: any) => {
//     console.log('userObj', userObj)
//     if (err) {
//       console.log('Error: Failed to find freindlist for sender')
//     }
//     // create a request entry into FriendRequest collection if sender is not a friend
//     if (!userObj) {
//       cb(null, false)

//       let reqObj: any = {
//         requestedFrom: data.FROM,
//         requestedTo: data.TO,
//       }
//       FriendRequest.upsertFriendRequest(reqObj, (err: Error, result) => {
//         if (err) {
//           console.log('Error :: Failed to create friend rquest')
//         }
//       })
//     } else {
//       cb(null, true)
//     }
//   })
// }
