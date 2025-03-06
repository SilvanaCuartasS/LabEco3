// document.getElementById("get-btn").addEventListener("click", getUsers);

// function getUsers() {
//   fetch("http://localhost:5050/users")
//     .then((response) => response.json())
//     .then((data) => console.log("get response", data))
//     .catch((error) => console.error("Error:", error));
// }

let playerName = "";

document.getElementById("register-btn").addEventListener("click", registerPlayer);
document.getElementById("rock-btn").addEventListener("click", () => play("rock"));
document.getElementById("paper-btn").addEventListener("click", () => play("paper"));
document.getElementById("scissors-btn").addEventListener("click", () => play("scissors"));

function registerPlayer() {
  playerName = document.getElementById("name-input").value.trim();

  if (!playerName) {
    document.getElementById("status").innerText = "Debes ingresar un nombre.";
    return;
  }

  fetch("http://localhost:5050/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName })
  })
    .then(response => response.json())
    .then(data => {
      console.log("Registro exitoso:", data); 
      document.getElementById("status").innerText = data.message;
      if (data.players && data.players.includes(playerName)) {
        enableButtons(true);
      }
    })
    .catch(error => console.error("Error:", error));
}

function play(move) {
  if (!playerName) {
    document.getElementById("status").innerText = "Debes registrarte primero.";
    return;
  }

  fetch("http://localhost:5050/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, move })
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById("status").innerText = data.message;
      console.log("Estado del juego:", data);
      if (data.players && data.players.length === 2) {
        enableButtons(true);
      }
      
    })
    .catch(error => console.error("Error:", error));
}

function enableButtons(enabled) {
  document.getElementById("rock-btn").disabled = !enabled;
  document.getElementById("paper-btn").disabled = !enabled;
  document.getElementById("scissors-btn").disabled = !enabled;
}



// Deshabilita los botones al inicio
enableButtons(false);