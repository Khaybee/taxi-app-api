class ErrorResponse extends Error {
     constructor(message, statusCode) {
       super(message), (this.statusCode = statusCode);
     }
   }

//    ErrorResponse("error message", 200)
   
module.exports = ErrorResponse;