const nodemailer = require("nodemailer");
const configNodemailer = require("./nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  const testAcc = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport(configNodemailer);
  let info = await transporter.sendMail({
    from: '"Ayush Kumar" <ayush@owner.email>', // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
