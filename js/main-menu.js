const collectionGrid = document.querySelector(".collection-modal .items-grid");
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
  modalEl.classList.toggle("hidden", force);
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

  collectionGrid.innerHTML = CARD_LIBRARY.map((item) => {
    const itemCost = Math.floor((item.atk + item.hp) / 10);
    return `
      <div class="item ${item.rarity}">
        <div class="artwork" style="background-image: url('${item.artwork}')"></div>
        <div class="card-overlay"></div>
        <div class="card-header">
            <span class="name truncated">${item.name}</span>
            <div class="cost">${itemCost}</div>
        </div>
        <div class="card-footer">
          <span>⚔️ ${item.atk}</span>
          <span>💚 ${item.hp}</span>
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
  document.querySelector(".profile-display .avatar img").src = avatar;
}

async function updateProfile() {
  try {
    const newProfile = {
      avatar: await getFileDataUrl(avatarInput.files[0]),
      username: usernameInput.value,
      bio: bioInput.value,
    };

    playerProfile = newProfile;
    save("playerProfile", playerProfile);
    Toast.show("Profile successfully updated");

    updateUI();
    toggleModal("profile-modal", false);
  } catch (error) {
    console.error(error);
    Toast.show(error);
  }
}
