// sql queries for authentication

const insertSignup = `insert into user( fullName, email, password, salt, otp) values(?,?,?,?,?)`;

const checkEmailLogin = `select * from user where email = ?`;

const checkotp = `select * from user where otp = ?`;

const updateLogin = "update user set password = ?, salt = ? where email = ?";

const updateVerify = "update Customer set isVerified = ?, otp = NULL where otp = ?";

const updateOTP = "update user set otp = ? where email = ?"

module.exports = {
     insertSignup,
    checkEmailLogin,
    checkotp,
    updateLogin,
    updateVerify,
    updateOTP,
}
