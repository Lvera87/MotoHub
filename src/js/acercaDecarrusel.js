document.addEventListener('DOMContentLoaded', function() {
    const carruselContainer = document.querySelector('.carrusel-container');
    const slides = carruselContainer.querySelectorAll('div');
    const prevBtn = document.querySelector('.carrusel .prev');
    const nextBtn = document.querySelector('.carrusel .next');
    
    let currentSlide = 0; 
        const slideCount = slides.length;
    
    // Función para actualizar la posición del carrusel
    function updateCarousel() {
        // Para calcular la posición 
        const slideWidth = 100 + (20 / 4); 
        carruselContainer.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
        
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === slideCount - 1;
        
        if (prevBtn.disabled) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
        
        if (nextBtn.disabled) {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    }
    
    // Evento para botones
    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentSlide < slideCount - 1) {
            currentSlide++;
            updateCarousel();
        }
    });
    
    // Auto-play del carrusel
    let autoPlayInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateCarousel();
    }, 5000);
    
    // Pausar auto-play al hacer hover
    const carrusel = document.querySelector('.carrusel');
    carrusel.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });
    
    carrusel.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slideCount;
            updateCarousel();
        }, 5000);
    });
    
    // Inicia carrusel
    updateCarousel();
    
    
});