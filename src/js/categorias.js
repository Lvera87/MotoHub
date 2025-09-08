document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const productGrid = document.getElementById('product-grid');
    const createBtn = document.getElementById('create-action-button');
    const createImageInput = document.getElementById('create-image-url-input');
    const productImage = document.getElementById('product-image');
    const categoryInput = document.getElementById('category-input');
    const brandInput = document.getElementById('brand-input');
    const genderInput = document.getElementById('gender-input');
    const productNameInput = document.getElementById('product-name-input');
    const productDescriptionInput = document.getElementById('product-description-input');
    const priceInput = document.getElementById('price-input');

    // 🟢 Opcional: select de filtro
    const filterCategory = document.getElementById('filter-category');

    // Obtener productos desde localStorage
    function getProducts() {
        return JSON.parse(localStorage.getItem('motohub_products')) || [];
    }

    // Mostrar tarjeta de producto
    function displayProduct(product) {
        const productCard = document.createElement('div');
        productCard.classList.add('prod');
        
        productCard.innerHTML = `
            <img class="img-prod" src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p><strong>${product.price} $</strong></p>
            <button class="ver-mas">Ver más</button>
            <button class="comprar">Comprar</button>
        `;
        
        productGrid.appendChild(productCard);
    }

    // 🟢 Banner dinámico según categoría
    // 🟢 Banner dinámico según categoría (motos, cascos, accesorios, botas)
function showCategoryBanner(category) {
    const bannerContainer = document.getElementById('category-banner');
    if (!bannerContainer) return;

    bannerContainer.innerHTML = ''; // limpiar antes

    // Lista de categorías válidas
    const validCategories = ["motos", "cascos", "accesorios", "botas"];

    if (category && category !== "all" && validCategories.includes(category.toLowerCase())) {
        const img = document.createElement('img');
        img.src = `/src/assets/banners/${category.toLowerCase()}.png`; // ejemplo: botas.png
        img.alt = `Sección ${category}`;
        img.classList.add('banner-img');
        bannerContainer.appendChild(img);
    } else if (category === "all" || category === "todo") {
        const img = document.createElement('img');
       // imagen general para "todo"
        img.alt = "Todos los productos";
        img.classList.add('banner-img');
        bannerContainer.appendChild(img);
    }
}


    // Cargar productos con filtro
    function loadProducts(category = "all") {
        const products = getProducts();
        productGrid.innerHTML = '';

        const filtered = category === "all"
            ? products
            : products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());

        if (filtered.length === 0) {
            productGrid.innerHTML = "<p>No hay productos en esta categoría.</p>";
        } else {
            filtered.forEach(product => displayProduct(product));
        }

        // Mostrar banner
        showCategoryBanner(category);
    }

    // Guardar producto en localStorage
    function saveProduct(product) {
        const products = getProducts();
        products.push(product);
        localStorage.setItem('motohub_products', JSON.stringify(products));
    }

    // Evento para crear producto
    if (createBtn) {
        createBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const name = productNameInput.value.trim();
            const description = productDescriptionInput.value.trim();
            const price = parseFloat(priceInput.value.trim());
            const category = categoryInput.value.trim();
            const brand = brandInput.value.trim();
            const gender = genderInput.value.trim();
            const image = createImageInput.value.trim();

            if (!name || !description || !price || !image) {
                alert('Por favor, llena todos los campos');
                return;
            }

            const newProduct = {
                id: new Date().getTime().toString(),
                name,
                description,
                price,
                category,
                brand,
                gender,
                image
            };

            saveProduct(newProduct);

            // limpiar inputs
            productNameInput.value = '';
            productDescriptionInput.value = '';
            priceInput.value = '';
            categoryInput.value = '';
            brandInput.value = '';
            genderInput.value = '';
            createImageInput.value = '';

            loadProducts(filterCategory ? filterCategory.value : "all");
        });
    }

    // Vista previa en vivo para URLs de imagen
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

    if (createImageInput) {
        createImageInput.addEventListener('input', () => trySetPreview(createImageInput.value));
    }

    // 🟢 Filtro con <select> (si existe en el HTML)
    if (filterCategory) {
        filterCategory.addEventListener("change", () => {
            loadProducts(filterCategory.value);
        });
    }

   

    // 🚀 Al cargar: revisar si viene ?cat= en la URL
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("cat");

    if (categoryParam) {
        loadProducts(categoryParam);
    } else {
        loadProducts();
    }
});
