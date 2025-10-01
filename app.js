// URL de tu backend en Render
const API_URL = "https://persona-backend-8fgt.onrender.com/personas";

// ---------------------------------------------------
// LOAD PERSONAS
// ---------------------------------------------------
async function loadPersonas() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const personas = await res.json();

    const list = document.getElementById("personas-list");
    list.innerHTML = "";

    if (!Array.isArray(personas) || personas.length === 0) {
      list.textContent = "No hay personas.";
      return;
    }

    personas.forEach(p => {
      const div = document.createElement("div");
      div.className = "persona";

      // Ajuste: propiedades según tu modelo Java
      const id = p.idPerson ?? p.id ?? "";
      const name = p.name ?? p.nombre ?? "—";

      // Card (has @JsonIgnore on person so won't loop)
      const cardNumber = p.card?.number ?? "—";

      // Addresses: viene como array (ElementCollection)
      const addressesArray = p.addresses ?? [];
      const addressesText = addressesArray.length
        ? addressesArray.map(a => `${a.street ?? ""} ${a.houseNumber ?? ""} ${a.city ?? ""} ${a.postCode ?? ""}`.trim()).join(" • ")
        : (p.addressEmbedded ? `${p.addressEmbedded.street ?? ""} ${p.addressEmbedded.houseNumber ?? ""}`.trim() : "—");

      div.innerHTML = `
        <strong>${name}</strong> (ID: ${id})<br>
        Tarjeta: ${cardNumber}<br>
        Direcciones: ${addressesText}
      `;

      list.appendChild(div);
    });
  } catch (err) {
    console.error("Error cargando personas:", err);
    const list = document.getElementById("personas-list");
    list.innerHTML = `<p style="color:darkred;">Error cargando personas: ${err.message}</p>`;
  }
}

// ---------------------------------------------------
// Manejar formulario de añadir dirección
// ---------------------------------------------------
document.getElementById("address-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const idRaw = document.getElementById("person-id").value;
  const id = parseInt(idRaw, 10);
  if (!id || isNaN(id)) {
    alert("Introduce un ID de persona válido.");
    return;
  }

  const street = document.getElementById("street").value.trim();
  const houseNumber = document.getElementById("houseNumber").value.trim();
  const city = document.getElementById("city").value.trim();
  const postCode = document.getElementById("postCode").value.trim();

  const address = { street, houseNumber, city, postCode };

  try {
    const res = await fetch(`${API_URL}/${id}/add-address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server ${res.status} ${res.statusText}: ${text}`);
    }

    const updated = await res.json();
    alert("Dirección añadida correctamente.");
    console.log("Persona actualizada:", updated);

    // reset formulario y recargar lista
    document.getElementById("address-form").reset();
    loadPersonas();
  } catch (err) {
    console.error("Error añadiendo dirección:", err);
    alert("No se pudo añadir la dirección: " + err.message);
  }
});

// cargar al inicio
loadPersonas();
