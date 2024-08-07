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
export function sendEmail(email, content, title) {
    const mailConfigurations = {
        from: `${process.env.EMAIL_USERNAME}@gmail.com`,
        to: email,
        subject: title,
        text: content,
    };

    transporter.sendMail(mailConfigurations)
    .then(info => {
        console.log('Email sent successfully:', info.response);
    })
    .catch(error => {
        console.error('Error sending email:', error);
    });
}

export async function asyncSendEmail(email, content, title) {
    const mailConfigurations = {
        from: `${process.env.EMAIL_USERNAME}@gmail.com`,
        to: email,
        subject: title,
        text: content,
    };
    try {
        const info = await transporter.sendMail(mailConfigurations);
        console.log('Email sent successfully:', info.response);
    } catch (err) {
        console.error('Error sending email:', err);
    }
}
