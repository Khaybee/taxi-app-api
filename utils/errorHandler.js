module.exports = errorHandler = (err, req, res, next) => {
     let error = err;
     error.message = err.message;
   
     console.log(error)
   
     // handle duplicate cases based on sql error no. and message
     if (error.errno === 1062 && error.sqlMessage.includes("email")) {
       error.message = "Email already exist"
       error.statusCode = 401
     }
     if (error.errno === 1062 && error.sqlMessage.includes("prod_type")) {
       error.message = "Product already exist"
       error.statusCode = 401
     }
     if (error.message === "jwt expired") {
       error.message = "Token Expired"
       error.statusCode = 400
     }
   
     //  send response to user
     res.status(error.statusCode || 500).json({
       status: false,
       statusCode: error.statusCode,
       message: error.message || "Server error",
   });
   };