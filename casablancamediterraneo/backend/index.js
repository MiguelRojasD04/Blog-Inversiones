require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notionRoutes = require('./routes/notionRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/notion', notionRoutes);
app.use('/api/contact', contactRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
