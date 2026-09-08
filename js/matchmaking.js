const nameInput = document.querySelector(".name-input");
const showcaseEl = document.querySelector(".showcase");
const queueTimerEl = document.querySelector(".queue-timer");

let queueInterval;
let secondsElapsed = 0;

document.addEventListener("DOMContentLoaded", () => {
  enemyProfile = generateProfile()
  save("enemyProfile", enemyProfile);

  renderShowcase();
  startSearch();
});

function renderShowcase() {
  showcaseEl.innerHTML = `
    <div class="player-info player-1">
      <img class="avatar" src="${playerProfile.avatar || "assets/images/avatars/0.png"}">
      <div class="player-name p1-display">${playerProfile.username}</div>
      <div class="player-rank">Ranked Tier: Gold</div>
    </div>

    <div class="vs-badge">VS</div>

    <div class="player-info player-2">
      <img class="avatar" src="${enemyProfile.avatar}">
      <div class="player-name p2-display">${enemyProfile.username}</div>
      <div class="player-rank">Ranked Tier: Gold</div>
    </div>
  `;
}

function switchPanelContent(panelName) {
  document.querySelectorAll(".panel-content").forEach((el) => el.classList.remove("active"));
  document.querySelector(`.panel-content.${panelName}`).classList.add("active");
}

function startSearch() {
  const playerName = nameInput.value.trim() || "Player1";

  switchPanelContent("queue");
  secondsElapsed = 0;
  queueTimerEl.textContent = `Searching: 0s`;

  // Start timer counter
  queueInterval = setInterval(() => {
    secondsElapsed++;
    queueTimerEl.textContent = `Searching: ${secondsElapsed}s`;
  }, 1000);

  // Simulate finding a match between 2 and 4 seconds
  const searchDelay = Math.floor(Math.random() * 2000) + 2000;
  setTimeout(() => {
    clearInterval(queueInterval);
    showMatch(playerName);
  }, searchDelay);
}

function cancelSearch() {
  clearInterval(queueInterval);
  switchPanelContent("lobby");
}

function showMatch(playerName) {
  switchPanelContent("players-showcase");

  setTimeout(() => {
    changePage("game");
  }, 2000);
}
