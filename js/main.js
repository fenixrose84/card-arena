let playerProfile = load("playerProfile", generatePlayerProfile());
let enemyProfile = load("enemyProfile", generateEnemyProfile());

function changePage(name) {
  window.location.replace(`pages/${name}.html`);
}

function generatePlayerProfile() {
  return { avatar: `assets/images/avatars/${randomInt(0, 7)}.png`, username: USERNAMES[randomInt(0, 7)], bio: "" };
}

function generateEnemyProfile() {
  return { avatar: `assets/images/avatars/${randomInt(8, 15)}.png`, username: USERNAMES[randomInt(8, 14)], bio: "" };
}

function flipCard(cardEl, force) {
  cardEl.classList.toggle("flipped", force !== undefined ? !force : undefined);
}
