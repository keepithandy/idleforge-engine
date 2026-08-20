window.DEPTH_ENGINE_SAVE_NOTICE = "";
window.DEPTH_ENGINE_SAVE_WRITE_BLOCKED = false;
window.DEPTH_ENGINE_BLOCKED_SAVE_EXPORT_TEXT = "";

window.setDepthEngineSaveNotice = function setDepthEngineSaveNotice(message = "") {
  window.DEPTH_ENGINE_SAVE_NOTICE = typeof message === "string" ? message : "";
};

window.getDepthEngineSaveNotice = function getDepthEngineSaveNotice() {
  return window.DEPTH_ENGINE_SAVE_NOTICE || "";
};

window.getSaveVersionCompatibility = function getSaveVersionCompatibility(version) {
  const currentVersion = window.DEPTH_ENGINE_SAVE_VERSION;
  const validVersion = typeof version === "number"
    && Number.isFinite(version)
    && Number.isInteger(version)
    && version >= 1;

  if (!validVersion) {
    return {
      status: "malformed",
      sourceVersion: null,
      currentVersion,
      knownCompatible: false
    };
  }

  if (version < currentVersion) {
    return {
      status: "legacy",
      sourceVersion: version,
      currentVersion,
      knownCompatible: true
    };
  }

  if (version === currentVersion) {
    return {
      status: "current",
      sourceVersion: version,
      currentVersion,
      knownCompatible: true
    };
  }

  return {
    status: "future",
    sourceVersion: version,
    currentVersion,
    knownCompatible: false
  };
};

window.getSaveDataCompatibility = function getSaveDataCompatibility(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      allowed: false,
      reason: "invalid-data",
      message: "That file is not a valid Depth Engine save. Your current save was left unchanged."
    };
  }

  const rawVersion = data.version === undefined ? 1 : data.version;
  const version = typeof rawVersion === "string" && /^\d+$/.test(rawVersion)
    ? Number(rawVersion)
    : rawVersion;
  const versionCompatibility = window.getSaveVersionCompatibility(version);

  if (!versionCompatibility.knownCompatible) {
    const message = versionCompatibility.status === "future"
      ? "This save was created by a newer Depth Engine version. It was not loaded or replaced; export it as a backup before resetting."
      : "This save has an invalid version. It was not loaded or replaced; export it as a backup before resetting.";
    return {
      allowed: false,
      reason: versionCompatibility.status,
      message,
      versionCompatibility
    };
  }

  const activeExampleId = window.getActiveExample?.().id || "example";
  const sourceExampleId = typeof data.exampleId === "string" && data.exampleId.trim()
    ? data.exampleId.trim()
    : null;

  if (sourceExampleId && sourceExampleId !== activeExampleId) {
    return {
      allowed: false,
      reason: "wrong-example",
      message: `This save belongs to ${sourceExampleId}, not the active ${activeExampleId} example. Switch examples before importing; your current save was left unchanged.`,
      versionCompatibility
    };
  }

  return {
    allowed: true,
    reason: null,
    message: "",
    versionCompatibility
  };
};

window.normalizeSaveState = function normalizeSaveState(data) {
  const base = window.createNewState();
  const source = data && typeof data === "object" ? data : {};
  // Legacy saves may contain floor/currentFloor/maxFloor; repair them into stage fields.
  const { currentFloor, floor, maxFloor, ...sourceWithoutLegacyStage } = source;
  const activeExample = window.getActiveExample?.() || { id: "example" };
  const sourcePlayer = source.player && typeof source.player === "object" && !Array.isArray(source.player)
    ? source.player
    : {};
  const finiteNumberOr = (value, fallback) => {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  };
  const maxHp = Math.max(1, Math.floor(finiteNumberOr(sourcePlayer.maxHp, base.player.maxHp)));
  const player = {
    ...base.player,
    ...sourcePlayer,
    level: Math.max(1, Math.floor(finiteNumberOr(sourcePlayer.level, base.player.level))),
    xp: Math.max(0, Math.floor(finiteNumberOr(sourcePlayer.xp, base.player.xp))),
    hp: Math.min(maxHp, Math.max(0, Math.floor(finiteNumberOr(sourcePlayer.hp, base.player.hp)))),
    maxHp,
    attack: finiteNumberOr(sourcePlayer.attack, base.player.attack),
    defense: finiteNumberOr(sourcePlayer.defense, base.player.defense),
    currency: Math.max(0, Math.floor(finiteNumberOr(sourcePlayer.currency, base.player.currency)))
  };
  // The active example configuration owns the progression cap. Saved maxStage/maxFloor
  // values are compatibility inputs only and must not redefine the current route.
  const maxStage = base.maxStage;
  const stageSource = source.currentStage ?? currentFloor ?? floor ?? base.currentStage;
  const currentStage = window.clampStage(stageSource, maxStage);
  const itemExists = (id) => typeof id === "string" && Boolean(window.getItemById(id));
  const equipmentSlots = ["weapon", "head", "body", "feet", "offhand", "trinket"];
  const repairedEquipment = equipmentSlots.reduce((equipment, slot) => {
    const itemId = source.equipment?.[slot];
    const item = itemExists(itemId) ? window.getItemById(itemId) : null;
    equipment[slot] = item && item.slot === slot ? item.id : null;
    return equipment;
  }, {});

  return {
    ...base,
    ...sourceWithoutLegacyStage,
    exampleId: activeExample.id,
    player,
    currentStage,
    maxStage,
    equipment: repairedEquipment,
    inventory: Array.isArray(source.inventory) ? source.inventory.filter(itemExists) : [],
    log: Array.isArray(source.log) ? source.log.filter((entry) => typeof entry === "string") : base.log,
    completed: Boolean(source.completed) && currentStage >= maxStage,
    version: Math.max(window.DEPTH_ENGINE_SAVE_VERSION, Number(source.version) || 0)
  };
};

