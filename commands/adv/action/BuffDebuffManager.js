class BuffDebuffManager {
  constructor(that) {
    this.battleLogs = that.battleLogs;
  }

  async applyDebuff(target, user, debuffType, debuffName, turnLimit) {
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
      remainingTurns: turnLimit,
    };
    target.statuses.debuffs.push(debuff);
    this.battleLogs.push(
      `${user} applied ${debuffName} to ${target.name} for ${turnLimit} turns.`
    );
  }

  // Method to remove a debuff
  async removeDebuff(target, debuffType, user, isTrue) {
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
  async applyBuff(target, user, buffType, buffName, turnLimit) {
    // Apply the buff
    if (target.hasBuffBlocker) {
      this.battleLogs.push(
        `${target.name} could not receive the ${buffName} buff.`
      );
      return;
    }
    const buff = {
      type: buffType,
      name: buffName,
      remainingTurns: turnLimit,
    };
    target.statuses.buffs.push(buff);
    this.battleLogs.push(
      `${user} applied ${buffName} to ${target.name} for ${turnLimit} turns.`
    );
  }

  // Method to remove a buff
  async removeBuff(target, buffType, user, isTrue) {
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
