// blog.js
const API_URL = ''; // Usar URL relativa para el mismo dominio

// Llamar a fetchArticles al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    fetchArticles();
});

let allArticles = [];

        // Función para mostrar/ocultar el spinner
        function toggleSpinner(show) {
            const spinner = document.getElementById('loading-spinner');
            const articlesList = document.getElementById('articles-list');
            
            if (spinner && articlesList) {
                if (show) {
                    spinner.classList.remove('hidden');
                    spinner.style.display = 'flex';
                    articlesList.style.display = 'none';
                } else {
                    spinner.classList.add('hidden');
                    setTimeout(() => {
                        spinner.style.display = 'none';
                        articlesList.style.display = 'flex';
                    }, 300); // Esperar a que termine la transición
                }
            } else {
                console.error('No se encontró el spinner o la lista de artículos');
            }
        }
        
        // Función para cargar los artículos
        async function fetchArticles() {
            const articlesContainer = document.getElementById("articles-list");
            if (!articlesContainer) {
                console.error('No se encontró el contenedor de artículos');
                return;
            }
        
            try {
                toggleSpinner(true);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const apiUrl = `${API_URL}/api/notion/articles`;
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) throw new Error(`Error al cargar los artículos: ${response.status}`);
                
                const articles = await response.json();
                
                allArticles = articles; // Guardar todos los artículos
                toggleSpinner(false);
                
                setTimeout(() => {
                    displayArticles(articles);
                }, 300);
                
                const urlParams = new URLSearchParams(window.location.search);
                const articleId = urlParams.get('id');
                if (articleId) {
                    loadArticle(articleId);
                }
            } catch (error) {
                console.error('Error en fetchArticles:', error);
                toggleSpinner(false);
                articlesContainer.innerHTML = '<div class="col-12 text-center"><p>Error al cargar los artículos. Por favor, intenta de nuevo más tarde.</p></div>';
            }
        }

// Función para mostrar los artículos
function displayArticles(articles) {
    const articlesContainer = document.getElementById("articles-list");
    const articleSection = document.getElementById("article-section");
    const intro = document.getElementById('blog-intro');
    const sectionTitle = document.querySelector("h2.text-center");
    
    // Mostrar el título y la introducción
    if (sectionTitle) sectionTitle.style.display = 'block';
    if (intro) intro.style.display = 'block';

    if (!articlesContainer) {
        console.error("Error: No se encontró el elemento con id 'articles-list'");
        return;
    }
  
    articlesContainer.innerHTML = ""; // Limpiar el contenedor
  
    if (!Array.isArray(articles) || articles.length === 0) {
        console.warn("No hay artículos para mostrar");
        articlesContainer.innerHTML = '<div class="col-12 text-center"><p>No hay artículos disponibles en este momento.</p></div>';
        return;
    }
  
    // Crear todos los elementos primero
    const articleElements = articles.map((article, index) => {
        if (!article || !article.title) {
            console.warn("Artículo inválido o sin título:", article);
            return null;
        }

        const articleElement = document.createElement("div");
        articleElement.classList.add("col");
        articleElement.innerHTML = `
            <div class="card h-100 shadow-sm" data-article-id="${article.id}">
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h4 mb-3">${article.title}</h3>
                    <div class="card-text flex-grow-1">
                        ${article.excerpt ? `<p class="text-muted mb-3">${article.excerpt}</p>` : ''}
                    </div>
                    <div class="card-footer bg-transparent border-top-0">
                        <p class="text-muted mb-0 small">
                            Por <strong>${article.author || "Desconocido"}</strong> | 
                            ${formatDate(article.date)} | 
                            ${article.readingTime || '5'} min de lectura
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Añadir evento de clic para mostrar el artículo
        articleElement.addEventListener('click', () => {
            const articleId = articleElement.querySelector('.card').dataset.articleId;
            loadArticle(articleId);
        });

        return articleElement;
    }).filter(Boolean);

    // Añadir los elementos al contenedor
    articleElements.forEach(element => {
        articlesContainer.appendChild(element);
    });

    // Animar los elementos secuencialmente
    articleElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate');
        }, index * 150); // 150ms de retraso entre cada artículo
    });
}

// Función para cargar un artículo específico
async function loadArticle(articleId) {
    if (!articleId) {
        console.error("Error: No se proporcionó un ID de artículo");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/notion/articles/${articleId}`);
        if (!response.ok) throw new Error('Error al cargar el artículo');
        
        const article = await response.json();
        // Añadir el ID al artículo cargado
        article.id = articleId;
        displayArticle(article);
    } catch (error) {
        console.error('Error:', error);
        showError("Error al cargar el artículo. Por favor, intenta de nuevo más tarde.");
    }
}

