/*const { Schema } = require("mongoose");

const { heroExpToNextLevel, heroStatIncreaseOnLevel } = require("./game/_CONSTS/heroexp");
const { army, statistics, cooldowns, resources, inventory } = require("./userValues");

const User = {
  account: {
    username: String,
    userId: String,
    bans: {
      type: Number,
      default: 0,
    },
    banTime: Number,
    testUser: {
      type: Boolean,
      default: false,
    },
    servers: Array,
    patreon: {
      type: String,
      enum: ["", "Bronze", "Silver", "Gold", "Platinum"],
      default: "",
    },
  },
  maxPop: {
    type: Number,
    default: 10,
  },
  maxBuildings: {
    type: Number,
    default: 9,
  },
  cooldowns,
  resources,
  army,
  world: {
    currentLocation: {
      type: String,
      default: "Grassy Plains",
    },
    locations: {
      "Grassy Plains": {
        available: {
          type: Boolean,
          default: true,
        },
        explored: [String],
      },
      "Misty Mountains": {
        available: {
          type: Boolean,
          default: false,
        },
        explored: [String],
      },
      "Deep Caves": {
        available: {
          type: Boolean,
          default: false,
        },
        explored: [String],
      },
    },
  },
  empire: {
    type: Array,
    default: [],
  },
  hero: {
    elo: {
      type: Number,
      default: 1200,
    },
    health: {
      type: Number,
      default: 100,
    },
    currentHealth: {
      type: Number,
      default: 100,
    },
    attack: {
      type: Number,
      default: 5,
    },
    defense: {
      type: Number,
      default: 3,
    },
    inventory,
    dungeonKeys: {
      "CM Key": {
        type: Number,
        default: 0,
      },
      "Eridian Vase": {
        type: Number,
        default: 0,
      },
      "The One Shell": {
        type: Number,
        default: 0,
      },
    },
    currentExp: {
      type: Number,
      default: 1,
    },
    expToNextRank: {
      type: Number,
      default: 100,
    },
    rank: {
      type: Number,
      default: 0,
    },
    armor: {
      helmet: {
        type: String,
        default: "[NONE]",
      },
      chest: {
        type: String,
        default: "[NONE]",
      },
      legging: {
        type: String,
        default: "[NONE]",
      },
      weapon: {
        type: String,
        default: "[NONE]",
      },
    },
  },
  consecutivePrizes: {
    dailyPrize: {
      type: Number,
      default: 0,
    },
    weeklyPrize: {
      type: Number,
      default: 0,
    },
  },
  quests: {
    type: [
      {
        type: Object,
      },
    ],
    default: [
      {
        started: false,
        questKeySequence: ["gettingStarted", "buildMine"],
        name: "Build a Mine",
      },
    ],
  },
  completedQuests: [String],
  tower: {
    "solo full-army": {
      level: {
        type: Number,
        default: 1,
      },
    },
    "trio full-army": {
      level: {
        type: Number,
        default: 1,
      },
      users: {
        type: Array,
        default: [],
      },
    },
    "solo hero": {
      level: {
        type: Number,
        default: 1,
      },
    },
    "trio hero": {
      level: {
        type: Number,
        default: 1,
      },
      users: {
        type: Array,
        default: [],
      },
    },
  },
  statistics,
};

User.markModified = function (path) {
  // Implement your custom markModified logic here
};

User.save = function () {
  // Implement your custom save logic here
};

User.methods = {
  removeItem(item, hero, amount = 1) {
    const itemType = item.typeSequence[item.typeSequence.length - 1];

    if (hero) {
      this.hero.armor[itemType] = "[NONE]";

      this.markModified("hero.armor");
    } else {
      this.army.armory[itemType][item.name] -= amount;
      this.markModified(`army.armory.${itemType}.${item.name}`);
    }
  },
  equipItem(item, currentItem) {
    const heroEquipmentBonus = 2;
    const itemType = item.typeSequence[item.typeSequence.length - 1];

    this.army.armory[itemType][item.name] -= 1;
    this.hero.armor[itemType] = item.name;

    if (currentItem) {
      if (!this.army.armory[itemType][currentItem.name]) {
        this.army.armory[itemType][currentItem.name] = 0;
      }
      this.army.armory[itemType][currentItem.name] += 1;

      for (const stat in currentItem.stats) {
        this.hero[stat] -= currentItem.stats[stat] * heroEquipmentBonus;
      }
    }

    for (const stat in item.stats) {
      this.hero[stat] += item.stats[stat] * heroEquipmentBonus;
    }

    this.markModified(`army.armory.${itemType}`);
    this.markModified(`hero.armor.${itemType}`);

    return this.save();
  },
  unitLoss(lossPercentage, towerFight) {
    Object.values(this.army.units).forEach((unitBuilding) => {
      Object.keys(unitBuilding).forEach((unit) => {
        if (typeof unitBuilding[unit] === "number") {
          unitBuilding[unit] = Math.floor(unitBuilding[unit] * lossPercentage);
          this.markModified(`army.units.${unitBuilding}.${unit}`);
        }
      });
    });

    this.hero.currentHealth = Math.floor(this.hero.currentHealth * lossPercentage);

    if (this.hero.currentHealth <= 0 && this.hero.rank > 0 && !towerFight) {
      Object.keys(heroStatIncreaseOnLevel[this.hero.rank]).forEach((s) => {
        this.hero[s] -= heroStatIncreaseOnLevel[this.hero.rank][s];
      });
      this.hero.rank -= 1;
      this.hero.expToNextRank = heroExpToNextLevel[this.hero.rank];
      this.hero.currentExp =
        heroExpToNextLevel[this.hero.rank - 1] ||
        getNewCurrentExpAfterDeath(
          heroExpToNextLevel[this.hero.rank - 1],
          heroExpToNextLevel[this.hero.rank]
        );
    }
  },
  heroHpLoss(lossPercentage)
  {
    this.hero.currentHealth = Math.floor(this.hero.currentHealth * lossPercentage);
    
    if (this.hero.currentHealth <= 0 && this.hero.rank > 0) {
      Object.keys(heroStatIncreaseOnLevel[this.hero.rank]).forEach((s) => {
        this.hero[s] -= heroStatIncreaseOnLevel[this.hero.rank][s];
      });
      this.hero.rank -= 1;
      this.hero.expToNextRank = heroExpToNextLevel[this.hero.rank];
      this.hero.currentExp =
        heroExpToNextLevel[this.hero.rank - 1] ||
        getNewCurrentExpAfterDeath(
          heroExpToNextLevel[this.hero.rank - 1],
          heroExpToNextLevel[this.hero.rank]
        );
    }
  },
};

module.exports = User;
*/