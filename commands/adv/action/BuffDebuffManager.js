class BuffDebuffManager {
  constructor(that) {
    this.battleLogs = that.battleLogs;
  }

  async applyDebuff(user, target, buffDetails) {
    // Check if the target has immunity
    if (target.hasImmunity) {
      this.battleLogs.push(
        `${target.name} is immune to ${buffDetails.debuffType} debuffs.`
      );
      return;
    }

    // Apply the debuff
    const debuff = {
      type: buffDetails.debuffType,
      name: buffDetails.debuffName,
      remainingTurns: buffDetails.turnLimit,
    };
    target.statuses.debuffs.push(debuff);
    this.battleLogs.push(
      `${user} applied ${buffDetails.debuffName} to ${target.name} for ${buffDetails.turnLimit} turns.`
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
  async applyBuff(user, target, buffDetails) {
    // Apply the buff
    if (user.hasBuffBlocker) {
      this.battleLogs.push(
        `${user.name} could not receive the ${buffDetails.buffName} buff.`
      );
      return;
    }
    let buff = {};
    if (buffDetails.unique === true) {
      buff = {
        type: buffDetails.buffType,
        name: buffDetails.buffName,
        remainingTurns: buffDetails.turnLimit,
        value_amount: buffDetails.value_amount,
        flat: buffDetails.flat || false,
      };
    } else {
      buff = {
        type: buffDetails.buffType,
        name: buffDetails.buffName,
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
