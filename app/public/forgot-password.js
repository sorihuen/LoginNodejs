document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-password-form");
  const errorElement = form.querySelector(".error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita el envío del formulario por defecto

    const email = form.querySelector("#email").value;

    try {
      const response = await fetch(
        "http://localhost:4000/api/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Instrucciones de recuperación enviadas a tu email.");
        form.reset();
      } else {
        errorElement.textContent =
          data.message || "Error al enviar instrucciones.";
        errorElement.classList.remove("escondido");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      errorElement.textContent =
        "Error del servidor. Intenta de nuevo más tarde.";
      errorElement.classList.remove("escondido");
    }
  });
});
