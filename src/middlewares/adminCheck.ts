import * as Users from "../models/users";
import { ResponseObj } from "../models/models";

export var isAdmin = (req, res, next) =>{
    // console.log(req.user);
    if(req.user.role === Users.ROLE.ADMIN){
        next();
    }else{
      let responseObj = new ResponseObj(403, "UnAuthorized:Not an Admin", null);
      res.status(responseObj.status).json(responseObj);
    }
  }