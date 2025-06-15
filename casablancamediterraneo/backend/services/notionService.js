const axios = require('axios');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function getNotionArticles() {
  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      }
    );

    const results = response.data.results.filter(
      page => page.properties["Publicar"]?.checkbox
    );

    const articles = results.map(page => {
      // Obtener el contenido del artículo
      const content = page.properties["Contenido"]?.rich_text
        ?.map(text => text.text.content)
        .join(' ') || "";

      // Calcular palabras (aproximadamente)
      const wordCount = content.trim().split(/\s+/).length;
      
      // Calcular tiempo de lectura (200 palabras por minuto)
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      return {
        id: page.id,
        title: page.properties["Titulo"]?.title?.[0]?.text?.content || "Sin título",
        author: page.properties["Autor"]?.people?.[0]?.name || "Anónimo",
        date: page.properties["Fecha"]?.date?.start || "Sin fecha publicación",
        image: page.properties["Imagen"]?.files?.[0]?.file?.url || 
               page.properties["Imagen"]?.files?.[0]?.external?.url || 
               "assets/placeholder.jpg",
        readingTime: `${readingTime}`
      };
    });

    return articles;
  } catch (error) {
    console.error("Error obteniendo artículos de Notion:", error.response?.data || error.message);
    throw error;
  }
}

async function getNotionArticleById(articleId) {
  try {
    
    // Obtenemos la página
    const pageResponse = await axios.get(
      `https://api.notion.com/v1/pages/${articleId}`,
      {
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      }
    );

    const page = pageResponse.data;
    if (!page) {
      throw new Error("Artículo no encontrado");
    }

    // Obtener todas las URLs de las imágenes
    const images = page.properties["Imagen"]?.files?.map(file => 
      file.file?.url || file.external?.url
    ).filter(url => url) || [];


    // Obtener el contenido del artículo (todos los bloques de texto)
    const content = page.properties["Contenido"]?.rich_text
      ?.map(text => {
        let content = text.text.content;
        
        // Si el texto tiene un enlace
        if (text.href) {
          content = `<a href="${text.href}" class="article-link" target="_blank">${content}</a>`;
        }
        
        // Si el texto está en negrita
        if (text.annotations.bold) {
          content = `<strong>${content}</strong>`;
        }
        
        // Si el texto está subrayado
        if (text.annotations.underline) {
          content = `<u>${content}</u>`;
        }
        
        // Si el texto está en cursiva
        if (text.annotations.italic) {
          content = `<em>${content}</em>`;
        }
        
        return content;
      })
      .join('\n') || "";

    
    // Dividimos el contenido en párrafos basándonos en los saltos de línea dobles
    const paragraphs = content
      .split(/\n\s*\n/)
      .filter(p => p.trim() !== '')
      .map(p => {
        
        // Detectar marcadores de imagen [IMAGEN1], [IMAGEN2], etc.
        const imageMatch = p.match(/\[IMAGEN(\d+)\]/);
        if (imageMatch) {
          const imageIndex = parseInt(imageMatch[1]) - 1; // Convertir a índice base 0
          if (images[imageIndex]) {
            return `<div class="article-image"><img src="${images[imageIndex]}" alt="Imagen ${imageIndex + 1} del artículo" loading="lazy"></div>`;
          }
        }
        
        // Si el párrafo contiene un número, un punto y un espacio (ignorando etiquetas HTML), es un título
        if (p.match(/>\s*\d+\.\s/)) {
          return `<h2 class="article-title">${p}</h2>`;
        }
        // Si el párrafo comienza con un bullet point, es una lista
        else if (p.trim().startsWith('•')) {
          return `<div class="bullet-list">${p.replace('•', '').trim()}</div>`;
        }
        // Para el resto de párrafos
        else {
          return `<p>${p}</p>`;
        }
      })
      .join('\n');


    const article = {
      title: page.properties["Titulo"]?.title?.[0]?.text?.content || "Sin título",
      content: paragraphs || "No hay contenido disponible",
      author: page.properties["Autor"]?.people?.[0]?.name || "Anónimo",
      date: page.properties["Fecha"]?.date?.start || "Sin fecha publicación",
      images: images
    };


    return article;
  } catch (error) {
    console.error("Error al obtener artículo de Notion:", error);
    throw error;
  }
}

module.exports = { getNotionArticles, getNotionArticleById };
