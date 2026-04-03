require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/landing-pages', require('./routes/landingPages'));
app.use('/api/users', require('./routes/users'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
