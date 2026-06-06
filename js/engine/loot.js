window.rollLoot = function rollLoot(enemy) {
  const drops = [];
  (enemy.loot || []).forEach((id) => {
    if (Math.random() < 0.5) {
      const item = window.getItemById(id);
      if (item) drops.push(item);
    }
  });
  return drops;
};
