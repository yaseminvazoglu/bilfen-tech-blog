const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. KAYIT OLMA (REGISTER)
exports.register = async (req, res) => {
  try {
    // req.body içinden email'i de alıyoruz
    const { username, email, password } = req.body;

    // Kullanıcı adı veya e-posta daha önce alınmış mı kontrol et
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor!' });
    }

    // Şifreyi şifreleme (Hash işlemi)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcıyı oluştur ve veritabanına kaydet
    const newUser = new User({
      username,
      email,       // E-postayı da kaydediyoruz
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu!' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası!', error });
  }
};


// 2. GİRİŞ YAPMA (LOGIN)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcı sistemde var mı kontrol et
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı!' });
    }

    // Şifre doğru mu kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Hatalı şifre girdiniz!' });
    }

    // Başarılı giriş: JWT Token oluştur (Dijital kimlik kartı)
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'bilfen_gizli_anahtar_123', 
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Giriş başarılı!', token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası!', error });
  }
};