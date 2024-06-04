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
  async overLogic(turnEnder, buff) {
    // remove the buff's effect if right before it's pushed out may be naturally or cleansed
    if (buff.flat) {
      turnEnder.stats.attack += buff.attack_amount;
      turnEnder.stats.speed += buff.speed_amount;
    } else {
      turnEnder.stats.attack +=
        turnEnder.stats.attack * (buff.attack_amount / 100);
      turnEnder.stats.speed +=
        turnEnder.stats.speed * (buff.speed_amount / 100);
    }
  }
  async increaseAttackNSpeed(target, buffDetails) {
    // if (target.statuses.buffs.some(buff => buff.name === buffDetails.name)) {
    //   this.battleLogs.push(`${target.name} already has the ${buffDetails.name} buff.`);
    //   return;
    // }
    if (buffDetails.unique === true && buffDetails.targets > 1) {
      for (const unit of target) {
        const buff = {
          type: "increase_attack_and_speed",
          name: buffDetails.name,
          remainingTurns: buffDetails.turnLimit,
          attack_amount: buffDetails.value_amount.attack,
          speed_amount: buffDetails.value_amount.speed,
          flat: buffDetails.flat || false,
        };

        if (buff.flat) {
          unit.stats.attack += buff.attack_amount;
          unit.stats.speed += buff.speed_amount;
        } else {
          unit.stats.attack += unit.stats.attack * (buff.attack_amount / 100);
          unit.stats.speed += unit.stats.speed * (buff.speed_amount / 100);
        }

        this.battleLogs.push(
          `${unit.name} received ${
            buffDetails.name
          } buff, increasing attack by ${buff.value}${buff.flat ? "" : "%"}.`
        );
      }
    } else {
      const buff = {
        type: "increase_attack_and_speed",
        name: buffDetails.name,
        remainingTurns: buffDetails.turnLimit,
        attack_amount: buffDetails.value_amount.attack,
        speed_amount: buffDetails.value_amount.speed,
        flat: buffDetails.flat || false,
      };

      if (buff.flat) {
        target.stats.attack += buff.attack_amount;
        target.stats.speed += buff.speed_amount;
      } else {
        target.stats.attack += target.stats.attack * (buff.attack_amount / 100);
        target.stats.speed += target.stats.speed * (buff.speed_amount / 100);
      }

      this.battleLogs.push(
        `${target.name} received ${
          buffDetails.name
        } buff, increasing attack by ${buff.value}${buff.flat ? "" : "%"}.`
      );
    }
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
module.exports = { BuffDebuffLogic };
