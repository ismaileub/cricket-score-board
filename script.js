let currentInnings = 1;
let matchTotalOvers = null;

const STORAGE_KEY = "mohishmara_scoreboard_v1";
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

function getTotalOversForCurrentInnings() {
  return matchTotalOvers;
}

function ensureTotalOversSet() {
  const total = matchTotalOvers;
  if (!Number.isInteger(total) || total <= 0) {
    alert("প্রথমে মোট ওভার সেট করুন!");
    return null;
  }
  return total;
}

function updateOversSetupUI() {
  const input = document.getElementById("totalOversInput");
  const btn = document.getElementById("setOversBtn");
  if (!input || !btn) return;

  if (Number.isInteger(matchTotalOvers) && matchTotalOvers > 0) {
    input.value = matchTotalOvers;
    input.disabled = true;
    btn.disabled = true;
    btn.textContent = "সেট হয়েছে";
  } else {
    input.value = "";
    input.disabled = false;
    btn.disabled = false;
    btn.textContent = "ওভার সেট";
  }
}

function setTotalOvers() {
  if (Number.isInteger(matchTotalOvers) && matchTotalOvers > 0) {
    alert("ম্যাচের মোট ওভার আগেই সেট করা হয়েছে!");
    return;
  }

  const input = document.getElementById("totalOversInput");
  const raw = (input?.value || "").trim();
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    alert("সঠিক মোট ওভার দিন!");
    return;
  }

  matchTotalOvers = value;
  updateOversSetupUI();
  updateDisplay();
}

function buildSerializableInnings(innings) {
  return {
    runs: innings.runs,
    wickets: innings.wickets,
    balls: innings.balls,
    overs: innings.overs,
    players: innings.players,
    activePlayerIds: {
      striker: innings.activePlayers.striker?.id ?? null,
      nonStriker: innings.activePlayers.nonStriker?.id ?? null,
      bowler: innings.activePlayers.bowler?.id ?? null,
    },
  };
}

function hydrateInnings(serialized) {
  const players = serialized?.players || { batsmen: [], bowlers: [] };
  const strikerId = serialized?.activePlayerIds?.striker ?? null;
  const nonStrikerId = serialized?.activePlayerIds?.nonStriker ?? null;
  const bowlerId = serialized?.activePlayerIds?.bowler ?? null;

  const striker = players.batsmen.find((p) => p.id === strikerId) || null;
  const nonStriker = players.batsmen.find((p) => p.id === nonStrikerId) || null;
  const bowler = players.bowlers.find((p) => p.id === bowlerId) || null;

  return {
    runs: Number(serialized?.runs) || 0,
    wickets: Number(serialized?.wickets) || 0,
    balls: Number(serialized?.balls) || 0,
    overs: Number(serialized?.overs) || 0,
    players,
    activePlayers: { striker, nonStriker, bowler },
  };
}

