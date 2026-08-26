const jwt = require('jsonwebtoken');

// Bu fonksiyon, korumalı bir route'a istek gelmeden önce araya girer.
// Geçerli bir token varsa isteğin devam etmesine izin verir (next()),
// yoksa isteği burada durdurup 401 hatası döner.
module.exports = function (req, res, next) {
  // Token genelde şu formatta gelir: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bu işlem için giriş yapmanız gerekiyor.' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer" kelimesinden sonraki kısmı al

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bilfen_gizli_anahtar_123');
    req.userId = decoded.id; // İleride controller'da "bu isteği kim yaptı" diye lazım olursa
    next(); // Her şey yolunda, asıl işleme geç
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın.' });
  }
};