document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  const token = new URLSearchParams(window.location.search).get("token");
  form.querySelector("#token").value = token;

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita el envío del formulario por defecto

    const newPassword = form.querySelector("#new-password").value;
    const token = form.querySelector("#token").value;

    try {
      const response = await fetch(
        `http://localhost:4000/api/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Contraseña actualizada correctamente.");
        form.reset();
      } else {
        const errorElement = form.querySelector(".error");
        errorElement.textContent =
          data.message || "Error al actualizar la contraseña.";
        errorElement.classList.remove("escondido");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      const errorElement = form.querySelector(".error");
      errorElement.textContent =
        "Error del servidor. Intenta de nuevo más tarde.";
      errorElement.classList.remove("escondido");
    }
  });
});
