const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(to, subject, text) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
}

async function sendInviteEmail(email, token) {
  const link = `${process.env.FRONTEND_URL}/set-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Complete Your Account Setup",
    html: `
      <h3>Account Invitation</h3>
      <p>Click the link below to set your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

module.exports = {
  sendMail,
  sendInviteEmail,
};
