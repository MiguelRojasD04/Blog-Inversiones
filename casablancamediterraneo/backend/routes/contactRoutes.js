const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  try {
    await sendContactEmail({ name, email, phone, message });
    res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('Error enviando el correo:', error);
    res.status(500).json({ error: 'Error enviando el mensaje. Inténtalo más tarde.' });
  }
});

module.exports = router; 