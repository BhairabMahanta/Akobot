const mobs = {
  "monsterA": {
    name: 'monsterA',
    stats: {
      hp: 100,
      attack: 50,
      defense: 40,
      speed: 101,
      mana: 200,
      // Other magical stats
    },
    abilities: ["Fire Breath", "Tail Swipe"],
    attackPattern: ["Basic Attack", "Fire Breath", "Tail Swipe"]
  },
  "monsterB": {
    name: 'monsterB',
    stats: {
      hp: 80,
      attack: 70,
      defense: 30,
      speed: 110,
      mana: 100,
      // Other magical stats
    },
    abilities: ["Venom Strike", "Web Trap"],
    attackPattern: ["Basic Attack", "Venom Strike", "Web Trap"]
  },
  // Add more NPC boss characters...
};
module.exports =  {mobs};