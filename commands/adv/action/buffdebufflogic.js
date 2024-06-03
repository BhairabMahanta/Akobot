const buffs = {
  "Attack Boost": {
    name: "Attack Boost",
    description: "Boosts your attack power.",
    effect: "increase_attack", // Indicates the affected attribute
  },
  "Defense Boost": {
    name: "Defense Boost",
    description: "Boosts your defense power.",
    effect: "increase_defense", // Indicates the affected attribute
  },
  "Speed Boost": {
    name: "Speed Boost",
    description: "Boosts your speed.",
    effect: "increase_speed", // Indicates the affected attribute
  },
};
const debuffs = {
  "Attack Break": {
    name: "Attack Break",
    description: "Reduces your attack power.",
    effect: "decrease_attack", // Indicates the affected attribute
  },
  "Defense Break": {
    name: "Defense Break",
    description: "Reduces your defense power.",
    effect: "decrease_defense", // Indicates the affected attribute
  },
  Slow: {
    name: "Slow",
    description: "Reduces your speed.",
    effect: "decrease_speed", // Indicates the affected attribute
  },
  Stun: {
    name: "Stun",
    description: "Stuns you, preventing any action.",
    effect: "stun", // Indicates it's a status effect rather than an attribute change
  },
};
class BuffDebuffLogic {
  constructor(that) {
    this.battleLogs = that.battleLogs;
    // Initialize any necessary properties
  }

  // Method to apply a buff
  async increaseAttack(target) {
    // Apply the Attack Buff to the target
  }

  // Method to remove a buff
  async increaseDefense(target) {
    // Remove the Attack Buff from the target
  }

  // Method to apply a debuff
  async breakAttack(target) {
    // Apply the Attack Break debuff to the target
  }

  // Method to remove a debuff
  async increaseSpeed(target) {
    // Remove the Attack Break debuff from the target
  }
}
