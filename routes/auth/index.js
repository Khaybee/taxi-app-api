const express = require('express')
const router = express.Router();
const {verifyAuth} = require('../../middleware/userAuth')
const { login, signup, verifyUserEmail, resendVerification, resetPasssword,forgotPassword, changePassword } = require('./signup')

// Auth Routes

// POST Requests endpoints
router.post('/register', signup);
router.post('/resetPasssword', resetPasssword);
router.post('/resend-verification', resendVerification);
router.post('/changePassword', verifyAuth, changePassword);


// GET Requests endpoints
router.get('/login', login);
router.get('/verify-email', verifyUserEmail);
router.get('/forgotPassword', forgotPassword);



module.exports = router