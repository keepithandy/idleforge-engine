// Example game config for the currently loaded sample content.
// Keep the engine title generic and let the example only define data values.
window.GAME_CONFIG = {
  title: "IdleForge RPG Engine",
  currencyName: "Coins",
  maxFloor: 20,
  saveKey: "idleforge-demo-save-v2",
  basePlayer: {
    level: 1,
    xp: 0,
    hp: 30,
    maxHp: 30,
    attack: 5,
    defense: 2,
    currency: 0
  },
  levelCurve: {
    xpBase: 20,
    xpGrowth: 1.35
  }
};
