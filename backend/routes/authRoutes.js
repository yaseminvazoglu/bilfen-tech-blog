const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');

// Kullanıcı kayıt ve giriş yolları (POST istekleri)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Kullanıcı Profilini ve Takipçi Sayısını Getirme
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    res.json({
      followers: user.followers || [],
      following: user.following || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Takip Et / Takipten Çık İşlemi
router.post('/:username/follow', async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username }); // Takip edilecek yazar
    const currentUser = await User.findOne({ username: req.body.followerUsername }); // Tıklayan kişi

    if (!targetUser || !currentUser) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    const isFollowing = targetUser.followers.includes(currentUser.username);

    if (isFollowing) {
      // Takipten çık
      targetUser.followers = targetUser.followers.filter(u => u !== currentUser.username);
      currentUser.following = currentUser.following.filter(u => u !== targetUser.username);
    } else {
      // Takip et
      targetUser.followers.push(currentUser.username);
      currentUser.following.push(targetUser.username);
    }

    await User.updateOne({ username: targetUser.username }, { $set: { followers: targetUser.followers } });
    await User.updateOne({ username: currentUser.username }, { $set: { following: currentUser.following } });

    res.json({ success: true, isFollowing: !isFollowing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;