function persistState() {
  try {
    const payload = {
      currentInnings,
      matchTotalOvers,
      match: {
        innings1: buildSerializableInnings(match.innings1),
        innings2: buildSerializableInnings(match.innings2),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);

    matchTotalOvers =
      Number.isInteger(parsed?.matchTotalOvers) && parsed.matchTotalOvers > 0
        ? parsed.matchTotalOvers
        : null;

    const innings1 = hydrateInnings(parsed?.match?.innings1);
    const innings2 = hydrateInnings(parsed?.match?.innings2);
    match = { innings1, innings2 };

    const restoredInnings = Number(parsed?.currentInnings) === 2 ? 2 : 1;
    currentInnings = restoredInnings;
  } catch {
    // ignore storage errors
  }
}

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

  document.getElementById("strikerStats").innerHTML = current.activePlayers
    .striker
    ? `${current.activePlayers.striker.runs} (${current.activePlayers.striker.balls})`
    : "০ (০)";

  document.getElementById("nonStrikerStats").innerHTML = current.activePlayers
    .nonStriker
    ? `${current.activePlayers.nonStriker.runs} (${current.activePlayers.nonStriker.balls})`
    : "০ (০)";

  if (current.activePlayers.bowler) {
    let overs =
      Math.floor(current.activePlayers.bowler.balls / 6) +
      "." +
      (current.activePlayers.bowler.balls % 6);
    document.getElementById("bowlerStats").innerHTML =
      `${current.activePlayers.bowler.runs}-${current.activePlayers.bowler.wickets} (${overs})`;
  } else {
    document.getElementById("bowlerStats").innerHTML = "০-০ (০)";
  }

  const strikerBox = document.getElementById("strikerBox");
  const bowlerBox = document.getElementById("bowlerBox");
  if (strikerBox) {
    strikerBox.classList.toggle(
      "selected-striker",
      !!current.activePlayers.striker,
    );
  }
  if (bowlerBox) {
    bowlerBox.classList.toggle(
      "selected-bowler",
      !!current.activePlayers.bowler,
    );
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

  const totalOvers = ensureTotalOversSet();
  if (totalOvers === null) return;

  if (current.overs >= totalOvers || current.wickets >= 10) {
    alert("ইনিংস শেষ!");
    return;
  }

  if (current.balls >= 6) {
    alert("এই ওভারের ৬ বল শেষ। 'ওভার শেষ' চাপুন!");
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

  updateDisplay();
  updatePlayerDisplay();
}

function addDotBall() {
  let current = getCurrentInningsData();

  if (!current.activePlayers.striker || !current.activePlayers.bowler) {
    alert("স্ট্রাইকার ও বোলার সিলেক্ট করুন!");
    return;
  }

  const totalOvers = ensureTotalOversSet();
  if (totalOvers === null) return;

  if (current.overs >= totalOvers || current.wickets >= 10) {
    alert("ইনিংস শেষ!");
    return;
  }

  if (current.balls >= 6) {
    alert("এই ওভারের ৬ বল শেষ। 'ওভার শেষ' চাপুন!");
    return;
  }

  current.activePlayers.striker.balls++;
  current.activePlayers.bowler.balls++;

  current.balls++;

  updateDisplay();
  updatePlayerDisplay();
}

function addWicket() {
  let current = getCurrentInningsData();

  if (!current.activePlayers.striker || !current.activePlayers.bowler) {
    alert("স্ট্রাইকার ও বোলার সিলেক্ট করুন!");
    return;
  }

  const totalOvers = ensureTotalOversSet();
  if (totalOvers === null) return;

  if (current.overs >= totalOvers || current.wickets >= 10) {
    alert("ইনিংস শেষ!");
    return;
  }

  if (current.balls >= 6) {
    alert("এই ওভারের ৬ বল শেষ। 'ওভার শেষ' চাপুন!");
    return;
  }

  current.wickets++;
  current.balls++;

  current.activePlayers.bowler.wickets++;
  current.activePlayers.bowler.balls++;

  current.activePlayers.striker = null;

  updateDisplay();
  updatePlayerDisplay();
}

function addWide() {
  let current = getCurrentInningsData();
  if (!current.activePlayers.bowler) {
    alert("বোলার সিলেক্ট করুন!");
    return;
  }
  const totalOvers = ensureTotalOversSet();
  if (totalOvers === null) return;
  if (current.overs >= totalOvers || current.wickets >= 10) return;
  if (current.balls >= 6) {
    alert("এই ওভারের ৬ বল শেষ। 'ওভার শেষ' চাপুন!");
    return;
  }

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
  const totalOvers = ensureTotalOversSet();
  if (totalOvers === null) return;
  if (current.overs >= totalOvers || current.wickets >= 10) return;
  if (current.balls >= 6) {
    alert("এই ওভারের ৬ বল শেষ। 'ওভার শেষ' চাপুন!");
    return;
  }

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

  const totalOvers = getTotalOversForCurrentInnings();
  if (Number.isInteger(totalOvers) && totalOvers > 0) {
    let left = Math.max(totalOvers - current.overs, 0);
    document.getElementById("ballCount").innerHTML =
      `বল: ${current.balls}/৬ | বাকি: ${left} ওভার`;
  } else {
    document.getElementById("ballCount").innerHTML =
      `বল: ${current.balls}/৬ | মোট ওভার সেট করুন`;
  }

  document.getElementById("firstInningsScore").innerHTML =
    `${match.innings1.runs}/${match.innings1.wickets}`;
  document.getElementById("secondInningsScore").innerHTML =
    `${match.innings2.runs}/${match.innings2.wickets}`;

  updateOversSetupUI();
  persistState();
}

function resetOver() {
  let current = getCurrentInningsData();
  const totalOvers = ensureTotalOversSet();
  if (totalOvers === null) return;
  if (current.overs >= totalOvers) return;

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
  updateOversSetupUI();
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
    updateOversSetupUI();
  }
}

function resetMatch() {
  const ok = confirm(
    "নতুন ম্যাচ শুরু করবেন?\n\nএতে বর্তমান ম্যাচের সব ডাটা মুছে যাবে।",
  );
  if (!ok) return;

  match = {
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
  matchTotalOvers = null;
  currentInnings = 1;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  document.getElementById("innings1Btn").classList.add("active");
  document.getElementById("innings2Btn").classList.remove("active");
  updateDisplay();
  updatePlayerDisplay();
  updateOversSetupUI();
}

function togglePlayers() {
  document.getElementById("playersContent").classList.toggle("show");
  document.getElementById("playerArrow").classList.toggle("rotate");
}

window.addEventListener("DOMContentLoaded", () => {
  restoreState();
  updateDisplay();
  updatePlayerDisplay();
  updateOversSetupUI();

  document
    .getElementById("innings1Btn")
    ?.classList.toggle("active", currentInnings === 1);
  document
    .getElementById("innings2Btn")
    ?.classList.toggle("active", currentInnings === 2);
});
