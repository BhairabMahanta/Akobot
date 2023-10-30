// quests.js
const quests = {
  "monster_subjugation": {
    id: "monster_subjugation",
    title: "Monster Subjugation",
    description: "Defeat 3 monsters in the Forest Clearing.",
    type: "Hunt",
    objectives: [
      {
        id: "goblin_defeat",
        description: "Defeat a monsterA",
        target: "monsterA",
        current: 0,
        required: 1,
      },
      {
        id: "wolf_defeat",
        description: "Defeat two monsterB",
        target: "monsterB",
        current: 0,
        required: 2,
      },
    ],
    rewards: [{
      experience: 500,
      items: ["Health Potion", "Gold"],
    }],
    timeLimit: 7 
  },
  "gather_ingredients": {
    id: "gather_ingredients",
    title: "Gather Ingredients",
    description: "Collect 5 herbs and 3 mushrooms.",
    type: "Hunt",
    objectives: [
      {
        id: "herb_collect",
        description: "Collect Herbs",
        target: "Herb",
        current: 0,
        required: 5,
      },
      {
        id: "mushroom_collect",
        description: "Collect Mushrooms",
        target: "Mushroom",
        current: 0,
        required: 3,
      },
    ],
    rewards: [{
      experience: 100,
      items: ["Health Potion", "Gold"],
    }],
    timeLimit: 7 
  },
  "defeat_spiders": {
    id: "defeat_spiders",
    title: "Defeat the Spiders",
    description: "Defeat 5 Giant Spiders.",
    type: "Hunt",
    objectives: [
      {
        id: "spider_defeat",
        description: "Defeat Giant Spiders",
        target: "Giant Spider",
        current: 0,
        required: 5,
      }
    ],
    rewards: [{
      experience: 150,
      items: ["Spider Silk", "Silver"],
    }],
    timeLimit: 7 
  },
  "conquer_temple": {
    id: "conquer_temple",
    title: "Conquer the Temple",
    description: "Defeat the Guardian Boss of the Ruined Temple.",
    type: "Hunt",
    objectives: [
      {
        id: "guardian_defeat",
        description: "Defeat Guardian Boss",
        target: "Guardian Boss",
        current: 0,
        required: 1,
      }
    ],
    rewards: [{
      experience: 500,
      items: ["Ancient Relic", "Golden Key"],
    }],
    timeLimit: 7 
  }
  // Define more quests...
};

module.exports = {quests};
