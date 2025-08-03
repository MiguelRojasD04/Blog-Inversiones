const nodemailer = require('nodemailer');

async function sendContactEmail({ name, email, phone, message }) {
  // Configuración del transporter usando Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Tu correo de Gmail
      pass: process.env.GMAIL_PASS  // Contraseña o App Password
    }
  });

  // Contenido del correo
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.CONTACT_RECEIVER || process.env.GMAIL_USER, // Destinatario
    subject: 'Nuevo mensaje de contacto desde el blog',
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `
  };

  // Enviar el correo
  await transporter.sendMail(mailOptions);
}

module.exports = { sendContactEmail }; 