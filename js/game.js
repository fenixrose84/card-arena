const navbar = document.querySelector(".navbar");
const playerHandEl = document.getElementById("player-hand");
const playerSlotEls = document.querySelectorAll(".player-side.slots > *");
const enemySlotEls = document.querySelectorAll(".enemy-side.slots > *");
const btnStart = document.getElementById("btn-start");
const btnAuto = document.getElementById("btn-auto-fill");
const btnClear = document.getElementById("btn-clear");
const modalOverlay = document.getElementById("end-modal");
const costDisplay = document.querySelector(".cost-display");

const sceneries = [SCENERIES.medievalCastle, SCENERIES.darkTower, SCENERIES.forestRuins];
const maxCost = 20;

let slotCount = 3;
let playerHand = [];
let enemyHand = [];
let playerSlots = getEmptySlots();
let enemySlots = getEmptySlots();

let totalCost = 0;
let isBattling = false;
let battleSpeed = 1000;

document.addEventListener("DOMContentLoaded", () => {
  initGame();

  document.body.style.background = `
    var(--overlay-gradient),
    url("${getRandomItem(sceneries)}")
    center / cover no-repeat
  `;

  navbar.innerHTML = `
    <div class="avatar">
      <img src="${playerProfile.avatar || "assets/images/avatars/0.png"}">
      <span>${playerProfile.username}</span>
    </div>
    <img src="assets/images/icons/crossed-swords.png" class="versus-icon">
    <div class="avatar">
      <img src="${enemyProfile.avatar}">
      <span>${enemyProfile.username}</span>
    </div>
  `;
});

function getEmptySlots() {
  return Array.from({ length: 5 }, () => null);
}

function getCards(count) {
  const cards = getUniqueItems(CARD_LIBRARY, count);
  return cards;
}

function initGame() {
  setPlayerHand();
  renderPlayerSlots();

  setEnemyHand();
  autoDraft(true);

  setupEventListeners();
  setTotalCost();
}

function createCardInstance(template) {
  return {
    ...template,
    instanceId: "card_" + Math.random().toString(36).substr(2, 9),
    cost: parseInt((template.hp + template.atk) / 10),
    hp: template.hp,
    maxHp: template.hp,
    isDead: false,
    currentAtk: template.atk,
  };
}

function setPlayerHand() {
  const cards = getCards(6);
  playerHand = cards.map((card) => createCardInstance(card));
  playerSlots = getEmptySlots();
  renderHand();
}

function setEnemyHand() {
  const cards = getCards(6);
  enemyHand = cards.map((card) => createCardInstance(card));
  enemySlots = getEmptySlots();
}

function createCardDOM(card, isEnemy = false, isFlipped = false) {
  const cardEl = document.createElement("div");
  cardEl.className = `card ${card.rarity}${isEnemy ? " enemy-card" : ""}${isFlipped ? " flipped" : ""}`;
  cardEl.dataset.instanceId = card.instanceId;

  const ability = ABILITIES.find((ability) => ability.name === card.ability);

  // Wrap content inside an inner container with front and back faces
  cardEl.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <img src="${CARD_BACK_URL}/${card.cardBack || 0}.png">
      </div>
      <div class="card-face card-front">
        <div class="card-header">
          <span class="card-name truncated">${card.name}</span>
          <span class="card-cost">⚡${card.cost}</span>
        </div>
        <img class="card-artwork" src="${card.artwork}">
        <div class="card-footer">
          ${ability ? `<img class="card-ability" src="${ability.icon}">` : ""}
          <div class="card-stats">
            <div class="stat-atk">⚔️ ${card.currentAtk}</div>
            <div class="stat-hp">💚 ${card.hp}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (card.isDead) cardEl.classList.add("dead");

  cardEl.addEventListener("click", () => {
    flipCard(cardEl);
    if (!isEnemy && !isBattling) {
      handleHandCardClick(card);
    }
  });

  return cardEl;
}

function flipCard(cardEl, force) {
  cardEl.classList.toggle("flipped", force !== undefined ? !force : undefined);
}

function renderHand() {
  playerHandEl.innerHTML = "";
  playerHand.forEach((card) => {
    const inSlot = playerSlots.some((s) => s && s.instanceId === card.instanceId);
    const cardEl = createCardDOM(card);
    if (inSlot) cardEl.classList.add("selected-for-deck");
    playerHandEl.appendChild(cardEl);
  });

  const selectedCount = playerSlots.filter(Boolean).length;
  btnStart.disabled = selectedCount === 0 || isBattling;
}

function renderPlayerSlots() {
  playerSlotEls.forEach((slotEl, i) => {
    slotEl.innerHTML = "";
    const card = playerSlots[i];
    if (card) {
      slotEl.classList.remove("empty");
      const cardEl = createCardDOM(card);
      cardEl.dataset.index = i;
      cardEl.addEventListener("click", () => unplaceCard(i));
      slotEl.appendChild(cardEl);
    } else {
      slotEl.classList.add("empty");
    }
  });
}

