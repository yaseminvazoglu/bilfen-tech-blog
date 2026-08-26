const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Veritabanına başarıyla bağlanıldı! 🚀"))
  .catch((err) => console.log("Veritabanı bağlantı hatası:", err));

app.get('/', (req, res) => {
  res.send("Bilfen Blog API çalışıyor! 🎉");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda ayaklandı! Çalışıyor...`);
});