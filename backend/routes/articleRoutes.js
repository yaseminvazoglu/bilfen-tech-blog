const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Resim Kaydetme Ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// Herkese açık: makaleleri listeleme, tek makaleyi görme, beğenme, yorum yapma
router.get('/', articleController.getArticles);
router.put('/:id/like', articleController.likeArticle);
router.post('/:id/comments', articleController.addComment);

// Korumalı: sadece giriş yapmış kullanıcılar makale ekleyebilir/düzenleyebilir/silebilir
router.post('/', authMiddleware, upload.single('image'), articleController.createArticle);
router.put('/:id', authMiddleware, articleController.updateArticle);
router.delete('/:id', authMiddleware, articleController.deleteArticle);

module.exports = router;