async function renderEnemySlots() {
  const randomCardBack = randomInt(0, 15);
  for (let i = 0; i < slotCount; i++) {
    await sleep(1000);

    const slotEl = enemySlotEls[i];
    slotEl.innerHTML = "";
    const card = enemySlots[i];
    if (card) {
      const cardEl = createCardDOM({ ...card, cardBack: randomCardBack }, true, true);
      cardEl.dataset.index = i;
      slotEl.appendChild(cardEl);
    }
  }

  await sleep(1000);

  for (let i = 0; i < slotCount; i++) {
    const cardEl = enemySlotEls[i].querySelector(`.card[data-index="${i}"]`);
    if (cardEl) {
      cardEl.classList.toggle("flipped", false);
      await sleep(300);
    }
  }
}

function handleHandCardClick(card) {
  if (isBattling) return;

  const existingIndex = playerSlots.findIndex((s) => s && s.instanceId === card.instanceId);
  if (existingIndex !== -1) {
    playerSlots[existingIndex] = null;
  } else {
    const emptyIndex = playerSlots.findIndex((s) => s === null);
    if (emptyIndex !== -1 && isCostAllowed(card.cost)) {
      playerSlots[emptyIndex] = card;
    }
  }

  setTotalCost();
  renderHand();
  renderPlayerSlots();
}

function unplaceCard(slotIndex) {
  if (isBattling) return;
  playerSlots[slotIndex] = null;
  setTotalCost();
  renderHand();
  renderPlayerSlots();
}

function setTotalCost() {
  totalCost = playerSlots.reduce((sum, slot) => sum + (Number(slot?.cost) || 0), 0);
  costDisplay.innerHTML = `<img src="assets/images/icons/lightning-spell.png"> ${totalCost}/${maxCost}`;
}

function isCostAllowed(cost) {
  return totalCost + cost <= maxCost;
}

function autoDraft(isEnemy = false) {
  if (isBattling) return;

  const hand = isEnemy ? enemyHand : playerHand;
  const slots = getEmptySlots();
  let totalCost = 0;
  for (let i = 0; i < slotCount; i++) {
    const allowedCards = hand.filter((card) => card.cost <= maxCost - totalCost && !slots.some((slotCard) => slotCard?.name === card.name));
    const card = getRandomItem(allowedCards);

    if (!card) break;

    slots[i] = card;
    totalCost += card.cost;
  }

  if (!isEnemy) {
    playerSlots = slots;
    setTotalCost();
    renderHand();
    renderPlayerSlots();
  } else {
    enemySlots = slots;
    renderEnemySlots();
  }
}

function clearSlots() {
  if (isBattling) return;
  playerSlots = getEmptySlots();
  setTotalCost();
  renderHand();
  renderPlayerSlots();
}

async function startBattle() {
  if (isBattling) return;
  const activePlayerCards = playerSlots.filter(Boolean);
  if (activePlayerCards.length === 0) return;

  isBattling = true;
  btnStart.disabled = true;
  btnAuto.disabled = true;
  btnClear.disabled = true;

  let safetyCounter = 0;
  const MAX_TURNS = 100;

  while (safetyCounter < MAX_TURNS) {
    safetyCounter++;

    const playerAlive = playerSlots.filter((c) => c && !c.isDead);
    const enemyAlive = enemySlots.filter((c) => c && !c.isDead);

    if (playerAlive.length === 0 || enemyAlive.length === 0) {
      break;
    }

    const queue = shuffle([...playerAlive, ...enemyAlive]);

    for (const attacker of queue) {
      if (attacker.isDead) continue;

      const isPlayerAttacker = playerSlots.some((s) => s && s.instanceId === attacker.instanceId);
      const targets = isPlayerAttacker ? enemySlots.filter((c) => c && !c.isDead) : playerSlots.filter((c) => c && !c.isDead);

      if (targets.length === 0) break;

      // Random target selection per turn
      const target = targets[Math.floor(Math.random() * targets.length)];

      await executeAttackTurn(attacker, target, isPlayerAttacker);

      const checkPlayer = playerSlots.filter((c) => c && !c.isDead);
      const checkEnemy = enemySlots.filter((c) => c && !c.isDead);
      if (checkPlayer.length === 0 || checkEnemy.length === 0) break;
    }
  }

  const isWin = playerSlots.filter((c) => c && !c.isDead).length > 0;
  showEndModal(isWin);
}

