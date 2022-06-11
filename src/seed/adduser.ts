import * as Users from "../models/users";
import * as logger from "../models/logs";

export function createUserOnStartUp() {
  let userObj = {
    name: "Admin",
    email: "admin@ineuron.com",
    password: "admin@1234",
    role: Users.ROLE.MENTOR,
  };

  Users.findByUserId(userObj.email, (err, result) => {
    if (err) {
      logger.error(logger.DEFAULT_MODULE, null, "error = " + err);
      return;
    }

    if (!result) {
      Users.createSaltedPassword(
        userObj.password,
        function (err, hashedPassword) {
          if (err) {
            console.log(err);
            return;
          }

          userObj.password = hashedPassword;

          Users.createUser(userObj, (err, data) => {
            if (err) {
              logger.error(logger.DEFAULT_MODULE, null, "error = " + err);
            } else {
              // console.log("seed user", data[0]._id);
              if (data[0]._id) {
                logger.debug(
                  logger.DEFAULT_MODULE,
                  null,
                  `User: ${data[0].email} created on start up`
                );
              } else {
                logger.debug(
                  logger.DEFAULT_MODULE,
                  null,
                  `Failed to seed user: ${userObj.email}`
                );
              }
            }
          });
        }
      );
    }
  });
}
