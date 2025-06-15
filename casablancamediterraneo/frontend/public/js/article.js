async function loadArticle() {
    // Obtener el ID del artículo de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id') || sessionStorage.getItem("selectedArticleId");
    
    if (!articleId) {
        showError("No se encontró el artículo solicitado.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/notion/articles/${articleId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener el artículo: ${response.status}`);
        }
        const article = await response.json();
        displayArticle(article);
        setupNavigation();
    } catch (error) {
        console.error("Error al cargar el artículo:", error);
        showError("No se pudo cargar el artículo. Por favor, intenta de nuevo más tarde.");
    }
}
  
function displayArticle(article) {
    
    // Función auxiliar para actualizar elementos de forma segura
    const updateElement = (id, content, isHTML = false) => {
        const element = document.getElementById(id);
        if (element) {
            if (isHTML) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
        } else {
            console.warn(`Elemento con ID ${id} no encontrado`);
        }
    };

    // Actualizar título
    updateElement("article-title", article.title);
    
    // Actualizar información del autor y fecha
    updateElement("article-author", `Por ${article.author}`);
    updateElement("article-date", formatDate(article.date));
    
    // Actualizar imagen del artículo (si existe)
    const articleImage = document.getElementById("article-image");
    if (articleImage) {
        if (article.image) {
            articleImage.src = article.image;
            articleImage.style.display = "block";
        } else {
            articleImage.style.display = "none";
        }
    }
    
    // Actualizar contenido - ahora el contenido ya viene formateado del backend
    updateElement("article-content", article.content, true);
    
    // Actualizar título de la página
    document.title = `${article.title} - Casablanca Mediterráneo`;
}

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

function setupNavigation() {
    // Configurar botón de volver
    const backButton = document.querySelector('.article-navigation .btn-outline-primary');
    if (backButton) {
        backButton.addEventListener("click", (e) => {
            e.preventDefault();
            // Redirigir a la página principal y simular clic en el enlace de blog
            window.location.href = "index.html";
            // Esperamos a que se cargue la página principal
            setTimeout(() => {
                const blogLink = document.querySelector('a[data-section="blog"]');
                if (blogLink) {
                    blogLink.click();
                }
            }, 100);
        });
    }

    // Configurar botón de compartir
    const shareButton = document.querySelector(".share-buttons button");
    if (shareButton) {
        shareButton.addEventListener("click", shareArticle);
    }
}

function shareArticle() {
    if (navigator.share) {
        navigator.share({
            title: document.getElementById("article-title")?.textContent || "Artículo",
            text: "¡Mira este artículo interesante!",
            url: window.location.href
        })
        .catch(error => console.log("Error al compartir:", error));
    } else {
        // Fallback para navegadores que no soportan la API de compartir
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => alert("¡Enlace copiado al portapapeles!"))
            .catch(err => console.error("Error al copiar el enlace:", err));
    }
}

function showError(message) {
    const container = document.querySelector(".container");
    if (!container) {
        console.error("No se encontró el contenedor para mostrar el error");
        return;
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger";
    errorDiv.textContent = message;
    container.prepend(errorDiv);
}

// Asegurarse de que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
    // Verificar que estamos en la página correcta
    if (document.getElementById("article-title")) {
        loadArticle();
    } else {
        console.log("No se encontró el elemento article-title, no estamos en la página de artículo");
    }
});
  