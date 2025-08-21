// loadNavbar.js
// Carga el archivo /src/pages/navbar.html y lo inserta en el elemento con id "navbar-container"
// También actualiza el enlace activo según la ubicación.
document.addEventListener('DOMContentLoaded', function () {
	const container = document.getElementById('navbar-container');
	if (!container) return;

	fetch('/src/pages/navbar.html')
		.then(resp => {
			if (!resp.ok) throw new Error('No se pudo cargar el navbar');
			return resp.text();
		})
		.then(html => {
			// Insertar el HTML completo, pero evitar duplicar <html> <head> etc.
			// Buscamos el fragmento .seccion-nav dentro del archivo cargado.
			const tmp = document.createElement('div');
			tmp.innerHTML = html;
			const nav = tmp.querySelector('.seccion-nav');
			if (nav) {
				container.appendChild(nav);
				markActiveLink();
			} else {
				// Fallback: insertar todo si no se encuentra el fragmento
				container.innerHTML = html;
				markActiveLink();
			}
		})
		.catch(err => {
			console.warn('loadNavbar:', err);
			container.innerHTML = '<!-- navbar no disponible -->';
		});

	function markActiveLink() {
		try {
			const links = container.querySelectorAll('a');
			const path = window.location.pathname.replace(/\\/g, '/');
			links.forEach(a => {
				// Comparar rutas relativas y absolutas simples
				const href = a.getAttribute('href') || '';
				if (href === path || href === path.substring(path.lastIndexOf('/')) || path.endsWith(href.replace('/','')) ) {
					a.classList.add('active');
				}
			});
		} catch (e) {
			// No crítico
		}
	}
});
