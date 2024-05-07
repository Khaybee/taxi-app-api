const { connectDB, runQuery } = require("../../utils/database");
const { insertSignup, updateVerify, checkotp, checkEmailLogin, updateLogin, updateOTP } = require("./utils");
const ErrorResponse = require("../../utils/errorResponse");
const { authpassword, hash, generateOTP, genToken } = require("../../utils/helperFunctions");
const { sendMail } = require("../../utils/sendEmail");
const fs = require('fs');
const path = require('path');

const readEmailTemplate = (templateName) => {
  const emailTemplatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
  return emailTemplate;
};

const signup = async (req, res, next) => {

  // create a salt using the hash function created in the helper file
  const salt = hash();

  let checkUser;

  try {
    // get the users credential from the request
     const {fullName, password, email } = req.body;

    // create a connection, await is used beacuse it is a promise
    const connection = await connectDB();

    // create a variable that holds regex form of an email
    const validEmailRegex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    // check that the email entered corresponds with the regex format set above
    if (!validEmailRegex.test(email)) {
      return next(new ErrorResponse("Invalid email format", 400));
    }

    // check that the password entered meets the requirements
    if (
      !(
        password.length >= 6 &&
        /[A-Z]/.test(credentials.userpassword) &&
        /[a-z]/.test(credentials.userpassword) &&
        /[0-9]/.test(credentials.userpassword)
      )
    ) {
      return next(
        new ErrorResponse("Password does not meet the requirements", 401)
      );
    }

    // hash the password entered using the function created to hash
    password = authpassword(salt, req.body.password);


    // run a query to check if the email enetered already exists in the database but isVerified is false  
    checkUser = await runQuery(connection, checkEmailLogin, [
      credentials.email,
    ]);

    // create the emailToken using the generateotp() method
    const otp = generateOTP();

    // use the function created for running a query to insert the credentials gotten from the request into the database
    const result = await runQuery(connection, insertSignup, [
      fullName,
      email,
     password,
      salt,
      otp
    ]);

    // Read the email template
    const emailTemplate = readEmailTemplate('verificationEmail');

    const firstName = fullName.split(' ')[0];

    const emailContent = emailTemplate
      .replace('{{firstName}}', firstName)
      .replace('{{otp}}', otp);

    const options = {
      // from: "kharchiee@outlook.com",
      from: '"SaveDrive" <kharchiee@outlook.com>',
      to: email,
      subject: "Verify your email...",
      html: emailContent,
    };

    await sendMail(options);

    // send a successful message to the client side
    return res.status(200).json({
      status: true,
      message: "Account created successfully",
    });

  } catch (err) {
    if (err.errno === 1062 && err.sqlMessage.includes("email")) {
      if (checkUser[0].isVerified === true) {

        return;
      } else {
        return res.status(200).json({
          //direct user to resend verification email
          status: true,
          message: "Email already in use, verify your email...",
        });
      }
    }
    else {
      // handle errors using sql error message
      return next(err);
    }
  }
};

