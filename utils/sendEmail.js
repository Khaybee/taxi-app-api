const nodemailer = require('nodemailer');


exports.sendMail = async (options) => {
    
     const transporter = nodemailer.createTransport({
          service: "hotmail",
          auth: {
               user: process.env.EMAIL_ADDRESS,
               pass: process.env.EMAIL_PASS
              
          }
     });
   
     const mailOptions = {
       from: options.from,
       to: options.to,
       subject: options.subject,
       html: options.html
     };

     transporter.sendMail(mailOptions, (err, info)=>{
       if(err){
         console.log(err)
       }
       else {
         console.log("Email Sent")
       }
     });

   };
   