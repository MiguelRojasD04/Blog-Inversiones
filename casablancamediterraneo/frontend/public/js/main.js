// Cambiar el fondo de la barra de navegación al hacer scroll
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Función para cargar una sección y actualizar la URL
function navigateToSection(section) {
  // Actualizar la URL sin recargar la página
  const newUrl = section === 'home' ? '/' : `/${section}`;
  window.history.pushState({ section }, '', newUrl);
  
  // Cargar la sección correspondiente
  if (section === 'blog') {
    loadSection("content", "sections/blog.html");
  } else if (section === 'home') {
    loadSection("content", "sections/home.html");
  } else {
    loadSection("content", `sections/${section}.html`);
  }
}

// Manejar la navegación al hacer clic en los enlaces
document.addEventListener("click", function(event) {
  if (event.target.classList.contains("nav-link")) {
    event.preventDefault();
    const section = event.target.getAttribute("data-section");
    navigateToSection(section);
  }
});

// Manejar la navegación al usar los botones de retroceso/avance del navegador
window.addEventListener('popstate', function(event) {
  if (event.state && event.state.section) {
    const section = event.state.section;
    if (section === 'blog') {
      loadSection("content", "sections/blog.html");
    } else if (section === 'home') {
      loadSection("content", "sections/home.html");
    } else {
      loadSection("content", `sections/${section}.html`);
    }
  } else {
    // Si no hay estado (por ejemplo, al cargar la página inicialmente)
    loadSection("content", "sections/home.html");
  }
});

// Cargar la sección correcta al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  const path = window.location.pathname;
  const section = path === '/' ? 'home' : path.substring(1);
  
  if (section === 'blog') {
    loadSection("content", "sections/blog.html");
  } else if (section === 'home') {
    loadSection("content", "sections/home.html");
  } else {
    loadSection("content", `sections/${section}.html`);
  }
});

// Manejar el envío del formulario de contacto
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const msgDiv = document.getElementById('contactFormMsg');
    msgDiv.textContent = '';
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        msgDiv.style.color = 'green';
        msgDiv.textContent = '¡Mensaje enviado correctamente!';
        form.reset();
      } else {
        msgDiv.style.color = 'red';
        msgDiv.textContent = result.error || 'Error enviando el mensaje.';
      }
    } catch (err) {
      msgDiv.style.color = 'red';
      msgDiv.textContent = 'Error de conexión. Inténtalo más tarde.';
    }
  });
}

// Llamar a setupContactForm cuando se cargue la sección home
function afterSectionLoad(section) {
  if (section === 'home') {
    setupContactForm();
  }
}

// Modificar loadSection para llamar a afterSectionLoad
const originalLoadSection = window.loadSection;
window.loadSection = function (containerId, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
      // Detectar la sección cargada
      const section = url.includes('home') ? 'home' : url.includes('blog') ? 'blog' : url.split('/').pop().replace('.html', '');
      afterSectionLoad(section);
    });
};

