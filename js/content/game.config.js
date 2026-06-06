// Edit this file first when you want to make a new version of the game.
// Keep the values simple: the engine reads these settings at startup and during save/load.
window.GAME_CONFIG = {
  title: "IdleForge v0.2",
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