// Función para mostrar un artículo
function displayArticle(article) {
    if (!article || !article.id) {
        console.error("Error: Artículo inválido o sin ID");
        return;
    }

    const articlesList = document.getElementById("articles-list");
    const articleSection = document.getElementById("article-section");
    const sectionTitle = document.querySelector("h2.text-center");
    const sectionDescription = document.querySelector("p.text-center");
    const searchBar = document.querySelector(".input-group");
    
    // Ocultar la lista de artículos, el título, la descripción y la barra de búsqueda
    articlesList.style.display = "none";
    if (sectionTitle) sectionTitle.style.display = "none";
    if (sectionDescription) sectionDescription.style.display = "none";
    if (searchBar) searchBar.style.display = "none";
    articleSection.style.display = "block";

    // Actualizar el contenido del artículo
    document.getElementById("article-title").textContent = article.title;
    document.getElementById("article-author").textContent = `Por ${article.author}`;
    document.getElementById("article-date").textContent = formatDate(article.date);
    document.getElementById("article-content").innerHTML = article.content;

    // Actualizar la imagen si existe
    const articleImage = document.getElementById("article-image");
    if (article.image) {
        articleImage.src = article.image;
        articleImage.style.display = "block";
    } else {
        articleImage.style.display = "none";
    }

    // Actualizar la URL con el ID del artículo
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('id', article.id);
    window.history.pushState({ articleId: article.id }, '', currentUrl.toString());

    // Configurar el botón de volver
    const backButton = document.getElementById("back-to-blog");
    if (backButton) {
        backButton.addEventListener("click", () => {
            articleSection.style.display = "none";
            articlesList.style.display = "flex";
            if (sectionTitle) sectionTitle.style.display = "block";
            if (sectionDescription) sectionDescription.style.display = "block";
            // Mostrar la barra de búsqueda
            const searchBar = document.querySelector(".input-group");
            if (searchBar) searchBar.style.display = "flex";
            // Mostrar la introducción
            const intro = document.getElementById('blog-intro');
            if (intro) intro.style.display = 'block';
            // Limpiar el parámetro de la URL
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('id');
            window.history.pushState({}, '', currentUrl.toString());
        });
    }

    // Configurar el botón de compartir
    const shareButton = document.querySelector('.share-buttons button');
    if (shareButton) {
        shareButton.addEventListener('click', () => {
            const shareUrl = window.location.href;
            const shareTitle = article.title;
            
            if (navigator.share) {
                // Si el navegador soporta la API Web Share
                navigator.share({
                    title: shareTitle,
                    url: shareUrl
                }).catch(console.error);
            } else {
                // Fallback para navegadores que no soportan la API Web Share
                const tempInput = document.createElement('input');
                tempInput.value = shareUrl;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                // Mostrar mensaje de confirmación
                const originalText = shareButton.innerHTML;
                shareButton.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
                setTimeout(() => {
                    shareButton.innerHTML = originalText;
                }, 2000);
            }
        });
    }

    // Ocultar la intro
    const intro = document.getElementById('blog-intro');
    if (intro) intro.style.display = 'none';
}

// Función para formatear la fecha
function formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch (error) {
        console.error("Error al formatear la fecha:", error);
        return 'Fecha no disponible';
    }
}

// Función para mostrar errores
function showError(message) {
    const articleSection = document.getElementById("article-section");
    if (articleSection) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "alert alert-danger";
        errorDiv.textContent = message;
        articleSection.prepend(errorDiv);
    }
}

// Función para cargar la sección de blog
async function loadBlogSection() {
    const articlesContainer = document.getElementById("articles-list");
    if (!articlesContainer) return;

    try {
        const response = await fetch(`${API_URL}/api/notion/articles`);
        if (!response.ok) throw new Error('Error al cargar los artículos');
        
        const articles = await response.json();
        displayArticles(articles);

        // Verificar si venimos de un artículo
        if (sessionStorage.getItem("returnToBlog") === "true") {
            sessionStorage.removeItem("returnToBlog");
            // Asegurarnos de que la sección de blog esté visible
            const blogSection = document.getElementById("blog");
            if (blogSection) {
                blogSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        articlesContainer.innerHTML = '<div class="col-12 text-center"><p>Error al cargar los artículos. Por favor, intenta de nuevo más tarde.</p></div>';
    }
}

// Cargar la sección de blog cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadBlogSection);

// Cuando se vuelve al listado de artículos, mostrar la intro
function showArticlesList() {
    const intro = document.getElementById('blog-intro');
    if (intro) intro.style.display = '';
}

// Lógica de búsqueda
const searchInput = document.getElementById('search-articles');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filtered = allArticles.filter(article =>
            article.title && article.title.toLowerCase().includes(searchTerm)
        );
        displayArticles(filtered);
    });
}
  

  