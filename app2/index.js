const urlParams = new URLSearchParams(window.location.search);
const parametroJugador = urlParams.get("jugador"); 
const numeroJugador = parametroJugador ? parseInt(parametroJugador, 10) : null; 

if (!numeroJugador || numeroJugador < 1 || numeroJugador > 2) { 
  throw new Error("Número de jugador no encontrado o inválido");
} 

let nombreJugadorGlobal = ""
const inputNombreJugador = document.getElementById("nombre-jugador-input")
const urlFetch = 'http://localhost:5050/ataques'

document.getElementById("piedra").disabled = true;
document.getElementById("papel").disabled = true;
document.getElementById("tijera").disabled = true;

async function obtenerDatosJugador() {
  try {
    nombreJugadorGlobal = inputNombreJugador.value
    if (!nombreJugadorGlobal) {
      throw new Error("Por favor ingresa un nombre de jugador");
    }
    document.getElementById("mensaje-espera").innerText = `${nombreJugadorGlobal}, esperando al otro jugador...`;
    document.getElementById("mensaje-espera").style.display = "block";
    const solicitudJugador = { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' ,
      },
      body: JSON.stringify({
        jugador: numeroJugador,
        nombre: nombreJugadorGlobal,
      }),
    }
    const respuesta = await fetch(urlFetch, solicitudJugador);

    if (!respuesta.ok) {
      throw new Error("La respuesta de la red no fue exitosa");
    }
    
    inputNombreJugador.value = "";
    document.getElementById("nombre-jugador").style.display = "none";

    verificarJugadoresListos();

  } catch (error) {
    console.error('Error al enviar datos:', error.message);
    alert(error.message)
  }
}
document.getElementById("enviar-btn").addEventListener("click", obtenerDatosJugador);

async function verificarJugadoresListos() {
  try {
    const respuesta = await fetch("http://localhost:5050/jugadores-listos");
    const data = await respuesta.json();

    if (data.listos) {
      document.getElementById("mensaje-espera").innerText = "¡Ambos jugadores están listos! Elige tu ataque.";
      document.getElementById("piedra").disabled = false;
      document.getElementById("papel").disabled = false;
      document.getElementById("tijera").disabled = false;
    } else {
      setTimeout(verificarJugadoresListos, 1000); 
    }
  } catch (error) {
    console.error("Error verificando jugadores listos:", error);
  }
}

let ataqueSeleccionado = false;
let tiempoFinalizado = false;
// Enviar ataque seleccionado
async function enviarAtaque(ataque) {
  if (ataqueSeleccionado || tiempoFinalizado) return; // Evita que se escojan dos opciones

  ataqueSeleccionado = true;
    await fetch(urlFetch, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jugador: numeroJugador, ataque } ),
    });

    document.getElementById("mensaje-espera").innerText = `${nombreJugadorGlobal} Elegiste ${ataque}. Esperando resultados...`;
    document.getElementById("piedra").disabled = true;
    document.getElementById("papel").disabled = true;
    document.getElementById("tijera").disabled = true;
}

// Verificar si el tiempo se acabó y asignar ataque por defecto
async function verificarTiempoFinalizado() {
    const respuesta = await fetch("http://localhost:5050/estado");
    const data = await respuesta.json();

    if (data.tiempoFinalizado && !ataqueSeleccionado) {
        tiempoFinalizado = true;
        enviarAtaque("piedra"); // Si no elige, asigna "piedra"
    }
}
setInterval(verificarTiempoFinalizado, 1000);

document.getElementById("piedra").addEventListener("click", () => enviarAtaque("piedra"));
document.getElementById("papel").addEventListener("click", () => enviarAtaque("papel"));
document.getElementById("tijera").addEventListener("click", () => enviarAtaque("tijera"));

function verificarEstadoReinicio() {
  fetch("http://localhost:5050/estado-reinicio")
    .then(response => response.json())
    .then(data => {
      if (data.reiniciar) {
        window.close(); 
      }
    })
    .catch(error => console.error("Error verificando estado de reinicio:", error));
}

setInterval(verificarEstadoReinicio, 1000);
