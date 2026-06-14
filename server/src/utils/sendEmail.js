const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP configurations are not available, log to console
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('--- DEVELOPMENT EMAIL SIMULATION ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log('------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Use STARTTLS (not direct SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certs on relay
    }
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'TalentLens AI'} <${process.env.FROM_EMAIL || 'noreply@talentlens.ai'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
