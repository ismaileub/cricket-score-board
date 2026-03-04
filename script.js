let currentInnings = 1;
let match = {
  innings1: {
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    players: { batsmen: [], bowlers: [] },
    activePlayers: { striker: null, nonStriker: null, bowler: null },
  },
  innings2: {
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    players: { batsmen: [], bowlers: [] },
    activePlayers: { striker: null, nonStriker: null, bowler: null },
  },
};
let totalOvers = 12;

function getCurrentInningsData() {
  return currentInnings === 1 ? match.innings1 : match.innings2;
}

function addPlayer() {
  let name = document.getElementById("playerName").value.trim();
  let type = document.getElementById("playerType").value;
  let current = getCurrentInningsData();

  if (!name) {
    alert("প্লেয়ারের নাম দিন!");
    return;
  }

  if (type === "batsman" || type === "allrounder") {
    current.players.batsmen.push({
      id: Date.now() + Math.random(),
      name: name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
    });
  }

  if (type === "bowler" || type === "allrounder") {
    current.players.bowlers.push({
      id: Date.now() + Math.random(),
      name: name,
      runs: 0,
      wickets: 0,
      maidens: 0,
      balls: 0,
    });
  }

  document.getElementById("playerName").value = "";
  updatePlayerDisplay();
}

function updatePlayerDisplay() {
  let current = getCurrentInningsData();

  let batsmenBody = document.getElementById("batsmenBody");
  if (current.players.batsmen.length === 0) {
    batsmenBody.innerHTML = '<tr><td colspan="7">কোন ব্যাটসম্যান নেই</td></tr>';
  } else {
    batsmenBody.innerHTML = current.players.batsmen
      .map((player) => {
        let sr =
          player.balls > 0
            ? ((player.runs / player.balls) * 100).toFixed(0)
            : "0";
        let isActive =
          current.activePlayers.striker?.id === player.id ||
          current.activePlayers.nonStriker?.id === player.id;
        return `<tr class="${isActive ? "active-batsman" : ""}">
                <td>${player.name}</td>
                <td>${player.runs}</td>
                <td>${player.balls}</td>
                <td>${player.fours}</td>
                <td>${player.sixes}</td>
                <td>${sr}</td>
                <td><button class="delete-player" onclick="deletePlayer('batsman', ${player.id})">🗑️</button></td>
            </tr>`;
      })
      .join("");
  }

  let bowlersBody = document.getElementById("bowlersBody");
  if (current.players.bowlers.length === 0) {
    bowlersBody.innerHTML = '<tr><td colspan="7">কোন বোলার নেই</td></tr>';
  } else {
    bowlersBody.innerHTML = current.players.bowlers
      .map((player) => {
        let overs = Math.floor(player.balls / 6) + "." + (player.balls % 6);
        let eco =
          player.balls > 0
            ? ((player.runs / player.balls) * 6).toFixed(1)
            : "0";
        let isActive = current.activePlayers.bowler?.id === player.id;
        return `<tr class="${isActive ? "active-bowler" : ""}">
                <td>${player.name}</td>
                <td>${overs}</td>
                <td>${player.runs}</td>
                <td>${player.wickets}</td>
                <td>${player.maidens}</td>
                <td>${eco}</td>
                <td><button class="delete-player" onclick="deletePlayer('bowler', ${player.id})">🗑️</button></td>
            </tr>`;
      })
      .join("");
  }

  updateActiveDisplay();
}

function setActive(type) {
  let current = getCurrentInningsData();

  if (type === "striker" || type === "nonStriker") {
    if (current.players.batsmen.length === 0) {
      alert("প্রথমে ব্যাটসম্যান যোগ করুন!");
      return;
    }
    let names = current.players.batsmen
      .map((p, i) => `${i + 1}. ${p.name}`)
      .join("\n");
    let index = prompt(
      `${type === "striker" ? "স্ট্রাইকার" : "নন-স্ট্রাইকার"} নির্বাচন করুন (১-${current.players.batsmen.length}):\n${names}`,
    );
    if (index) {
      let i = parseInt(index) - 1;
      if (i >= 0 && i < current.players.batsmen.length) {
        current.activePlayers[type] = current.players.batsmen[i];
      }
    }
  } else {
    if (current.players.bowlers.length === 0) {
      alert("প্রথমে বোলার যোগ করুন!");
      return;
    }
    let names = current.players.bowlers
      .map((p, i) => `${i + 1}. ${p.name}`)
      .join("\n");
    let index = prompt(
      `বোলার নির্বাচন করুন (১-${current.players.bowlers.length}):\n${names}`,
    );
    if (index) {
      let i = parseInt(index) - 1;
      if (i >= 0 && i < current.players.bowlers.length) {
        current.activePlayers.bowler = current.players.bowlers[i];
      }
    }
  }
  updatePlayerDisplay();
}

