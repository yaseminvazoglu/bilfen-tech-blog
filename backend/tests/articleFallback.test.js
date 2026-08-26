const assert = require('assert');
const articleController = require('../controllers/articleController');

(async () => {
  const req = {};
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  await articleController.getArticles(req, res);

  assert.ok(Array.isArray(res.payload), 'Expected getArticles to return an array');
  assert.ok(res.payload.length > 0, 'Expected fallback article data to exist');
  console.log(`fallback articles loaded: ${res.payload.length}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
