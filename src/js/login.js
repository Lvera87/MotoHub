
    const form = document.getElementById("loginForm");
    const mensajeDiv = document.getElementById("mensaje");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      // Obtener usuarios del localStorage
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      // Buscar usuario válido
      const usuario = usuarios.find(u => u.email === email && u.password === password);

      if (usuario) {
        mensajeDiv.style.color = "green";
        mensajeDiv.innerHTML = "Inicio de sesión exitoso!";
        localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1000);
      } else {
        mensajeDiv.style.color = "red";
        mensajeDiv.innerHTML = "Correo o contraseña incorrectos.";
      }
    });
 