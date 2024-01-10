const bosses = {
  "Dragon Lord": {
    name: 'Dragon Lord',
    stats: {
      hp: 1000,
      attack: 150,
      defense: 100,
      speed: 80,
      mana: 200,
      // Other magical stats
    },
    abilities: ["Fire Breath", "Tail Swipe"],
    attackPattern: ["Basic Attack", "Fire Breath", "Tail Swipe"],
    index: 0
  },
  "Giant Spider": {
    name: 'Giant Spider',
    stats: {
      hp: 800,
      attack: 120,
      defense: 80,
      speed: 120,
      mana: 100,
      // Other magical stats
    },
    abilities: ["Venom Strike", "Web Trap"],
    attackPattern: ["Basic Attack", "Venom Strike", "Web Trap"],
    index: 0
  },
  // Add more NPC boss characters...
};
module.exports =  {bosses};