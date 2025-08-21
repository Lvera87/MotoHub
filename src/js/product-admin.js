// ===== ADMINISTRACIÓN DE PRODUCTOS =====
// Sistema de CRUD para productos con interfaz de tarjeta editable

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM (panel y tarjeta)
    const alertsContainer = document.getElementById('alerts-container');

    // CREATE panel
    const createIdInput = document.getElementById('create-product-id-input');
    const createImageInput = document.getElementById('create-image-url-input');
    const createBtn = document.getElementById('create-action-button');

    // MODIFY panel
    const modifyIdInput = document.getElementById('modify-product-id-input');
    const modifyImageInput = document.getElementById('modify-image-url-input');
    const modifyLoadBtn = document.getElementById('modify-load-button');
    const modifyActionBtn = document.getElementById('modify-action-button');

    // DELETE panel
    const deleteIdInput = document.getElementById('delete-product-id-input');
    const deleteLoadBtn = document.getElementById('delete-load-button');
    const deleteActionBtn = document.getElementById('delete-action-button');

    // Campos en la tarjeta
    const productImage = document.getElementById('product-image');
    const productImageSection = document.querySelector('.product-image-section');
    const categoryInput = document.getElementById('category-input');
    const brandInput = document.getElementById('brand-input');
    const genderInput = document.getElementById('gender-input');
    const productNameInput = document.getElementById('product-name-input');
    const productDescriptionInput = document.getElementById('product-description-input');
    const priceInput = document.getElementById('price-input');

    // Estado
    let currentProduct = null;

    // Eventos: CREATE
    if (createBtn) createBtn.addEventListener('click', () => {
        const id = createIdInput.value.trim();
        const image = createImageInput.value.trim();
        if (!id) return showAlert('Ingresa un ID para crear el producto', 'warning');
        if (!productExists(id)) return createProductFromPanel(id, image);
        showAlert('Ya existe un producto con ese ID', 'danger');
    });

    // Eventos: MODIFY - cargar
    if (modifyLoadBtn) modifyLoadBtn.addEventListener('click', () => {
        const id = modifyIdInput.value.trim();
        if (!id) return showAlert('Ingresa un ID para cargar', 'warning');
        const p = getProductById(id);
        if (!p) return showAlert('Producto no encontrado', 'danger');
        currentProduct = p;
        populateCard(p);
        showAlert('Producto cargado para modificar', 'success');
    });

    // Eventos: MODIFY - guardar cambios
    if (modifyActionBtn) modifyActionBtn.addEventListener('click', () => {
        if (!currentProduct) return showAlert('Carga primero un producto para modificar', 'warning');
        // aplicar cambios desde la tarjeta
        const updated = {
            ...currentProduct,
            name: productNameInput.value.trim(),
            description: productDescriptionInput.value.trim(),
            price: parseFloat(priceInput.value) || currentProduct.price,
            category: categoryInput.value.trim() || currentProduct.category,
            image: modifyImageInput.value.trim() || currentProduct.image
        };
        updateProductInStorage(updated);
        currentProduct = updated;
        populateCard(updated);
        showAlert('Producto actualizado', 'success');
    });

    // Eventos: DELETE - cargar
    if (deleteLoadBtn) deleteLoadBtn.addEventListener('click', () => {
        const id = deleteIdInput.value.trim();
        if (!id) return showAlert('Ingresa un ID para cargar antes de eliminar', 'warning');
        const p = getProductById(id);
        if (!p) return showAlert('Producto no encontrado', 'danger');
        currentProduct = p;
        populateCard(p);
        showAlert('Producto cargado para eliminar', 'info');
    });

    // Eventos: DELETE - ejecutar
    if (deleteActionBtn) deleteActionBtn.addEventListener('click', () => {
        if (!currentProduct) return showAlert('Carga primero un producto antes de eliminar', 'warning');
        if (!confirm(`Eliminar producto "${currentProduct.name}"?`)) return;
        deleteProductFromStorage(currentProduct.id);
        clearCard();
        currentProduct = null;
        showAlert('Producto eliminado', 'success');
    });

    // Sincronización: cambios en inputs de la tarjeta afectan vista
    [productNameInput, productDescriptionInput, priceInput, categoryInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => {
            // live sync handled by inputs themselves
        });
    });

    // Sincronizar precio cuando se edita directamente en la tarjeta
    if (priceInput) {
        priceInput.addEventListener('input', () => {
            if (!currentProduct) return; // no hay producto cargado
            const v = parseFloat(priceInput.value);
            currentProduct.price = isNaN(v) ? 0 : v;
            // actualizar almacenamiento en segundo plano
            updateProductInStorage(currentProduct);
        });
    }

    // Vista previa en vivo para URLs de imagen (create / modify)
    function trySetPreview(url) {
        const u = (url || '').trim();
        if (!u) {
            productImage.src = '../assets/images/avatar.png';
            updatePlaceholderClass();
            return;
        }
        const t = new Image();
        t.onload = () => { productImage.src = u; };
        t.onerror = () => { productImage.src = '../assets/images/avatar.png'; };
        t.src = u;
        // cuando la imagen del DOM cambie (onload/onerror) también actualizaremos la clase
    }

    if (createImageInput) createImageInput.addEventListener('input', () => trySetPreview(createImageInput.value));
    if (modifyImageInput) modifyImageInput.addEventListener('input', () => trySetPreview(modifyImageInput.value));

    // Helpers
    function populateCard(p) {
        categoryInput.value = p.category || '';
        brandInput.value = p.brand || '';
        genderInput.value = p.gender || '';
        productNameInput.value = p.name || '';
        productDescriptionInput.value = p.description || '';
        priceInput.value = p.price || '';
    productImage.src = p.image || '../assets/images/avatar.png';
    updatePlaceholderClass();
    }

    function clearCard() {
        categoryInput.value = '';
        brandInput.value = '';
        genderInput.value = '';
        productNameInput.value = '';
        productDescriptionInput.value = '';
        priceInput.value = '';
        productImage.src = '../assets/images/avatar.png';
        updatePlaceholderClass();
    }

    // Añadir clase placeholder-icon al contenedor de imagen cuando la imagen es el placeholder
    function updatePlaceholderClass() {
        if (!productImageSection || !productImage) return;
        try {
            const src = (productImage.src || '').toLowerCase();
            const isPlaceholder = !src || src.includes('avatar.png') || src.includes('/avatar');
            productImageSection.classList.toggle('placeholder-icon', isPlaceholder);
        } catch (e) { /* noop */ }
    }

    // Actualizar la clase cuando la imagen del elemento cargue (por cambios externos)
    if (productImage) productImage.addEventListener('load', updatePlaceholderClass);

    function createProductFromPanel(id, image) {
        const product = {
            id,
            name: productNameInput.value.trim() || 'Nuevo Producto',
            description: productDescriptionInput.value.trim() || '',
            price: parseFloat(priceInput.value) || 0,
            image: image || '../assets/images/avatar.png',
            category: categoryInput.value.trim() || 'General',
            rating: 5,
            createdAt: new Date().toISOString()
        };
        saveProduct(product);
        populateCard(product);
        showAlert('Producto creado', 'success');
    }

    // Local storage helpers
    function getProducts() {
        try { return JSON.parse(localStorage.getItem('motohub_products') || '[]'); }
        catch (e) { return []; }
    }

    function productExists(id) { return !!getProducts().find(p => p.id === id); }

    function getProductById(id) { return getProducts().find(p => p.id === id); }

    function saveProduct(product) {
        const products = getProducts();
        products.push(product);
        localStorage.setItem('motohub_products', JSON.stringify(products));
    }

    function updateProductInStorage(updated) {
        const products = getProducts();
        const i = products.findIndex(p => p.id === updated.id);
        if (i !== -1) products[i] = updated;
        else products.push(updated);
        localStorage.setItem('motohub_products', JSON.stringify(products));
    }

    function deleteProductFromStorage(id) {
        const products = getProducts().filter(p => p.id !== id);
        localStorage.setItem('motohub_products', JSON.stringify(products));
    }

    function showAlert(message, type = 'info') {
        if (!alertsContainer) return;
        alertsContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        setTimeout(() => { const a = alertsContainer.querySelector('.alert'); if (a) new bootstrap.Alert(a).close(); }, 4500);
    }
});


