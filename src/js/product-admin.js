document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM (panel y tarjeta)
    const alertsContainer = document.getElementById('alerts-container');

    // CREATE panel
    const createIdInput = document.getElementById('create-product-id-input');
    const createImageInput = document.getElementById('create-image-url-input');
    const createBtn = document.getElementById('create-action-button');

    // Campos en la tarjeta
    const productImage = document.getElementById('product-image');
    const categoryInput = document.getElementById('category-input');
    const brandInput = document.getElementById('brand-input');
    const genderInput = document.getElementById('gender-input');
    const productNameInput = document.getElementById('product-name-input');
    const productDescriptionInput = document.getElementById('product-description-input');
    const priceInput = document.getElementById('price-input');
    const productGrid = document.getElementById('product-grid');

    // Función para cargar productos desde localStorage
    function loadProducts() {
        const products = getProducts();
        productGrid.innerHTML = ''; // Limpiar la grid antes de cargar
        products.forEach(product => {
            displayProduct(product);
        });
    }

    // Función para obtener productos desde localStorage
    function getProducts() {
        const products = JSON.parse(localStorage.getItem('motohub_products')) || [];
        return products;
    }

    // Función para crear una tarjeta de producto
    function displayProduct(product) {
        const productCard = document.createElement('div');
        productCard.classList.add('prod');
        
        productCard.innerHTML = `
            <img class="img-prod" src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p>${product.price} $</p>
            <button class="ver-mas">Ver más</button>
            <button class="comprar">Comprar</button>
        `;
        
        productGrid.appendChild(productCard);
    }

    // Función para guardar un producto en localStorage
    function saveProduct(product) {
        const products = getProducts();
        products.push(product);
        localStorage.setItem('motohub_products', JSON.stringify(products));
    }

    // Evento para manejar el clic en el botón "Agregar Producto"
    if (createBtn) {
        createBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Prevenir el comportamiento por defecto del botón

            const name = productNameInput.value.trim();
            const description = productDescriptionInput.value.trim();
            const price = parseFloat(priceInput.value.trim());
            const category = categoryInput.value.trim();
            const brand = brandInput.value.trim();
            const gender = genderInput.value.trim();
            const image = createImageInput.value.trim();

            // Validación de datos
            if (!name || !description || !price || !image) {
                alert('Por favor, llena todos los campos');
                return;
            }

            // Crear un nuevo objeto producto
            const newProduct = {
                id: new Date().getTime().toString(), // Generamos un ID único
                name,
                description,
                price,
                category,
                brand,
                gender,
                image
            };

            // Guardar el producto en localStorage
            saveProduct(newProduct);

            // Limpiar formulario
            productNameInput.value = '';
            productDescriptionInput.value = '';
            priceInput.value = '';
            categoryInput.value = '';
            brandInput.value = '';
            genderInput.value = '';
            createImageInput.value = '';

            // Recargar los productos para mostrarlos en la interfaz
            loadProducts();
        });
    }

    // Vista previa en vivo para URLs de imagen (create / modify)
    function trySetPreview(url) {
        const u = (url || '').trim();
        if (!u) {
            productImage.src = '../assets/images/avatar.png';
            return;
        }
        const t = new Image();
        t.onload = () => { productImage.src = u; };
        t.onerror = () => { productImage.src = '../assets/images/avatar.png'; };
        t.src = u;
    }

    if (createImageInput) createImageInput.addEventListener('input', () => trySetPreview(createImageInput.value));
});
