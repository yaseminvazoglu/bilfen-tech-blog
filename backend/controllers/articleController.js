const Article = require('../models/Article');

const fallbackArticles = [
  {
    _id: 'fallback-1',
    title: 'Yapay Zeka Hakkında Bilmeniz Gerekenler',
    content: 'Yapay zeka, modern iş süreçlerinin merkezinde yer alan dönüştürücü bir teknolojidir. Bu makalede temel kavramlar ve kullanım alanları açıklanır.',
    category: 'Yapay Zeka',
    author: 'yaseminv',
    likes: 1,
    comments: [],
    imageUrl: '',
    publishDate: new Date().toISOString()
  },
  {
    _id: 'fallback-2',
    title: 'Modern Çağda Siber Güvenlik',
    content: 'Siber güvenlik, dijital sistemlerin korunması ve veri güvenliğinin sürdürülmesi için olmazsa olmaz bir alandır.',
    category: 'Siber Güvenlik',
    author: 'yagmursat',
    likes: 2,
    comments: [],
    imageUrl: '',
    publishDate: new Date(Date.now() - 86400000).toISOString()
  }
];

const getFallbackArticles = () => fallbackArticles.map(article => ({
  ...article,
  _id: article._id || `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  likes: Number(article.likes || 0),
  comments: Array.isArray(article.comments) ? article.comments : [],
  imageUrl: article.imageUrl || '',
  publishDate: article.publishDate || new Date().toISOString()
}));

const findFallbackArticle = (id) => fallbackArticles.find(article => article._id === id);

// Tüm makaleleri getir (Veritabanı erişilemezse yedek veri döndür)
exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ publishDate: -1 });
    res.status(200).json(articles);
  } catch (error) {
    console.warn('MongoDB erişilemedi, yedek makale verisi döndürülüyor:', error.message);
    res.status(200).json(getFallbackArticles());
  }
};

// Yeni makale oluştur (Resim destekli)
exports.createArticle = async (req, res) => {
  try {
    const { title, content, category, author } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newArticle = new Article({
      title,
      content,
      category,
      author: author || 'Anonim',
      imageUrl
    });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    const { title, content, category, author } = req.body;
    const newArticle = {
      _id: `fallback-${Date.now()}`,
      title,
      content,
      category: category || 'Genel',
      author: author || 'Anonim',
      likes: 0,
      comments: [],
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      publishDate: new Date().toISOString()
    };

    fallbackArticles.unshift(newArticle);
    res.status(201).json(newArticle);
  }
};

// Makale Güncelle
exports.updateArticle = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content, category },
      { new: true }
    );
    res.status(200).json(updatedArticle);
  } catch (error) {
    const article = findFallbackArticle(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı' });
    }

    const { title, content, category } = req.body;
    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;
    res.status(200).json(article);
  }
};

// Makale Sil
exports.deleteArticle = async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Makale silindi' });
  } catch (error) {
    const index = fallbackArticles.findIndex(article => article._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Makale bulunamadı' });
    }

    fallbackArticles.splice(index, 1);
    res.status(200).json({ message: 'Makale silindi' });
  }
};

// Makaleyi Beğen
exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı' });
    }
    article.likes = (article.likes || 0) + 1;
    await article.save();
    res.status(200).json(article);
  } catch (error) {
    const article = findFallbackArticle(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı' });
    }

    article.likes = (article.likes || 0) + 1;
    res.status(200).json(article);
  }
};

// Yorum Ekle
exports.addComment = async (req, res) => {
  try {
    const { username, text } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı' });
    }

    article.comments.push({ username, text });
    await article.save();
    res.status(200).json(article);
  } catch (error) {
    const article = findFallbackArticle(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı' });
    }

    article.comments = article.comments || [];
    article.comments.push({ username: req.body.username || 'Misafir', text: req.body.text || '' });
    res.status(200).json(article);
  }
};