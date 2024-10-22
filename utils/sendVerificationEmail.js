const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  email,
  name,
  verificationToken,
  origin,
}) => {
  let subject = "Email verification";
  const verifyEmail = `${origin}/verify-email?token=${verificationToken}&email=${email}`;
  let message = `<h2>Hi ${name},</h2><br><p>Please click the following link to verify your email: <a href="${verifyEmail}">Verify email</a></p>`;

  return sendEmail({
    to: email,
    subject,
    html: message,
  });
};

module.exports = sendVerificationEmail;
