// Función para inicializar el navbar
function initNavbar() {
    // Obtener el botón del menú y el menú desplegable
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    // Verificar que los elementos existan
    if (!navbarToggler || !navbarCollapse) {
        setTimeout(initNavbar, 100);
        return;
    }

    // Función para cerrar el menú
    function closeMenu() {
        if (navbarCollapse.classList.contains('show')) {
            navbarToggler.click();
        }
    }

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        const isClickInside = navbarCollapse.contains(event.target) || navbarToggler.contains(event.target);
        
        if (!isClickInside && navbarCollapse.classList.contains('show')) {
            closeMenu();
        }
    });

    // Cerrar el menú al hacer clic en un enlace del menú
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Cerrar el menú al cambiar el tamaño de la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) { // 992px es el breakpoint de lg en Bootstrap
            closeMenu();
        }
    });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initNavbar);

// También intentar inicializar cuando se cargue el header
document.addEventListener('headerLoaded', initNavbar); 