function getAttackAnimation(attackerEl, targetEl, isPlayerAttacker) {
  let face = isPlayerAttacker ? "right" : "left";
  const direction = attackerEl.dataset.index - targetEl.dataset.index;

  if (direction > 0) face += "-top";
  else if (direction < 0) face += "-bottom";

  return `attack-${face} 0.5s`;
}

async function executeAttackTurn(attacker, target, isPlayerAttacker) {
  const attackerEl = getCardDOMElement(attacker.instanceId);
  const targetEl = getCardDOMElement(target.instanceId);

  if (!attackerEl || !targetEl) return;

  attackerEl.classList.add("active-attacker");
  attackerEl.style.animation = getAttackAnimation(attackerEl, targetEl, isPlayerAttacker);
  targetEl.classList.add("targeted");

  flipCard(attackerEl, true);
  flipCard(targetEl, true);

  if (battleSpeed > 0) await sleep(battleSpeed * 0.3);

  const lungeClass = isPlayerAttacker ? "anim-lunge-player" : "anim-lunge-enemy";
  attackerEl.classList.add(lungeClass);

  let damage = attacker.currentAtk;
  let isCrit = Math.random() < 0.25;

  if (isCrit || attacker.ability === "Venom" || attacker.ability === "Heavy Hit") {
    damage = Math.floor(damage * 1.4);
  }

  if (target.ability === "Shield") {
    damage = Math.max(1, damage - 5);
    spawnFloatingText(targetEl, `<img src="${getAbility("Shield").icon}"> -5`, "shield");
  }

  target.hp = Math.max(0, target.hp - damage);
  targetEl.classList.add("anim-shake");
  spawnFloatingText(targetEl, `-${damage}`, isCrit ? "crit" : "damage");

  if (attacker.ability === "Life Steal" && damage > 0) {
    const healAmt = Math.floor(damage * 0.35);
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
    spawnFloatingText(attackerEl, `<img src="${getAbility("Life Steal").icon}"> +${healAmt}`, "heal");
  }

  if (target.ability === "Thorns" && !attacker.isDead) {
    const thornDamage = 4;
    attacker.hp = Math.max(0, attacker.hp - thornDamage);
    spawnFloatingText(attackerEl, `<img src="${getAbility("Thorns").icon}"> -${thornDamage}`, "damage");
  }

  if (target.hp <= 0) {
    target.isDead = true;
  }

  if (attacker.hp <= 0) {
    attacker.isDead = true;
  }

  updateCardDOMStats(attacker, attackerEl);
  updateCardDOMStats(target, targetEl);

  if (battleSpeed > 0) await sleep(battleSpeed * 0.5);

  attackerEl.classList.remove("active-attacker", lungeClass);
  targetEl.classList.remove("targeted", "anim-shake");

  if (attacker.ability === "Double Strike" && !attacker.isDead && !target.isDead && Math.random() < 0.3) {
    await executeAttackTurn(attacker, target, isPlayerAttacker);
  }
}

function updateCardDOMStats(card, cardEl) {
  if (!cardEl) return;
  const hpFill = cardEl.querySelector(".card-hp-fill");
  const statHp = cardEl.querySelector(".stat-hp");

  if (statHp) {
    statHp.childNodes[0].nodeValue = `💚 ${card.hp} `;
  }
  if (hpFill) {
    const pct = Math.max(0, (card.hp / card.maxHp) * 100);
    hpFill.style.width = `${pct}%`;
    if (pct < 30) hpFill.style.backgroundColor = "#ef4444";
    else if (pct < 60) hpFill.style.backgroundColor = "#f59e0b";
  }

  if (card.isDead) {
    cardEl.classList.add("dead");
  }
}

function getCardDOMElement(instanceId) {
  return document.querySelector(`[data-instance-id="${instanceId}"]`);
}

function spawnFloatingText(parentEl, content, type = "damage") {
  const element = document.createElement("div");
  element.className = `floating-text ${type}`;
  element.innerHTML = content;
  parentEl.parentElement.appendChild(element);

  setTimeout(() => {
    element.remove();
  }, 900);
}

function showEndModal(isWin) {
  const title = document.getElementById("modal-title");
  const desc = document.getElementById("modal-desc");

  if (isWin) {
    title.textContent = "🏆 VICTORY!";
    title.className = "modal-title win";
    desc.textContent = `Opponent dominated! Ready for the next match?`;
  } else {
    title.textContent = "💀 DEFEAT!";
    title.className = "modal-title lose";
    desc.textContent = `Your lineup fell. Redraft your deck and try again!`;
  }

  modalOverlay.classList.add("active");
}

function setupEventListeners() {
  btnStart.addEventListener("click", startBattle);
  btnAuto.addEventListener("click", () => autoDraft());
  btnClear.addEventListener("click", clearSlots);
}

function getAbility(name) {
  const ability = ABILITIES.filter((ability) => ability.name === name)[0];
  return ability;
}
