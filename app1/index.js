document.getElementById("iniciar-juego-btn").addEventListener("click", () => {
  window.open("http://localhost:5050/jugador/?jugador=1", "_blank");
  window.open("http://localhost:5050/jugador/?jugador=2", "_blank");

  document.getElementById("iniciar-juego-btn").style.display = "none"
});

document.getElementById("resultado-juego").style.display = "none"
document.getElementById("informacion-jugador").style.display = "none"

function verificarJugadoresListos() {
  fetch("http://localhost:5050/estado")
    .then(response => response.json())
    .then(data => {
      if (data.listos) {
        document.getElementById("mensaje-pantalla").style.display = "none"; 
        document.getElementById("informacion-jugador").style.display = "block"; 
        iniciarCuentaRegresiva();
      } else {
        setTimeout(verificarJugadoresListos, 1000); 
      }
    })
    .catch(error => console.error("Error verificando jugadores:", error));
}
function iniciarCuentaRegresiva() {
  let tiempoRestante = 10;
  const cuentaSpan = document.getElementById("cuenta");

  if (!cuentaSpan) {
    console.error("Elemento 'cuenta' no encontrado");
    return;
  }

  cuentaSpan.innerText = `Tiempo restante: ${tiempoRestante} segundos`;

  const intervalo = setInterval(() => {
    tiempoRestante--;
    cuentaSpan.innerText = `Tiempo restante: ${tiempoRestante} segundos`;

    if (tiempoRestante === 0) {
      clearInterval(intervalo);
      cuentaSpan.innerText = "¡Tiempo terminado!";
      cuentaSpan.style.fontWeight = "bold";
      notificarFinDeTiempo();
    }
  }, 1000);
}
function mostrarResultados() {
  setInterval(() => {
    fetch("http://localhost:5050/resultado")
      .then(response => response.json())
      .then(data => {
        const resultados = document.getElementById("resultado-juego")
        resultados.style.display = "block"
        resultados.innerText = data.resultado;

        setTimeout(() => {
          resultados.style.display = "none";
          reiniciarJuego(); 
        }, 5000);
      
      })
      
      .catch(error => console.error("Error obteniendo resultados:", error));
  }, 1000);
}

function notificarFinDeTiempo() {
  fetch("http://localhost:5050/estado", { method: "POST" })
    .then(() => mostrarResultados()) 
    .catch(error => console.error("Error notificando fin de tiempo:", error));
}

function verificarEstadoReinicio() {
  fetch("http://localhost:5050/estado-reinicio")
    .then(response => response.json())
    .then(data => {
      if (data.reiniciar) {
        location.reload(); 
      }
    })
    .catch(error => console.error("Error verificando estado de reinicio:", error));
}

setInterval(verificarEstadoReinicio, 1000);

function reiniciarJuego() {
  fetch("http://localhost:5050/reiniciar", { method: "POST" })
  .catch(error => console.error("Error reiniciando el juego:", error));
}
verificarJugadoresListos();