const verifyUserEmail = async (req, res, next) => {
  try {

     // get otp from the request body
     const otp = req.body.otp;

    // create connection to database
    const connection = await connectDB();

    console.log(otp);

    // run a query to confirm the otp enetered exists in the database
    const checkPin = await runQuery(connection, checkotp, [
      emailToken,
    ]);

    console.log(checkToken);

    if (!otp) {
      return next(new ErrorResponse("EmailToken not found....", 404));
    }

    // check that the otp in the req is the same as the stored in the database
    if (
      !checkPin ||
      checkPin.length === 0 ||
      checkPin[0].emailToken !== otp
    ) {
      return next(
        new ErrorResponse("Email Verification Failed, invalid pin", 401)
      );
    }

    isVerified = true;

     //  update user account to verified and delete pin from database
    const updateVerification = await runQuery(connection, updateVerify, [
      isVerified,
      emailToken,
    ]);

    // send a successful login message to the client side
    res.status(200).json({
      status: true,
      message: "Email Verification successful, Proceed to login",
      data: { isVerified: true, }
    });

  } catch (err) {
    // handle error using the inbult error details
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {

  // get credentials entered during login
     const {email, password} = req.body;

    // create connection to database
    const connection = await connectDB();

    // run a query to confirm the email enetered exists in the database
    const checkUser = await runQuery(connection, checkEmailLogin, [
      email,
    ]);

    // handle the case of an empty result from the query check
    if (checkUser.length === 0) {
      return next(new ErrorResponse("Account does not exist. Signup", 409));
    }

    // retrieve the salt stored in the database
    const salt = checkUser[0].salt;

    // hash the password entered during login using the salt retrieved from database
    const hashedPassword = authpassword(salt, credentials.userpassword);

    // console.log(checkUser[0].userpassword);
    // console.log(hashedPassword);

    // check that the hashed password in the previuos line of code is identical to the one stored in the database
    if (checkUser[0].userpassword != hashedPassword) {
      return next(new ErrorResponse("Wrong Password", 401));
    }

    // generate a token for the user using the genToken function created in the helper file
    const authToken = genToken(checkUser[0].cus_id);

    console.log("Login successful")

    // send a successful login message to the client side with the authentication token
    res
      .status(200)
      .json({ status: true, message: "Login successful", authToken });
  } catch (err) {
    // handle error using the inbult error details
    return next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    // since the user won't input it again, the frontend would have to send it
    const { email } = req.body;

    // create a connection, await is used beacuse it is a promise
    const connection = await connectDB();

    // create a new emailToken using the hash() method
    const newOtp = generateOTP();

    const checkEmail = await runQuery(connection, checkEmailLogin, [email])

    if (!checkEmail) {
      return next(new ErrorResponse("Invalid Email", 401))
    }

    // use the function created for running a query to insert the credentials gotten from the request into the database
    const result = await runQuery(connection, updateOTP, [
      newOtp,
      email,
    ]);

    // Read the email template
    const emailTemplate = readEmailTemplate('verificationEmail');

    const firstName = checkEmail[0].fullName.split(' ')[0];
    const otp = newOtp;

    const emailContent = emailTemplate
      .replace('{{firstName}}', firstName)
      .replace('{{otp}}', otp);


    const options = {
      // from: "kharchiee@outlook.com",
      from: '"SaveDrive" <kharchiee@outlook.com>',
      to: email,
      subject: "Verify your email...",
      html: emailContent,
    };

    await sendMail(options);

    // send a successful message to the client sde
    return res
      .status(200)
      .json({
        status: true,
        message: "Email Resent",
        data: { otp: newOtp }
      });
  } catch (err) {
    // handle errors using sql error message
    return next(err);
    // console.log(err)
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    const connection = await connectDB();

    // run query to check that email exists in database
    const checkEmail = await runQuery(connection, checkEmailLogin, [
      email,
    ]);

    // create the emailToken using the hash() method
    const otp = generateOTP();

    // handle false result
    if (checkEmail.length === 0) {
      return next(new ErrorResponse("Account does not exist. Signup", 401));
    }


    const result = await runQuery(connection, updateOTP, [
      otp,
      email,
    ]);

    // Read the email template
    const emailTemplate = readEmailTemplate('resetPassword');

    const firstName = checkEmail[0].fullName.split(' ')[0];
    const sendOTP = otp;

    const emailContent = emailTemplate
      .replace('{{firstName}}', firstName)
      .replace('{{otp}}', sendOTP);

    const options = {
      // from: "kharchiee@outlook.com",
      from: '"SaveDrive" <kharchiee@outlook.com>',
      to: email,
      subject: "Password Reset Request...",
      html: emailContent,
    };

    await sendMail(options);

    return res
      .status(200)
      .json({
        status: true,
        message: "Email sent",
        data: { otp: otp }
      });

  }
  catch (err) {
    return next(err)
  }
}

const resetPasssword = async (req, res, next) => {
  try {
    // get credentials
    const {email, password} = req.body

    // generate a salt value using the hash function
    const salt = hash();

    // handle no password inputed
    if (!password) {
      return next(new ErrorResponse("Input a new password", 401))
    }

    //hash the new password
     password = authpassword(salt, req.body.password);

    // create connection to database
    const connection = await connectDB();

    // run query to check that email exists in database
    const checkEmail = await runQuery(connection, checkEmailLogin, [
          email,
    ]);

    // handle false result
    if (checkEmail.length === 0) {
      return next(new ErrorResponse("Account does not exist. Signup", 401));
    }

    // update password and salt using query
    const updatePWD = await runQuery(connection, updateLogin, [
      password,
      salt,
      email,
    ]);

    // send successful reset message to client side
    return res
      .status(200)
      .json({ status: true, message: "Password has been reset successfully. Back to Login" });
  } catch (err) {

    // handle error
    console.error("Error during reset:", err);
    return next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    // get password
    const { current_password, password } = req.body;

    if (!current_password || !password) return next(new ErrorResponse("Input password", 400))

    // generate a salt value using the hash function
    const salt = hash();

    //hash the new password
    password = authpassword(salt, req.body.password);

    // create connection to database
    const connection = await connectDB();

    const email = req.user.email

    // run query to check that current passsword is correct
    const checkEmail = await runQuery(connection, checkEmailLogin, [
      email
    ]);

    // handle false result
    if (checkEmail.password !== current_password) {
      return next(new ErrorResponse("Incorrect Password", 401));
    }

    // update password and salt using query
    const updatePWD = await runQuery(connection, updateLogin, [
      password,
      salt,
      email,
    ]);

    // send successful reset message to client side
    return res
      .status(200)
      .json({ message: "Password changed successfully." });
  } catch (err) {

    // handle error
    console.error("Error during change:", err);
    return next(err);
  }
}

module.exports = {
  login,
  signup,
  verifyUserEmail,
  resendVerification,
  forgotPassword,
  resetPasssword,
  changePassword,
};