function updateActiveDisplay() {
  let current = getCurrentInningsData();

  document.getElementById("strikerName").innerHTML =
    current.activePlayers.striker?.name || "-";
  document.getElementById("nonStrikerName").innerHTML =
    current.activePlayers.nonStriker?.name || "-";
  document.getElementById("bowlerName").innerHTML =
    current.activePlayers.bowler?.name || "-";

  if (current.activePlayers.striker) {
    document.getElementById("strikerStats").innerHTML =
      `${current.activePlayers.striker.runs} (${current.activePlayers.striker.balls})`;
  }
  if (current.activePlayers.nonStriker) {
    document.getElementById("nonStrikerStats").innerHTML =
      `${current.activePlayers.nonStriker.runs} (${current.activePlayers.nonStriker.balls})`;
  }
  if (current.activePlayers.bowler) {
    let overs =
      Math.floor(current.activePlayers.bowler.balls / 6) +
      "." +
      (current.activePlayers.bowler.balls % 6);
    document.getElementById("bowlerStats").innerHTML =
      `${current.activePlayers.bowler.runs}-${current.activePlayers.bowler.wickets} (${overs})`;
  }
}

function deletePlayer(type, id) {
  let current = getCurrentInningsData();

  if (type === "batsman") {
    current.players.batsmen = current.players.batsmen.filter(
      (p) => p.id !== id,
    );
    if (current.activePlayers.striker?.id === id)
      current.activePlayers.striker = null;
    if (current.activePlayers.nonStriker?.id === id)
      current.activePlayers.nonStriker = null;
  } else {
    current.players.bowlers = current.players.bowlers.filter(
      (p) => p.id !== id,
    );
    if (current.activePlayers.bowler?.id === id)
      current.activePlayers.bowler = null;
  }
  updatePlayerDisplay();
}

