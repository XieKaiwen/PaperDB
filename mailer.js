import nodemailer from "nodemailer";
import "dotenv/config";
//Transporter object is created when the server starts
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.GMAIL_APP_PASS,
    },
  });
export function sendVerificationEmail(email, token) {
    const mailConfigurations = {
        from: `${process.env.EMAIL_USERNAME}@gmail.com`,
        to: email,
        subject: "Email Verification",
        text: `Please kindly click on the following link to verify your email account and activate your account to finish the registration process: http://localhost:3000/verify?token=${token}. This link is valid for 30 minutes. Your support is greatly appreciated!`,
    };

    transporter.sendMail(mailConfigurations)
    .then(info => {
        console.log('Email sent successfully:', info.response);
    })
    .catch(error => {
        console.error('Error sending email:', error);
    });
}

export async function asyncSendVerificationEmail(email, token) {
    const mailConfigurations = {
        from: `${process.env.EMAIL_USERNAME}@gmail.com`,
        to: email,
        subject: "Email Verification",
        text: `Please kindly click on the following link to verify your email account and activate your account to finish the registration process: http://localhost:3000/verify?token=${token}. This link is valid for 30 minutes. Your support is greatly appreciated!`,
    };
    try {
        const info = await transporter.sendMail(mailConfigurations);
        console.log('Email sent successfully:', info.response);
    } catch (err) {
        console.error('Error sending email:', err);
    }
}
