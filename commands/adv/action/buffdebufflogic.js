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
  async overLogic(turnEnder, buff, i, what) {
    // remove the buff's effect if right before it's pushed out may be naturally or cleansed
    const types = buff.type.split("_and_");
    types.forEach((type) => {
      if (type.startsWith("increase_") || type.startsWith("decrease_")) {
        type.split("_")[1];
      }
      console.log("type:", type);
      if (buff.flat) {
        turnEnder.stats[type] -= buff.value_amount[type];
      } else {
        turnEnder.stats[type] -= turnEnder.stats[type] * (buff.value / 100);
      }
    });
    console.log("what:", what);
    if (what === true) {
      console.log("what:", what);
      turnEnder.statuses.debuffs.splice(i, 1); // Remove the expired debuff from the array
    } else {
      turnEnder.statuses.buffs.splice(i, 1); // Remove the expired buff from the array
    }
  }
  async increaseAttack(target, amount, flat) {
    if (flat) {
      target.stats.attack += amount;
    } else {
      target.stats.attack += target.stats.attack * (amount / 100);
    }
  }

  async decreaseAttack(target, amount, flat) {
    if (flat) {
      target.stats.attack -= amount;
    } else {
      target.stats.attack -= target.stats.attack * (amount / 100);
    }
  }

  async increaseSpeed(target, amount, flat) {
    if (flat) {
      target.stats.speed += amount;
    } else {
      target.stats.speed += target.stats.speed * (amount / 100);
    }
  }

  async decreaseSpeed(target, amount, flat) {
    if (flat) {
      target.stats.speed -= amount;
    } else {
      target.stats.speed -= target.stats.speed * (amount / 100);
    }
  }

  async increaseDefense(target, amount, flat) {
    if (flat) {
      target.stats.defense += amount;
    } else {
      target.stats.defense += target.stats.defense * (amount / 100);
    }
  }

  async decreaseDefense(target, amount, flat) {
    if (flat) {
      target.stats.defense -= amount;
    } else {
      target.stats.defense -= target.stats.defense * (amount / 100);
    }
  }
  async increaseHp(target, amount, flat) {
    if (flat) {
      target.stats.hp += amount;
    } else {
      target.stats.hp += target.stats.hp * (amount / 100);
    }
  }

  async decreaseHp(target, amount, flat) {
    if (flat) {
      target.stats.hp -= amount;
    } else {
      target.stats.hp -= target.stats.hp * (amount / 100);
    }
  }

  async increaseAtkBar(target, amount, flat) {
    if (flat) {
      target.atkBar += amount;
    } else {
      target.atkBar += target.atkBar * (amount / 100);
    }
  }

  async decreaseAtkBar(target, amount, flat) {
    if (flat) {
      target.atkBar -= amount;
    } else {
      target.atkBar -= target.atkBar * (amount / 100);
    }
  }
  async aoeDamage(user, target, specialContext) {
    let damageArray = [];
    let enemyNameArray = [];

    await Promise.all(
      specialContext.map(async (targeta) => {
        console.log("target:", targeta.stats.defense);
        console.log("length", specialContext.length);
        const damage = await critOrNot(
          user.stats.critRate,
          user.stats.critDamage,
          user.stats.attack,
          targeta.stats.defense
        );
        targeta.stats.hp -= damage * (1.2 / specialContext.length);
        damageArray.push(damage * (1.2 / specialContext.length));
        enemyNameArray.push(targeta.name);
      })
    );

    return { damageArray, enemyNameArray };
  }

  //invincible invisible stun freeze, immunity, DOT, unskillable, taunt, provoke, sleep, oblivion, silence, block beneficial effects, block harmful effects, block healing, block revive, reflect damage, counter, endure,

  async increaseCritRate(target, amount, flat) {
    if (flat) {
      target.stats.critRate += amount;
    } else {
      target.stats.critRate += target.stats.critRate * (amount / 100);
    }
  }

  async increaseCritDamage(target, amount, flat) {
    if (flat) {
      target.stats.critDamage += amount;
    } else {
      target.stats.critDamage += target.stats.critDamage * (amount / 100);
    }
  }
  async applyWhat(target, debuffDetails) {
    const debuffs = debuffDetails.debuffType.split("_and_");
    let derArray = [];
    let statChanges = [];
    for (const unit of Array.isArray(target) ? target : [target]) {
      for (const debuffType of debuffs) {
        const flat = debuffDetails.flat || false;

        switch (debuffType) {
          case "apply_immunity":
            await this.immunity(unit, debuffDetails.turnLimit);
            break;
          case "apply_stun":
            await this.stun(unit, debuffDetails.turnLimit);
            break;
          case "apply_invincibility":
            await this.invincibility(unit, debuffDetails.turnLimit);
            break;
          case "apply_freeze":
            await this.freeze(unit, debuffDetails.turnLimit);
            break;
          case "apply_invisibility":
            await this.invisibility(unit, debuffDetails.turnLimit);
            break;
          case "apply_block_buffs":
            await this.blockBuffs(unit, debuffDetails.turnLimit);
            break;
          case "apply_cleanse":
            await this.cleanse(unit);
            break;
          default:
            throw new Error(`Unknown debuff type: ${debuffType}`);
        }
      }
      derArray.push(unit.name);
    }
    const logMessage = `${derArray.join(", ")} received ${
      debuffDetails.name
    } debuff, decreasing ${statChanges.join(" and ")}.`;
    this.battleLogs.push(logMessage);
  }
  async increaseWhat(target, buffDetails) {
    const buffs = buffDetails.buffType.split("_and_");
    let derArray = [];
    let statChanges = [];
    for (const unit of Array.isArray(target) ? target : [target]) {
      for (const buffType of buffs) {
        // const amount = buffDetails.value_amount[buffType.split("increase_")[1]];
        const flat = buffDetails.flat || false;

        switch (buffType) {
          case "increase_attack":
            await this.increaseAttack(
              unit,
              buffDetails.value_amount.attack,
              flat
            );
            statChanges.push(
              `attack by ${buffDetails.value_amount.attack}${flat ? "" : "%"}`
            );
            break;
          case "increase_speed":
            await this.increaseSpeed(
              unit,
              buffDetails.value_amount.speed,
              flat
            );
            statChanges.push(
              `speed by ${buffDetails.value_amount.speed}${flat ? "" : "%"}`
            );
            break;
          case "increase_defense":
            await this.increaseDefense(
              unit,
              buffDetails.value_amount.defense,
              flat
            );
            statChanges.push(
              `defense by ${buffDetails.value_amount.defense}${flat ? "" : "%"}`
            );
            break;
          case "decrease_attack":
            await this.increaseAttack(
              unit,
              buffDetails.value_amount.attack,
              flat
            );
            break;
          case "decrease_speed":
            await this.increaseSpeed(
              unit,
              buffDetails.value_amount.speed,
              flat
            );
            break;
          case "decrease_defense":
            await this.increaseDefense(
              unit,
              buffDetails.value_amount.defense,
              flat
            );
            break;
          default:
            throw new Error(`Unknown buff type: ${buffType}`);
        }
      }
      derArray.push(unit.name);
    }
    const logMessage = `${derArray.join(", ")} received ${
      buffDetails.name
    } buff, increasing ${statChanges.join(" and ")}.`;
    this.battleLogs.push(logMessage);
  }
  async decreaseWhat(target, debuffDetails) {
    const debuffs = debuffDetails.debuffType.split("_and_");
    let derArray = [];
    let statChanges = [];
    for (const unit of Array.isArray(target) ? target : [target]) {
      for (const debuffType of debuffs) {
        const flat = debuffDetails.flat || false;

        switch (debuffType) {
          case "decrease_attack":
            await this.decreaseAttack(
              unit,
              debuffDetails.value_amount.attack,
              flat
            );
            statChanges.push(
              `attack by ${debuffDetails.value_amount.attack}${flat ? "" : "%"}`
            );
            break;
          case "decrease_speed":
            await this.decreaseSpeed(
              unit,
              debuffDetails.value_amount.speed,
              flat
            );
            statChanges.push(
              `speed by ${debuffDetails.value_amount.speed}${flat ? "" : "%"}`
            );
            break;
          case "decrease_defense":
            await this.decreaseDefense(
              unit,
              debuffDetails.value_amount.defense,
              flat
            );
            statChanges.push(
              `defense by ${debuffDetails.value_amount.defense}${
                flat ? "" : "%"
              }`
            );
            break;
          default:
            throw new Error(`Unknown debuff type: ${debuffType}`);
        }
      }
      derArray.push(unit.name);
    }
    const logMessage = `${derArray.join(", ")} received ${
      debuffDetails.name
    } debuff, decreasing ${statChanges.join(" and ")}.`;
    this.battleLogs.push(logMessage);
  }

  async increaseAttackNSpeed(target, buffDetails) {
    // if (target.statuses.buffs.some(buff => buff.name === buffDetails.name)) {
    //   this.battleLogs.push(`${target.name} already has the ${buffDetails.name} buff.`);
    //   return;
    // }
    if (buffDetails.unique === true && buffDetails.targets > 1) {
      let derArray = [];
      let buff;
      for (const unit of target) {
        buff = {
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
        derArray.push(unit.name);
      }
      this.battleLogs.push(
        ` ${derArray.join(", ")} received ${
          buffDetails.name
        } buff, increasing attack by ${buff.attack_amount}${
          buff.flat ? "" : "%"
        } and speed by ${buff.speed_amount}${buff.flat ? "" : "%"}.`
      );
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
        } buff, increasing attack by ${buff.attack_amount}${
          buff.flat ? "" : "%"
        } and speed by ${buff.speed_amount}${buff.flat ? "" : "%"}.`
      );
    }
  }
}
module.exports = { BuffDebuffLogic };
