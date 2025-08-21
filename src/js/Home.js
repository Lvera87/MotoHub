
document.addEventListener('DOMContentLoaded', () => {
    // Referencia a las tarjetas existentes en el HTML
    const productCards = document.querySelectorAll('.prod'); // Seleccionamos todas las tarjetas .prod en el HTML

    // Función para cargar los productos desde localStorage
    function loadProducts() {
        const products = getProducts(); // Obtenemos los productos del localStorage

        // Asegurarnos de que no haya más productos que tarjetas disponibles
        if (products.length > productCards.length) {
            console.warn('Hay más productos que tarjetas disponibles. Algunos productos no se mostrarán.');
            return;
        }

        // Para cada producto almacenado, lo colocamos en una tarjeta existente
        products.forEach((product, index) => {
            const card = productCards[index];

            // Llenamos la tarjeta con los datos del producto
            card.querySelector('.img-prod').src = product.image || 'default-image.png';  // Default image in case of missing image
            card.querySelector('h2').textContent = product.name || 'Producto sin nombre';
            card.querySelector('p').textContent = product.description || 'Sin descripción disponible';
            card.querySelector('.ver-mas').setAttribute('data-id', product.id);
            card.querySelector('.comprar').setAttribute('data-id', product.id);
        });
    }

    // Función para obtener productos desde localStorage
    function getProducts() {
        return JSON.parse(localStorage.getItem('motohub_products') || '[]');
    }

    // Cargar los productos al cargar la página
    loadProducts();
});

// Leer productos desde localStorage
// Función para cargar productos desde localStorage
// Función para cargar productos desde localStorage
function loadProductsFromLocalStorage() {
    // Obtener los productos almacenados desde localStorage
    const productos = JSON.parse(localStorage.getItem('motohub_products')) || [];
    
    // Seleccionar el contenedor donde se mostrarán los productos
    const gridProductos = document.querySelector('.grid-productos');

    // Limpiar la cuadrícula antes de agregar los productos (en caso de recargar)
    gridProductos.innerHTML = '';

    // Mostrar los productos en tarjetas
    productos.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.classList.add('prod');

        // Crear el HTML dinámicamente con los datos del producto
        productCard.innerHTML = `
            <img class="img-prod" src="${producto.image}" alt="${producto.name}">
            <h2>${producto.name}</h2>
            <p>${producto.description}</p>
            <p>${producto.price} $</p>
            <button class="ver-mas">Ver más</button>
            <button class="comprar">Comprar</button>
        `;

        // Agregar la tarjeta del producto a la cuadrícula
        gridProductos.appendChild(productCard);
    });
}

// Llamar a la función para cargar los productos cuando se carga la página
window.addEventListener('DOMContentLoaded', loadProductsFromLocalStorage);

