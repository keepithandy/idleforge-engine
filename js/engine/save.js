window.normalizeSaveState = function normalizeSaveState(data) {
  const base = window.createNewState();
  const source = data && typeof data === "object" ? data : {};
  const player = { ...window.GAME_CONFIG.basePlayer, ...(source.player || {}) };
  const floor = Number.isFinite(Number(source.floor)) ? Math.min(Math.max(1, Math.floor(Number(source.floor))), window.GAME_CONFIG.maxFloor) : base.floor;
  return {
    ...base,
    ...source,
    player,
    floor,
    equipment: { weapon: null, head: null, body: null, feet: null, offhand: null, trinket: null, ...(source.equipment || {}) },
    inventory: Array.isArray(source.inventory) ? source.inventory.filter((id) => typeof id === "string") : [],
    log: Array.isArray(source.log) ? source.log.filter((entry) => typeof entry === "string") : base.log,
    completed: Boolean(source.completed) && floor >= window.GAME_CONFIG.maxFloor,
    version: Math.max(2, Number(source.version) || 0)
  };
};

window.loadGame = function loadGame() {
  const raw = localStorage.getItem(window.GAME_CONFIG.saveKey);
  if (!raw) return window.createNewState();
  try {
    const parsed = JSON.parse(raw);
    return window.normalizeSaveState(parsed);
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
  window.GameState = window.normalizeSaveState({ ...data, log: Array.isArray(data.log) ? data.log : ["Save imported."] });
  window.saveGame();
  window.render();
};

window.resetSave = function resetSave() {
  window.GameState = window.createNewState();
  window.saveGame();
  window.render();
};
