// cards.js
const cards = {
  "Fire Dragon": {
    id: 1,
    name: 'Fire Dragon',
    element: 'Fire',
    tier: 'Rare',
    stats: {
      attack: 80,
      defense: 60,
      speed: 98,
      hp: 100,
    },
    moves: [
      {
        id: 1,
        name: 'Flame Strike',
        description: 'Attack with a fiery strike',
        power: 20,
        cooldown: 3,
      },
      {
        id: 2,
        name: 'Dragon Claw',
        description: 'Slash with powerful dragon claws',
        power: 15,
        cooldown: 2,
      },
      // Add more moves as needed
    ],
    // Other card-related data like images, frames, etc.
  },
  "Water Nymph": {
    id: 2,
    name: 'Water Nymph',
    element: 'Water',
    tier: 'Rare',
    stats: {
      attack: 65,
      defense: 70,
      speed: 99,
      hp: 90,
    },
    moves: [
      {
        id: 3,
        name: 'Aqua Blast',
        description: 'Blast your opponent with water',
        power: 20,
        cooldown: 3,
      },
      {
        id: 4,
        name: 'Healing Wave',
        description: 'Heal yourself with water energy',
        power: -25, // healing ig
        cooldown: 3,
      },
      //  more moves sexy    ],
]
  // Add more cards if i want fr 
},
};

module.exports = {cards};
