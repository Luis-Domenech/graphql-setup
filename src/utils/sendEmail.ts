import nodemailer from "nodemailer";

export async function sendEmail(from: string, to: string, subject: string, html: string) {
  // let testAccount = await nodemailer.createTestAccount();
  // console.log('testAccount', testAccount)

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.TEST_EMAIL, 
      pass: process.env.TEST_EMAIL_PASS, 
    },
  });

  let info = await transporter.sendMail({
    // from: '"Fred Foo 👻" <foo@example.com>', // sender address
    from: from,
    to: to, 
    subject: subject,
    html: html
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}