function showAnimation(run) {
  const board = document.getElementById("scoreboard");
  const old = document.querySelector(".animation-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.className = "animation-overlay";
  const text = document.createElement("div");
  text.className = "animation-text";
  text.textContent = run === 4 ? "চৌকা!" : "ছক্কা!";
  overlay.appendChild(text);
  board.appendChild(overlay);
  setTimeout(() => overlay.remove(), 500);
}

function addRun(run) {
  let current = getCurrentInningsData();

  if (!current.activePlayers.striker || !current.activePlayers.bowler) {
    alert("স্ট্রাইকার ও বোলার সিলেক্ট করুন!");
    return;
  }

  if (current.overs >= totalOvers || current.wickets >= 10) {
    alert("ইনিংস শেষ!");
    return;
  }

  if (run === 4 || run === 6) showAnimation(run);

  current.activePlayers.striker.runs += run;
  current.activePlayers.striker.balls++;
  if (run === 4) current.activePlayers.striker.fours++;
  if (run === 6) current.activePlayers.striker.sixes++;

  current.activePlayers.bowler.runs += run;
  current.activePlayers.bowler.balls++;

  current.runs += run;
  current.balls++;

  if (run % 2 === 1) swapStrike();

  if (current.balls === 6) {
    current.overs++;
    current.balls = 0;
    swapStrike();
  }

  updateDisplay();
  updatePlayerDisplay();
}

function addDotBall() {
  let current = getCurrentInningsData();

  if (!current.activePlayers.striker || !current.activePlayers.bowler) {
    alert("স্ট্রাইকার ও বোলার সিলেক্ট করুন!");
    return;
  }

  if (current.overs >= totalOvers || current.wickets >= 10) {
    alert("ইনিংস শেষ!");
    return;
  }

  current.activePlayers.striker.balls++;
  current.activePlayers.bowler.balls++;

  current.balls++;

  if (current.balls === 6) {
    current.overs++;
    current.balls = 0;
    swapStrike();
  }

  updateDisplay();
  updatePlayerDisplay();
}

function addWicket() {
  let current = getCurrentInningsData();

  if (!current.activePlayers.striker || !current.activePlayers.bowler) {
    alert("স্ট্রাইকার ও বোলার সিলেক্ট করুন!");
    return;
  }

  if (current.overs >= totalOvers || current.wickets >= 10) {
    alert("ইনিংস শেষ!");
    return;
  }

  current.wickets++;
  current.balls++;

  current.activePlayers.bowler.wickets++;
  current.activePlayers.bowler.balls++;

  current.activePlayers.striker = null;

  if (current.balls === 6) {
    current.overs++;
    current.balls = 0;
    swapStrike();
  }

  updateDisplay();
  updatePlayerDisplay();
}

function addWide() {
  let current = getCurrentInningsData();
  if (!current.activePlayers.bowler) {
    alert("বোলার সিলেক্ট করুন!");
    return;
  }
  if (current.overs >= totalOvers || current.wickets >= 10) return;

  current.runs++;
  current.activePlayers.bowler.runs++;
  updateDisplay();
  updatePlayerDisplay();
}

function addNoBall() {
  let current = getCurrentInningsData();
  if (!current.activePlayers.bowler) {
    alert("বোলার সিলেক্ট করুন!");
    return;
  }
  if (current.overs >= totalOvers || current.wickets >= 10) return;

  current.runs++;
  current.activePlayers.bowler.runs++;
  updateDisplay();
  updatePlayerDisplay();
}

function swapStrike() {
  let current = getCurrentInningsData();
  [current.activePlayers.striker, current.activePlayers.nonStriker] = [
    current.activePlayers.nonStriker,
    current.activePlayers.striker,
  ];
}

function updateDisplay() {
  let current = getCurrentInningsData();

  document.getElementById("bdScore").innerHTML =
    `${current.runs}/${current.wickets}`;
  document.getElementById("bdOvers").innerHTML =
    `${current.overs}.${current.balls} ওভার`;
  document.getElementById("currentTeamName").innerHTML =
    `${currentInnings === 1 ? "১ম" : "২য়"} ইনিংস`;

  let left = totalOvers - current.overs;
  document.getElementById("ballCount").innerHTML =
    `বল: ${current.balls}/৬ | বাকি: ${left} ওভার`;

  document.getElementById("firstInningsScore").innerHTML =
    `${match.innings1.runs}/${match.innings1.wickets}`;
  document.getElementById("secondInningsScore").innerHTML =
    `${match.innings2.runs}/${match.innings2.wickets}`;
}

function resetOver() {
  let current = getCurrentInningsData();
  if (current.balls > 0) {
    current.overs++;
    current.balls = 0;
    swapStrike();
    updateDisplay();
  }
}

function switchInnings(innings) {
  currentInnings = innings;
  document
    .getElementById("innings1Btn")
    .classList.toggle("active", innings === 1);
  document
    .getElementById("innings2Btn")
    .classList.toggle("active", innings === 2);
  updateDisplay();
  updatePlayerDisplay();
}

function startNextInnings() {
  if (currentInnings === 1) {
    currentInnings = 2;
    document.getElementById("innings1Btn").classList.remove("active");
    document.getElementById("innings2Btn").classList.add("active");

    if (match.innings2.players.batsmen.length === 0) {
      match.innings1.players.batsmen.forEach((p) => {
        match.innings2.players.batsmen.push({
          ...p,
          id: Date.now() + Math.random(),
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
        });
      });
      match.innings1.players.bowlers.forEach((p) => {
        match.innings2.players.bowlers.push({
          ...p,
          id: Date.now() + Math.random(),
          runs: 0,
          wickets: 0,
          balls: 0,
          maidens: 0,
        });
      });
    }

    updateDisplay();
    updatePlayerDisplay();
  }
}

function resetMatch() {
  match = {
    innings1: {
      runs: 0,
      wickets: 0,
      balls: 0,
      overs: 0,
      players: { batsmen: [], bowlers: [] },
      activePlayers: {},
    },
    innings2: {
      runs: 0,
      wickets: 0,
      balls: 0,
      overs: 0,
      players: { batsmen: [], bowlers: [] },
      activePlayers: {},
    },
  };
  currentInnings = 1;
  document.getElementById("innings1Btn").classList.add("active");
  document.getElementById("innings2Btn").classList.remove("active");
  updateDisplay();
  updatePlayerDisplay();
}

function togglePlayers() {
  document.getElementById("playersContent").classList.toggle("show");
  document.getElementById("playerArrow").classList.toggle("rotate");
}
