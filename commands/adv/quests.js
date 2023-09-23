// quests.js
const quests = {
  "Gather Ingredients": {
    location: 'Forest Clearing',
    title: 'Gather Ingredients',
    objective: 'Collect 5 herbs and 3 mushrooms.',
    time: '7 Days',
    type: "Hunt, Kill, ",
    special: "False",
    rewards: [
       {
      'experience': 100,
      'items': ['Health Potion', 'Gold']
    }
  ]
  },
  "Monster Subjugation": {
    location: 'Forest Clearing',
    title: 'Monster Subjugation',
    objective: 'Defeat any 3 monsters you see around.',
    time: '7 Days',
    type: "Hunt, Kill, ",
    special: "False",
    rewards: [
       {
      'experience': 500,
      'items': ['Health Potion', 'Gold']
    }
  ]
  },
 "Defeat the Spiders": {
    location: 'Cave Entrance',
    title: 'Defeat the Spiders',
    objective: 'Defeat 5 Giant Spiders.',
   time: '7 Days',
    type: "Hunt, Kill, ",
    special: "False",
    rewards: [
      {
      'experience': 150,
      'items': ['Spider Silk', 'Silver']
    }
  ]
 },
"Conquer the Temple": {
    location: 'Ruined Temple',
    title: 'Conquer the Temple',
    objective: 'Defeat the Guardian Boss of the Ruined Temple.',
  time: '7 Days',
    type: "Hunt, Kill, ",
    special: "False",
    rewards: [
      {
      'experience': 500,
      'items': ['Ancient Relic', 'Golden Key']
    }
  ]
},
  // Define more quests...
};



module.exports = {quests};
