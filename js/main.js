let playerProfile = load("playerProfile", generateProfile());
let enemyProfile = load("enemyProfile", generateProfile());

function changePage(name) {
  window.location.replace(`pages/${name}.html`);
}

function generateProfile() {
  return { avatar: `assets/images/avatars/${randomInt(0, 15)}.png`, username: getRandomItem(USERNAMES), bio: "" };
}
