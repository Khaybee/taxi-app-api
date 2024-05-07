const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
// const { getCusByID } = require("../database/customers.sqlcommand");
const { connectDB, runQuery } = require("../utils/database");
// const {getAdminByID} = require("../database/admin.sqlcommand")

const verifyAuth = async (req, res, next) => {
  try {
    const connection = await connectDB();

    let checkUserId;

    const bearer = req.headers["authorization"];

    const auth = req.headers["auth"];


    if (typeof bearer == "undefined") {
      return next(new ErrorResponse("Unauthorized user", 404));
    }

    const token = bearer.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    if (!decoded.userid) {
      return next(new ErrorResponse("Unauthorized user", 401));
    }

    // recheck this code
    if (auth && auth == "admin-auth") {
      //get user by id for admin
      checkUserId = await runQuery(connection, getAdminByID, [
        decoded.userid,
      ]);
    } else {
      //get user by id
      checkUserId = await runQuery(connection, getCusByID, [decoded.userid]);
    }

    if (checkUserId.length === 0) {
      return next(new ErrorResponse("Unauthorized user", 401));
    }

    // add req.user

    req.user = checkUserId[0];

    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { verifyAuth };
