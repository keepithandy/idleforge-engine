import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function readLocal(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const stored = new Map();
let storageBlocked = false;
let rendered = 0;
let clickedDownload = null;
let exportedBlob = null;

const context = vm.createContext({
  console,
  setTimeout(callback) { callback(); },
  Blob,
  URL: {
    createObjectURL(blob) {
      exportedBlob = blob;
      return "blob:depth-engine-smoke";
    },
    revokeObjectURL() {}
  },
  document: {
    createElement(tag) {
      assert.equal(tag, "a");
      return {
        href: "",
        download: "",
        click() { clickedDownload = this.download; }
      };
    }
  },
  localStorage: {
    getItem(key) {
      if (storageBlocked) throw new Error("storage blocked");
      return stored.get(key) ?? null;
    },
    setItem(key, value) {
      if (storageBlocked) throw new Error("storage blocked");
      stored.set(key, value);
    }
  },
  window: null
});
context.window = context;
context.render = () => { rendered += 1; };
context.DEPTH_ENGINE_EXAMPLE_META = { id: "roundtrip-fixture", name: "Round Trip Fixture", path: "examples/roundtrip-fixture" };
context.getActiveExample = () => context.DEPTH_ENGINE_EXAMPLE_META;
context.GAME_CONFIG = {
  title: "Round Trip Fixture",
  maxStage: 3,
  saveKey: "depth-engine-roundtrip-fixture-save",
  exportFileName: "roundtrip-fixture-save.json",
  startLog: "Round trip started.",
  basePlayer: { level: 1, xp: 0, hp: 30, maxHp: 30, attack: 5, defense: 2, currency: 0 }
};
context.ITEMS = [{ id: "fixture-blade", name: "Fixture Blade", slot: "weapon", attack: 2, defense: 0 }];

vm.runInContext(readLocal("./js/engine/state.js"), context, { filename: "state.js" });
vm.runInContext(readLocal("./js/engine/save.js"), context, { filename: "save.js" });

const knownState = context.createNewState();
knownState.player.level = 3;
knownState.player.xp = 7;
knownState.player.currency = 19;
knownState.currentStage = 2;
knownState.inventory = ["fixture-blade"];
knownState.equipment.weapon = "fixture-blade";
knownState.log = ["Known fixture state."];
context.GameState = knownState;

context.exportSave();
assert.equal(clickedDownload, "roundtrip-fixture-save.json", "export should use the active example filename");
assert.ok(exportedBlob, "export should create a JSON blob");
const exportedText = await exportedBlob.text();
const exportedData = JSON.parse(exportedText);
assert.equal(exportedData.player.level, 3);
assert.equal(exportedData.currentStage, 2);
assert.deepEqual(exportedData.inventory, ["fixture-blade"]);

context.GameState = context.createNewState();
const accepted = await context.importSave({ text: async () => exportedText });
assert.equal(accepted.ok, true, "compatible same-example imports should succeed");
assert.equal(context.GameState.exampleId, "roundtrip-fixture");
assert.equal(context.GameState.player.level, 3);
assert.equal(context.GameState.player.currency, 19);
assert.equal(context.GameState.currentStage, 2);
assert.deepEqual(Array.from(context.GameState.inventory), ["fixture-blade"]);
assert.equal(stored.has(context.GAME_CONFIG.saveKey), true, "import should save normalized state");
assert.equal(rendered, 1, "accepted import should render once");

const safeState = JSON.stringify(context.GameState);
const safeStored = stored.get(context.GAME_CONFIG.saveKey);
const malformed = await context.importSave({ text: async () => "{bad json" });
assert.equal(malformed.ok, false, "malformed JSON should return a safe failure result");
assert.equal(malformed.reason, "invalid-json", "malformed JSON should report its rejection reason");
assert.equal(JSON.stringify(context.GameState), safeState, "malformed import must leave the active state unchanged");
assert.equal(stored.get(context.GAME_CONFIG.saveKey), safeStored, "malformed import must leave the stored save unchanged");

const wrongExample = await context.importSave({ text: async () => JSON.stringify({ ...exportedData, exampleId: "other-example" }) });
assert.equal(wrongExample.ok, false, "cross-example imports should be rejected");
assert.equal(wrongExample.reason, "wrong-example", "cross-example imports should report their rejection reason");
assert.equal(JSON.stringify(context.GameState), safeState, "cross-example import must leave the active state unchanged");
assert.equal(stored.get(context.GAME_CONFIG.saveKey), safeStored, "cross-example import must leave the stored save unchanged");

const future = await context.importSave({ text: async () => JSON.stringify({ ...exportedData, version: context.DEPTH_ENGINE_SAVE_VERSION + 1 }) });
assert.equal(future.ok, false, "future-version imports should be rejected");
assert.equal(future.reason, "future", "future-version imports should report their rejection reason");
assert.equal(JSON.stringify(context.GameState), safeState, "future import must leave the active state unchanged");
assert.equal(stored.get(context.GAME_CONFIG.saveKey), safeStored, "future import must leave the stored save unchanged");

const blockedRaw = JSON.stringify({ ...exportedData, version: context.DEPTH_ENGINE_SAVE_VERSION + 1 });
stored.set(context.GAME_CONFIG.saveKey, blockedRaw);
const blockedState = context.loadGame();
assert.equal(blockedState.player.level, 1, "future stored saves should not load into the active state");
context.GameState = blockedState;
assert.equal(context.saveGame(), false, "blocked future saves should never be overwritten by autosave");
assert.equal(stored.get(context.GAME_CONFIG.saveKey), blockedRaw, "future stored saves must remain byte-for-byte preserved");
context.exportSave();
assert.equal(clickedDownload, "roundtrip-fixture-save-blocked-backup.json", "blocked saves should export with a distinct backup filename");
assert.equal(await exportedBlob.text(), blockedRaw, "blocked saves should export their original source text");

storageBlocked = true;
const volatileState = context.loadGame();
context.GameState = volatileState;
assert.equal(context.saveGame(), false, "storage failures should not throw or crash the game loop");
assert.match(context.getDepthEngineSaveNotice(), /storage is unavailable/i, "storage failures should provide player-facing recovery guidance");

console.log("Save export/import protection smoke passed.");
