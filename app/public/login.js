document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Obtener los valores de los campos del formulario
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:4000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.status === "Success") {
        alert("Inicio de sesión exitoso");
        window.location.href = "/admin";
      } else {
        alert("Error en el inicio de sesión: " + data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
});
