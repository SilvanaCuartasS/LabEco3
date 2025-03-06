const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors()); 
app.use(express.json());

app.use("/app1", express.static(path.join(__dirname, "app1")));
app.use("/app2", express.static(path.join(__dirname, "app2")));

let players = {}; // { nombre: null }
let moves = {};   // { nombre: "rock", "paper" o "scissors" }
let timeoutId = null; // Temporizador de 10 segundos

app.get("/users", (req, res) => {
  res.json({ players: Object.keys(players) });
});

app.post("/register", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  if (Object.keys(players).length >= 2) {
    return res.status(400).json({ message: "El juego ya tiene dos jugadores" });
  }

  players[name] = null;
  res.json({ 
    message: `Jugador ${name} registrado`, 
    players: Object.keys(players) });

  // Cuando hay 2 jugadores, comienza el temporizador
  if (Object.keys(players).length === 2) {
    startCountPlayers();
  }
});

app.post("/play", (req, res) => {
  const { name, move } = req.body;
  if (!players.hasOwnProperty(name)) {
    return res.status(400).json({ message: "Debes registrarte antes de jugar" });
  }

  moves[name] = move;

  if (Object.keys(moves).length === 2) {
    clearTimeout(timeoutId); // Detiene el temporizador si ambos jugaron
    return determineWinner(res);
  }

  res.json({ message: `Has jugado: ${move}. Esperando al oponente...` });
});

function startCountPlayers() {
  timeoutId = setTimeout(() => {
    const playerNames = Object.keys(players);
    const [p1, p2] = playerNames;
    
    if (!moves[p1] && !moves[p2]) {
      return resetGame("Ambos jugadores perdieron por inactividad.");
    } else if (!moves[p1]) {
      return resetGame(`${p2} gana porque ${p1} no jugó a tiempo.`);
    } else if (!moves[p2]) {
      return resetGame(`${p1} gana porque ${p2} no jugó a tiempo.`);
    }
  }, 10000); // 10 segundos
}

function determineWinner(res) {
  const playerNames = Object.keys(players);
  const [p1, p2] = playerNames;
  const result = getWinner(moves[p1], moves[p2]);

  const finalMessage = result === "draw" ? "Empate" : `${result} gana`;
  
  res.json({
    players: playerNames,
    moves,
    result: finalMessage
  });

  resetGame(finalMessage);
}

function getWinner(move1, move2) {
  if (move1 === move2) return "draw";
  if (
    (move1 === "rock" && move2 === "scissors") ||
    (move1 === "scissors" && move2 === "paper") ||
    (move1 === "paper" && move2 === "rock")
  ) {
    return "Jugador 1";
  }
  return "Jugador 2";
}
app.get("/result", (req, res) => {
  if (Object.keys(players).length < 2) {
    return res.json({ message: "Esperando jugadores...", players: Object.keys(players) });
  }

  if (Object.keys(moves).length < 2) {
    return res.json({ message: "Esperando movimientos...", players: Object.keys(players), moves });
  }

  res.json({
    players: Object.keys(players),
    moves: moves,
    result: getWinner(moves[Object.keys(players)[0]], moves[Object.keys(players)[1]])
  });
});
function resetGame(message) {
  console.log(message);
  players = {};
  moves = {};
  timeoutId = null;
}

app.post("/reset", (req, res) => {
  players = {};
  moves = {};
  timeoutId = null;
  res.json({ message: "Juego reiniciado" });
});


app.listen(5050, () => console.log("Servidor corriendo en http://localhost:5050"));
