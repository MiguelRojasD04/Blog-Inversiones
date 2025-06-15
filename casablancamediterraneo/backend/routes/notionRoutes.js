const express = require('express');
const { getNotionArticles, getNotionArticleById } = require('../services/notionService');

const router = express.Router();

router.get('/articles', async (req, res) => {
  try {
    const articles = await getNotionArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo artículos' });
  }
});

router.get("/articles/:id", async (req, res) => {
  const articleId = req.params.id;

  try {
    const article = await getNotionArticleById(articleId);
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el artículo" });
  }
});


module.exports = router;
