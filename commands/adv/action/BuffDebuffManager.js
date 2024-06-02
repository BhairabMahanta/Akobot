class BuffDebuffManager {
  constructor(battleLogs) {
    this.battleLogs = battleLogs;
  }

  async applyDebuff(target, user, debuffType, debuffName, turnLimit) {
    // Check if the target has immunity
    if (target.hasImmunity) {
      this.battleLogs.push(`${target.name} is immune to debuffs.`);
      return;
    }

    // Apply the debuff
    const debuff = {
      type: debuffType,
      name: debuffName,
      remainingTurns: turnLimit,
    };
    target.debuffs.push(debuff);
    this.battleLogs.push(
      `${user} applied ${debuffName} to ${target.name} for ${turnLimit} turns.`
    );
  }

  async removeDebuff(target, debuffType, user, isTrue) {
    target.debuffs = await target.debuffs.filter(
      (debuff) => debuff.type !== debuffType
    );
    if (isTrue === true) {
      this.battleLogs.push(
        `${user} removed ${debuffType}  removed from ${target.name}.`
      );
    }
  }
  async applyBuff(target, user, buffType, buffName, turnLimit) {
    // Apply the buff
    if (target.hasBuffBlocker) {
      this.battleLogs.push(
        `${target.name} could not get the ${buffName} buffs.`
      );
      return;
    }
    const buff = {
      type: buffType,
      name: buffName,
      remainingTurns: turnLimit,
    };
    target.buffs.push(buff);
    this.battleLogs.push(
      `${user} applied ${buffName} to ${target.name} for ${turnLimit} turns.`
    );
  }

  // Method to remove a buff
  async removeBuff(target, buffType, user, isTrue) {
    target.buffs = await target.buffs.filter((buff) => buff.type !== buffType);
    if (isTrue === true) {
      this.battleLogs.push(
        `${user} removed ${buffType} buff from ${target.name}.`
      );
    }
  }
}
module.exports = { BuffDebuffManager };
