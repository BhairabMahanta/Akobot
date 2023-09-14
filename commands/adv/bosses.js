const bosses = {
  "Dragon Lord": {
    name: 'Dragon Lord',
    physicalStats: {
      hp: 1000,
      attack: 150,
      defense: 100,
      speed: 80
    },
    magicalStats: {
      mana: 200,
      // Other magical stats
    },
    abilities: ["Fire Breath", "Tail Swipe"],
    attackPattern: ["Basic Attack", "Fire Breath", "Tail Swipe"]
  },
  "Giant Spider": {
    name: 'Giant Spider',
    physicalStats: {
      hp: 800,
      attack: 120,
      defense: 80,
      speed: 120
    },
    magicalStats: {
      mana: 100,
      // Other magical stats
    },
    abilities: ["Venom Strike", "Web Trap"],
    attackPattern: ["Basic Attack", "Venom Strike", "Web Trap"]
  },
  // Add more NPC boss characters...
};
module.exports =  {bosses};