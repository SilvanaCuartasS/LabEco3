// document.getElementById("get-btn").addEventListener("click", getUsers);

// function getUsers() {
//   fetch("http://localhost:5050/users")
//     .then((response) => response.json())
//     .then((data) => console.log("get response", data))
//     .catch((error) => console.error("Error:", error));
// }
const playersDiv = document.getElementById("players");
const movesDiv = document.getElementById("moves");
const resultDiv = document.getElementById("result");

function fetchGameState() {
    fetch("http://localhost:5050/result")
        .then((response) => response.json())
        .then((data) => {
            if (!data.players || data.players.length < 2) {
                playersDiv.innerText = "Waiting for players...";
                movesDiv.innerText = "";
                resultDiv.innerText = "";
                return;
            }

            // Mostrar jugadores
            playersDiv.innerText = `Players: ${data.players[0]} vs ${data.players[1]}`;

            // Si aún no han jugado los dos, esperar
            if (!data.moves || Object.keys(data.moves).length < 2) {
                movesDiv.innerText = "Waiting for both players to play...";
                resultDiv.innerText = "";
               

                if (!timerStarted) {
                    timerStarted = true;
                    startCountdown();
                }
                return
            }

            // Mostrar jugadas
            movesDiv.innerText = `${data.players[0]}: ${data.moves[data.players[0]]}  |  
                                  ${data.players[1]}: ${data.moves[data.players[1]]}`;

            // Mostrar resultado
            resultDiv.innerText = `Result: ${data.result}`;

            // Borrar info después de 5 segundos
            setTimeout(() => {
                fetch("http://localhost:5050/reset", { method: "POST" })
                    .then(() => {
                        playersDiv.innerText = "Waiting for players...";
                        movesDiv.innerText = "";
                        resultDiv.innerText = "";
                    });
            }, 5000);
        })
        .catch((error) => console.error("Error:", error));
}

let timerStarted = false;

function startCountdown() {
    let timeLeft = 10;
    const timerDisplay = document.getElementById("status");
    
    const timer = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timer);
        timerDisplay.innerText = "¡Tiempo agotado!";
        enableButtons(false);
      } else {
        timerDisplay.innerText = `Tiempo restante: ${timeLeft} segundos`;
        timeLeft--;
      }
    }, 1000);
  }

// Actualizar cada 2 segundos
setInterval(fetchGameState, 2000);
