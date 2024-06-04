class BuffDebuffManager {
  constructor(that) {
    this.battleLogs = that.battleLogs;
  }

  async applyDebuff(user, target, debuffType, debuffName, buffDetails) {
    // Check if the target has immunity
    if (target.hasImmunity) {
      this.battleLogs.push(
        `${target.name} is immune to ${debuffType} debuffs.`
      );
      return;
    }

    // Apply the debuff
    const debuff = {
      type: debuffType,
      name: debuffName,
      remainingTurns: buffDetails.turnLimit,
    };
    target.statuses.debuffs.push(debuff);
    this.battleLogs.push(
      `${user} applied ${debuffName} to ${target.name} for ${buffDetails.turnLimit} turns.`
    );
  }

  // Method to remove a debuff
  async removeDebuff(user, target, debuffType, isTrue) {
    target.statuses.debuffs = await target.statuses.debuffs.filter(
      (debuff) => debuff.type !== debuffType
    );
    if (isTrue === true) {
      this.battleLogs.push(
        `${user} removed ${debuffType} debuff from ${target.name}.`
      );
    }
  }

  // Method to apply a buff
  async applyBuff(user, target, buffType, buffName, buffDetails) {
    // Apply the buff
    if (user.hasBuffBlocker) {
      this.battleLogs.push(
        `${user.name} could not receive the ${buffName} buff.`
      );
      return;
    }
    let buff = {};
    if (buffDetails.unique === true) {
      buff = {
        type: buffType,
        name: buffName,
        remainingTurns: buffDetails.turnLimit,
        value_amount: buffDetails.value_amount,
        flat: buffDetails.flat || false,
      };
    } else {
      buff = {
        type: buffType,
        name: buffName,
        remainingTurns: buffDetails.turnLimit,
        value_amount: buffDetails.value_amount,
        flat: buffDetails.flat || false,
      };
    }
    user.statuses.buffs.push(buff);
    console.log(`'user:`, user);
    // this.battleLogs.push(
    //   `${user.name} applied ${buffName} to ${target.name} for ${buffDetails.turnLimit} turns.`
    // );
  }

  // Method to remove a buff
  async removeBuff(user, target, buffType, isTrue) {
    target.statuses.buffs = await target.statuses.buffs.filter(
      (buff) => buff.type !== buffType
    );
    if (isTrue === true) {
      this.battleLogs.push(
        `${user} removed ${buffType} buff from ${target.name}.`
      );
    }
  }
}
module.exports = { BuffDebuffManager };
