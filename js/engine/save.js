window.loadGame = function loadGame() {
  const raw = localStorage.getItem(window.GAME_CONFIG.saveKey);
  if (!raw) return window.createNewState();
  try {
    const parsed = JSON.parse(raw);
    return {
      ...window.createNewState(),
      ...parsed,
      player: { ...window.GAME_CONFIG.basePlayer, ...(parsed.player || {}) },
      equipment: { weapon: null, head: null, feet: null, offhand: null, trinket: null, ...(parsed.equipment || {}) },
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
      log: Array.isArray(parsed.log) ? parsed.log : [],
      completed: Boolean(parsed.completed)
    };
  } catch {
    return window.createNewState();
  }
};

window.saveGame = function saveGame() {
  localStorage.setItem(window.GAME_CONFIG.saveKey, JSON.stringify(window.GameState));
};

window.exportSave = function exportSave() {
  const blob = new Blob([JSON.stringify(window.GameState, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "idleforge-save.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

window.importSave = async function importSave(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  window.GameState = {
    ...window.createNewState(),
    ...data,
    player: { ...window.GAME_CONFIG.basePlayer, ...(data.player || {}) },
    equipment: { weapon: null, head: null, feet: null, offhand: null, trinket: null, ...(data.equipment || {}) },
    inventory: Array.isArray(data.inventory) ? data.inventory : [],
    log: Array.isArray(data.log) ? data.log : ["Save imported."],
    completed: Boolean(data.completed)
  };
  window.saveGame();
  window.render();
};

window.resetSave = function resetSave() {
  window.GameState = window.createNewState();
  window.saveGame();
  window.render();
};
