const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use("/pantalla", express.static(path.join(__dirname, "app1")));
app.use("/jugador", express.static(path.join(__dirname, "app2")));

let jugadores = [];
let resultadoJuego = "";
let reiniciarJuegoFlag = false;
let timeoutId = null;

app.get('/ataques', (req, res) => { 
  const listos = jugadores.length === 2 && jugadores.every(j => j.ataque);
  res.json({ jugadores, listos });
});
app.post('/ataques', (request, res) => { 
  const {jugador, nombre, ataque} = request.body;

  let jugadorExistente = jugadores.find(j => j.jugador === jugador);

  if (jugadorExistente) {
      jugadorExistente.nombre = nombre || jugadorExistente.nombre; 
      if (ataque) {
          jugadorExistente.ataque = ataque; 
      }
  } else {
      jugadores.push({ jugador, nombre, ataque: ataque || null }); 
  }

  if (jugadores.length === 2) {
    if (!timeoutId) {
        iniciarTemporizadorAtaque(); 
    }

    if (jugadores.every(j => j.ataque)) {
        clearTimeout(timeoutId); 
        timeoutId = null;
        determinarGanador(); 
    }
}

res.json({ jugadores, listos: jugadores.length === 2 });
});

app.get("/jugadores-listos", (req, res) => {
  const listos = jugadores.length === 2 && jugadores.every(j => j.nombre); 
  res.json({ listos });
});

app.post("/estado", (req, res) => {
  jugadores.forEach(j => {
    if (!j.ataque) { 
      j.ataque = "piedra";
    }
  });
  res.json({ mensaje: "Tiempo terminado, ataques asignados" });
});

app.get("/estado", (req, res) => {
  const listos = jugadores.length === 2 && jugadores.every(j => j.nombre); 
  res.json({ listos });
});
function iniciarTemporizadorAtaque() {
  timeoutId = setTimeout(() => {
      const j1 = jugadores.find(j => j.jugador === 1);
      const j2 = jugadores.find(j => j.jugador === 2);

      if (!j1.ataque && j2.ataque) {
          resultadoJuego = `${j2.nombre} gana automáticamente porque ${j1.nombre} no eligió a tiempo`;
      } else if (!j2.ataque && j1.ataque) {
          resultadoJuego = `${j1.nombre} gana automáticamente porque ${j2.nombre} no eligió a tiempo`;
      } else {
          resultadoJuego = "Nadie eligió, partida cancelada";
      }

      console.log(resultadoJuego);
  }, 10000);
}
function determinarGanador() {
  const [j1, j2] = jugadores;
  let resultado = "";

  if (j1.ataque === j2.ataque) {
      resultado = "Empate";
  } else if (
      (j1.ataque === "piedra" && j2.ataque === "tijera") ||
      (j1.ataque === "papel" && j2.ataque === "piedra") ||
      (j1.ataque === "tijera" && j2.ataque === "papel")
  ) {
      resultado = `${j1.nombre} gana`;
  } else {
      resultado = `${j2.nombre} gana`;
  }

  resultadoJuego = resultado;
}


app.get("/resultado", (req, res) => {
  res.json({ resultado: resultadoJuego || "Esperando resultados..." });
});

function reiniciarJuego() {
  jugadores = [];
  resultadoJuego = "";
  reiniciarJuegoFlag = true; 
  timeoutId = null;

  setTimeout(() => {
    reiniciarJuegoFlag = false;
  }, 1000);
}

app.post("/reiniciar", (req, res) => {
  reiniciarJuego();
  res.json({ mensaje: "Partida reiniciada" });
});

app.get("/estado-reinicio", (req, res) => {
  res.json({ reiniciar: reiniciarJuegoFlag });
});

app.listen(5050);