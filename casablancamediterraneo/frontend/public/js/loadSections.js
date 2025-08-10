// Función para cargar secciones
async function loadSection(elementId, sectionPath) {
    try {
        const response = await fetch(sectionPath);
        
        if (!response.ok) throw new Error(`Error al cargar la sección: ${response.status}`);
        
        const content = await response.text();
        
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;

            // Si es el header, disparar evento de carga
            if (elementId === "header") {
                document.dispatchEvent(new Event('headerLoaded'));
            }

                                // Si la sección es blog.html, cargamos el script de blog.js
                    if (sectionPath.includes("sections/blog.html")) {
                        
                        // Verificar si blog.js ya está cargado
                        if (!document.querySelector('script[src="js/blog.js"]')) {
                            const script = document.createElement('script');
                            script.src = 'js/blog.js';
                            script.defer = true;
                            script.onload = function() {
                                // Esperar un poco para asegurar que el DOM esté listo
                                setTimeout(() => {
                                    if (typeof fetchArticles === 'function') {
                                        fetchArticles();
                                    }
                                }, 100);
                            };
                            script.onerror = function() {
                                console.error('Error al cargar blog.js');
                            };
                            document.body.appendChild(script);
                        } else {
                            // Si ya está cargado, solo ejecutar fetchArticles
                            if (typeof fetchArticles === 'function') {
                                fetchArticles();
                            }
                        }
                    }
        }
    } catch (error) {
        console.error('Error en loadSection:', error);
    }
}

// Función para cargar secciones comunes en todas las páginas
async function loadCommonSections() {
    // Cargar header y footer en todas las páginas
    await loadSection("header", "sections/header.html");
    await loadSection("footer", "sections/footer.html");
}

// Cargar secciones cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    // Cargar secciones comunes en todas las páginas
    loadCommonSections();

    // Solo cargar la sección de contenido si estamos en la página principal
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        loadSection("content", "sections/home.html");
    }
});
  