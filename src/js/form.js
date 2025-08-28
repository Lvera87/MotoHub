
    const form = document.getElementById("registroForm");
    const mensaje = document.getElementById("mensaje");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const usuario = { nombre, telefono, email, password };

      let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      if (usuarios.find(u => u.email === email)) {
        mensaje.style.color = "red";
        mensaje.innerHTML = "⚠️ Este correo ya está registrado.";
        return;
      }

      usuarios.push(usuario);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      mensaje.style.color = "green";
      mensaje.innerHTML = `✅ Usuario "${nombre}" guardado con éxito!`;

      // También puedes usar un alert si prefieres:
      // alert(`Usuario "${nombre}" guardado con éxito!`);

      // Redirigir después de 2s
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    });