window.loadGame = function loadGame() {
  window.DEPTH_ENGINE_SAVE_WRITE_BLOCKED = false;
  window.DEPTH_ENGINE_BLOCKED_SAVE_EXPORT_TEXT = "";

  let raw;
  try {
    raw = window.localStorage.getItem(window.GAME_CONFIG.saveKey);
  } catch {
    window.setDepthEngineSaveNotice("Browser storage is unavailable. You can still play this session, but progress cannot be saved here.");
    return window.createNewState();
  }

  if (!raw) return window.createNewState();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    window.DEPTH_ENGINE_SAVE_WRITE_BLOCKED = true;
    window.DEPTH_ENGINE_BLOCKED_SAVE_EXPORT_TEXT = raw;
    window.setDepthEngineSaveNotice("The stored save is malformed. It was not replaced; export it as a backup before resetting.");
    return window.createNewState();
  }

  const compatibility = window.getSaveDataCompatibility(parsed);
  if (!compatibility.allowed) {
    window.DEPTH_ENGINE_SAVE_WRITE_BLOCKED = true;
    window.DEPTH_ENGINE_BLOCKED_SAVE_EXPORT_TEXT = raw;
    window.setDepthEngineSaveNotice(compatibility.message);
    return window.createNewState();
  }

  return window.normalizeSaveState(parsed);
};

window.saveGame = function saveGame() {
  window.GameState.exampleId = window.getActiveExample?.().id || window.GameState.exampleId || "example";
  if (window.DEPTH_ENGINE_SAVE_WRITE_BLOCKED) return false;

  try {
    window.localStorage.setItem(window.GAME_CONFIG.saveKey, JSON.stringify(window.GameState));
    return true;
  } catch {
    window.setDepthEngineSaveNotice("Browser storage is unavailable. Your progress is only available until this page closes.");
    return false;
  }
};

window.getSaveExportFileName = function getSaveExportFileName() {
  return window.GAME_CONFIG?.exportFileName || "depth-engine-save.json";
};

window.exportSave = function exportSave() {
  const blockedSource = window.DEPTH_ENGINE_BLOCKED_SAVE_EXPORT_TEXT;
  const filename = blockedSource
    ? window.getSaveExportFileName().replace(/\.json$/i, "-blocked-backup.json")
    : window.getSaveExportFileName();
  const source = blockedSource || JSON.stringify(window.GameState, null, 2);
  const blob = new Blob([source], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

window.importSave = async function importSave(file) {
  let data;
  try {
    const text = await file.text();
    data = JSON.parse(text);
  } catch {
    window.setDepthEngineSaveNotice("That file could not be read as JSON. Your current save was left unchanged.");
    return { ok: false, reason: "invalid-json" };
  }

  const compatibility = window.getSaveDataCompatibility(data);
  if (!compatibility.allowed) {
    window.setDepthEngineSaveNotice(compatibility.message);
    return { ok: false, reason: compatibility.reason };
  }

  window.DEPTH_ENGINE_SAVE_WRITE_BLOCKED = false;
  window.DEPTH_ENGINE_BLOCKED_SAVE_EXPORT_TEXT = "";
  window.GameState = window.normalizeSaveState({ ...data, log: Array.isArray(data.log) ? data.log : ["Save imported."] });
  const saved = window.saveGame();
  if (saved) window.setDepthEngineSaveNotice("Save imported.");
  window.render();
  return { ok: saved, reason: saved ? null : "storage-unavailable" };
};

window.resetSave = function resetSave() {
  window.DEPTH_ENGINE_SAVE_WRITE_BLOCKED = false;
  window.DEPTH_ENGINE_BLOCKED_SAVE_EXPORT_TEXT = "";
  window.GameState = window.createNewState();
  const saved = window.saveGame();
  if (saved) window.setDepthEngineSaveNotice("Save reset.");
  window.render();
  return saved;
};
