window.GameState = {
  player: null,
  floor: 1,
  inventory: [],
  equipment: { weapon: null, head: null, feet: null, offhand: null, trinket: null },
  log: [],
  completed: false,
  version: 1
};

window.cloneState = function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
};

window.getItemById = function getItemById(id) {
  return (window.ITEMS || []).find((item) => item.id === id) || null;
};

window.getEnemyById = function getEnemyById(id) {
  return (window.ENEMIES || []).find((enemy) => enemy.id === id) || null;
};

window.getZoneByFloor = function getZoneByFloor(floor) {
  return (window.ZONES || []).find((zone) => zone.floor === floor) || null;
};

window.createNewState = function createNewState() {
  return {
    player: { ...window.GAME_CONFIG.basePlayer },
    floor: 1,
    inventory: [],
    equipment: { weapon: null, head: null, feet: null, offhand: null, trinket: null },
    completed: false,
    log: ["You enter the cellar."],
    version: 1
  };
};
