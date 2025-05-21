document.addEventListener('DOMContentLoaded', function() {
    // Menú hamburguesa para móviles
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
    });

    // Smooth scrolling para los enlaces del menú
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 60, // Ajuste para el header fijo
                behavior: 'smooth'
            });

            // Cerrar el menú móvil si está abierto
            navLinks.classList.remove('nav-active');
        });
    });

    // Manejo del formulario de contacto
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Aquí podrías agregar código para enviar el formulario a un servidor
        console.log('Formulario enviado:', { name, email, message });
        
        // Mostrar mensaje de éxito
        alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
        
        // Limpiar el formulario
        contactForm.reset();
    });

    // Animación al hacer scroll
    window.addEventListener('scroll', revealOnScroll);

    function revealOnScroll() {
        const elements = document.querySelectorAll('.service-card, .about, .contact');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const revealPoint = 150;
            
            if (elementPosition < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    }

    // Ejecutar al cargar la página para elementos ya visibles
    revealOnScroll();
});