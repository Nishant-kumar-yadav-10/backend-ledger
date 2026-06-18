require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendingRegistrationEmail(UserEmail, UserName) {
    const subject = 'Welcome to Our Service!';
    const text = `Hello ${UserName},\n\nThank you for registering with us! We're excited to have you on board.\n\nBest regards,\nYour Company Name`;
    const html = `<p>Hello ${UserName},</p><p>Thank you for registering with us! We're excited to have you on board.</p><p>Best regards,<br>Your Company Name</p>`;
    await sendEmail(UserEmail, subject, text, html);
}

async function sendingTransactionEmail(UserEmail, UserName, amount, fromAccount, toAccount, status) {
    const subject = 'Transaction Notification';
    const text = `Hello ${UserName},\n\nYour transaction has been processed successfully. Here are the details:\n\nAmount: ${amount}\nFrom Account: ${fromAccount}\nTo Account: ${toAccount}\nStatus: ${status}\n\nBest regards,\nYour Company Name`;
    const html = `<p>Hello ${UserName},</p><p>Your transaction has been processed successfully. Here are the details:</p><p>Amount: ${amount}</p><p>From Account: ${fromAccount}</p><p>To Account: ${toAccount}</p><p>Status: ${status}</p><p>Best regards,<br>Your Company Name</p>`;
    await sendEmail(UserEmail, subject, text, html);
}

async function sendingTransactionFailureEmail(UserEmail, UserName, amount, fromAccount, toAccount, status) {
    const subject = 'Transaction Failure Notification';
    const text = `Hello ${UserName},\n\nWe regret to inform you that your transaction has failed. Here are the details:\n\nAmount: ${amount}\nFrom Account: ${fromAccount}\nTo Account: ${toAccount}\nStatus: ${status}\n\nPlease contact support for further assistance.\n\nBest regards,\nYour Company Name`;
    const html = `<p>Hello ${UserName},</p><p>We regret to inform you that your transaction has failed. Here are the details:</p><p>Amount: ${amount}</p><p>From Account: ${fromAccount}</p><p>To Account: ${toAccount}</p><p>Status: ${status}</p><p>Please contact support for further assistance.</p><p>Best regards,<br>Your Company Name</p>`;
    await sendEmail(UserEmail, subject, text, html);
}


module.exports ={sendingRegistrationEmail,sendingTransactionEmail,sendingTransactionFailureEmail};