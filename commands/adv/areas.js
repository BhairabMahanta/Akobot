// area.js

const areas = {
  "Forest Clearing": {
    monsters: [
      {
        name: "monsterA",
        position: { x: 100, y: 200 }, // Fixed position for MonsterA
        amount: 4,
        type: 'mob',
        hasAllies: ['none'],
        waves: 2,
        rewards: {
          experience: 500,
          gold: 100,
          items: { Gold: 100},
        },
      }, 
      {
        name: "monsterB",
        position: { x: 100, y: 250 }, // Fixed position for MonsterB
        amount: 2,
        type: 'mob',
        hasAllies: ['monsterA'],
        waves: 2,
        rewards: {
          experience: 500,
          items: { Gold: 100},
        },
      },
      // Add more monsters with fixed positions
    ],
    npcs: [
      {
        name: "npc1",
        position: { x: 200, y: 300 }, // Fixed position for NPC1
        type: 'normal',
      },
      {
        name: "npc2",
        position: { x: 200, y: 350 }, // Fixed position for NPC2
        type: 'normal',
      },
      // Add more NPCs with fixed positions
    ],
    shops: [
      {
        name: "Forest Shop 1",
        items: ["Health Potion", "Mana Potion", "Sword"],
        position: { x: 375, y: 125 }, // Fixed position for the shop
      },
      // Add more shops with fixed positions
    ],
    portals: [
      {
        name: "Forest Clearing Exit",
        destination: "town",
        position: { x: 350, y: 450 }, // Fixed position for the portal
      },
      // Add more portals with fixed positions
    ],
    // Add more data for hidden quests, etc.
  },
  "Cave Entance": {
    monsters: [
      {
        type: "MonsterX",
        position: { x: 100, y: 200 }, // Fixed position for MonsterX
      },
      {
        type: "MonsterY",
        position: { x: 100, y: 250 }, // Fixed position for MonsterY
      },
      // Add more monsters with fixed positions
    ],
    npcs: [
      {
        type: "NPC3",
        position: { x: 200, y: 300 }, // Fixed position for NPC3
      },
      {
        type: "NPC4",
        position: { x: 200, y: 350 }, // Fixed position for NPC4
      },
      // Add more NPCs with fixed positions
    ],
    shops: [
      {
        name: "Cave Shop 1",
        items: ["Torch", "Pickaxe", "Gem"],
        position: { x: 300, y: 400 }, // Fixed position for the shop
      },
      // Add more shops with fixed positions
    ],
    portals: [
      {
        name: "Cave Exit",
        destination: "town",
        position: { x: 350, y: 450 }, // Fixed position for the portal
      },
      // Add more portals with fixed positions
    ],
    // Add more data for hidden quests, etc.
  },
  // Add more areas with their respective data here.
};


module.exports = {areas};
