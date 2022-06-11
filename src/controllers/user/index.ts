import * as Users from "../../models/users";
import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../../models/models";
import * as logger from "../../models/logs";

export function addUser(req: Request | any, res: Response, next: NextFunction) {
  req.checkBody("name", "name is required").notEmpty();
  req.checkBody("userId", "userId is required").notEmpty();
  req.checkBody("password", "password is required").notEmpty();
  req.checkBody("role", "role is required").notEmpty();
  //   req.checkBody("phone", "phone is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors[0].msg,
    };
    next();
    return;
  }

  let userObj: Users.IUserModel = new Users.UserModel(req.body);

  const userJson = JSON.parse(JSON.stringify(userObj));

  Users.findByUserId(userJson.userId, (err: any, dbUser: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      logger.error(
        logger.LogModule.ROUTE,
        req.txId,
        "Error in finding user: " + err
      );
      next();
      return;
    }

    if (dbUser) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1008],
        data: "User already exists",
      };
      next();
      return;
    } else {
      Users.createSaltedPassword(
        userObj.password,
        function (err, hashedPassword) {
          if (err) {
            console.log(err);
            return;
          }
          userJson.password = hashedPassword;

          Users.createUser(userJson, (err: any, responseList: any) => {
            if (err) {
              req.apiStatus = {
                isSuccess: false,
                error: ErrorCodes[1003],
                data: err,
              };
              logger.error(
                logger.LogModule.ROUTE,
                req.txId,
                "Error in creating user: " + err
              );
              next();
              return;
            }

            req.apiStatus = {
              isSuccess: true,
              data: responseList,
            };

            next();
          });
        }
      );
    }
  });
}

export async function updateUser(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  let id = req.params.id;
  let payload: any = req.body;

  if (!id) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: "Missing user _id info",
    };
    next();
    return;
  }

  let userObj: Users.IUserModel = new Users.UserModel(payload);
    const userJson= JSON.parse(JSON.stringify(userObj))
    delete userJson._id;
    delete userJson.id;
    delete userJson.password;
    delete userJson.role;

  const password = await new Promise(function (resolve, reject) {
      console.log("i am here");
      
    if (payload.password) {
      Users.createSaltedPassword(
        payload.password,
        function (err, hashedPassword) {
          if (err) {
            reject(undefined);
          }
          resolve(hashedPassword);
        }
      );
    } else {
        resolve(undefined)
    }
    
  });

  console.log("password", password);
  
  if(payload.password){
    userJson.password = password;
  }  
    //   payload.updatedAt = Date.now();

    

  Users.updateUserById(id, userJson, (err: any, dbUser: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      next();
      return;
    }

    if (dbUser && dbUser["nModified"] == 0) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1007],
        data: err,
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      data: "User updated successfully",
    };

    next();
  });
}

export function deleteUser(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  req.checkBody("userId", "userId is required").notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors,
    };
    next();
    return;
  }

  let userId = req.body.userId;

  Users.deleteUser(userId, (err: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        data: err,
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
    };

    next();
  });
}

export function findAllUsers(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors,
    };
    next();
    return;
  }

  Users.queryUser({}, {}, {}, (err: any, result: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        data: err,
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      data: result,
    };

    next();
  });
}

export function findOneUser(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  let id = req.params.id;
  var errors = req.validationErrors();

  if (errors) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: errors,
    };
    next();
    return;
  }

  Users.findById(id, (err: any, result: any) => {
    if (err) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        data: err,
      };
      next();
      return;
    }

    req.apiStatus = {
      isSuccess: true,
      data: result,
    };

    next();
  });
}
