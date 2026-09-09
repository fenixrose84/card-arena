const collectionGrid = document.querySelector(".collection-modal .cards-grid");
const avatarInput = document.querySelector(".avatar-input input");
const avatarPreview = document.querySelector(".avatar-preview img");
const usernameInput = document.querySelector(".username-input input");
const bioInput = document.querySelector(".bio-input textarea");

const sceneries = [SCENERIES.canalCity, SCENERIES.islandCastle, SCENERIES.cosmicVortex];
const banners = [SCENERIES.darkCastle, SCENERIES.darkTower, SCENERIES.floatingCastle];

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.background = `
    var(--overlay-gradient),
    url("${getRandomItem(sceneries)}")
    center / cover no-repeat
  `;

  displayCollection();
  updateUI();
});

avatarInput.addEventListener("change", async () => {
  avatarPreview.src = await getFileDataUrl(avatarInput.files[0]);
});

function toggleModal(name, force) {
  const shouldHide = force !== undefined ? !force : undefined;
  const modalEl = document.querySelector(`.modal.${name}`);
  modalEl.classList.toggle("hidden", shouldHide);
  document.body.classList.toggle("no-scroll", !modalEl.classList.contains("hidden"));
}

function triggerMatchmaking(modeName) {
  alert(`Entering Matchmaking Queue for: ${modeName}! Searching for worthy opponents...`);
  closeModal("play-modal");
}

function toggleSetting(element) {
  playAudio("click");
  element.classList.toggle("active");
  if (element.id === "particles-toggle") {
    particlesEnabled = element.classList.contains("active");
  }
}

function displayCollection() {
  collectionGrid.innerHTML = "";

  collectionGrid.innerHTML = CARD_LIBRARY.map((card) => {
    const cost = Math.floor((card.atk + card.hp) / 10);
    const ability = ABILITIES.find((ability) => ability.name === card.ability);

    return `
      <div class="card ${card.rarity}" onclick="flipCard(this)">
        <div class="card-inner">
          <div class="card-face card-back">
            <img src="${CARD_BACK_URL}/${card.cardBack || 0}.png">
          </div>
          <div class="card-face card-front">
            <div class="card-header">
              <span class="card-name truncated">${card.name}</span>
              <span class="card-cost">⚡${cost}</span>
            </div>
            <img class="card-artwork" src="${card.artwork}">
            <div class="card-footer">
              ${ability ? `<img class="card-ability" src="${ability.icon}">` : ""}
              <div class="card-stats">
                <div class="stat-atk">⚔️ ${card.atk}</div>
                <div class="stat-hp">💚 ${card.hp}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function updateUI() {
  const avatar = playerProfile.avatar || "assets/images/avatars/0.png";
  avatarPreview.src = avatar;
  usernameInput.value = playerProfile.username;
  bioInput.value = playerProfile.bio;
  document.querySelector(".profile-display .name").textContent = playerProfile.username;
  document.querySelector(".profile-display .avatar img").src = avatar;
}

async function updateProfile() {
  try {
    const avatar = avatarInput.files[0] ? await getFileDataUrl(avatarInput.files[0]) : playerProfile.avatar;

    const newProfile = {
      avatar: avatar,
      username: usernameInput.value,
      bio: bioInput.value,
    };

    playerProfile = newProfile;
    save("playerProfile", playerProfile);
    Toast.show("Profile updated successfully");

    updateUI();
    toggleModal("profile-modal", false);
  } catch (error) {
    console.error(error);
    Toast.show(error);
  }
}

function generateUsername() {
  const usernames = USERNAMES.slice(0, 7).filter((item) => item !== usernameInput.value);
  usernameInput.value = getRandomItem(usernames);
}
