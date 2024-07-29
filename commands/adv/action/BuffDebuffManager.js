class BuffDebuffManager {
  constructor(that) {
    this.battleLogs = that.battleLogs;
  }

  async applyDebuff(user, target, debuffDetails) {
    // Check if the target has immunity
    // if (target.statuses.buffs.some((buff) => buff.type === "immunity")) {
    //   this.battleLogs.push(
    //     `${target.name} is immune to ${debuffDetails.debuffType} debuffs.`
    //   );
    //   return;
    // }

    // Special case: apply_ or remove_
    if (
      debuffDetails.debuffType.startsWith("apply_") ||
      debuffDetails.debuffType.startsWith("remove_")
    ) {
      const specialDebuff = {
        type: debuffDetails.debuffType,
        name: debuffDetails.name,
        remainingTurns: debuffDetails.turnLimit,
        targets: debuffDetails.targets,
        flat: debuffDetails.flat || false,
      };

      if (Array.isArray(target)) {
        for (let trgt of target) {
          if (!trgt.statuses.debuffs) {
            trgt.statuses.debuffs = [];
          }
          debuffDetails.value_amount[debuffDetails.value_name] = {
            ...debuffDetails.value_amount[debuffDetails.value_name], // Existing properties of invincible
            ...specialDebuff, // New properties from specialBuff
          };
          trgt.statuses.debuffs.push(specialDebuff.value_amount);
          this.battleLogs.push(
            `${user.name} applied ${debuffDetails.name} to ${trgt.name} for ${debuffDetails.turnLimit} turns.`
          );
        }
      } else {
        debuffDetails.value_amount[debuffDetails.value_name] = {
          ...debuffDetails.value_amount[debuffDetails.value_name], // Existing properties of invincible
          ...specialDebuff, // New properties from specialBuff
        };

        debuffDetails.targets.statuses.debuffs.push(debuffDetails.value_amount);
      }
    } else {
      // Normal case: debuff application
      const debuffTemplate = {
        type: debuffDetails.debuffType,
        name: debuffDetails.name,
        remainingTurns: debuffDetails.turnLimit,
        value_amount: debuffDetails.value_amount,
        flat: debuffDetails.flat || false,
      };

      if (Array.isArray(debuffDetails.targets)) {
        for (let target of debuffDetails.targets) {
          const debuff = { ...debuffTemplate, targets: target };
          this.battleLogs.push(
            `${user.name} applied ${debuffDetails.name} to ${target.name} for ${debuffDetails.turnLimit} turns.`
          );
          target.statuses.debuffs.push(debuff);
          console.log(`Debuff applied to ${target.name}:`, debuff);
        }
      } else {
        const debuff = { ...debuffTemplate, targets: debuffDetails.targets };
        debuffDetails.targets.statuses.debuffs.push(debuff);
        console.log(`Debuff applied to ${debuffDetails.targets.name}:`, debuff);
        this.battleLogs.push(
          `${user.name} applied ${debuffDetails.name} to ${target.name} for ${debuffDetails.turnLimit} turns.`
        );
      }
    }

    // Log the debuff application
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
    // Check if user has a buff blocker
    if (user.hasBuffBlocker) {
      this.battleLogs.push(
        `${user.name} could not receive the ${buffDetails.name} buff.`
      );
      return;
    }

    // Special case: apply_ or remove_
    if (
      buffDetails.buffType.startsWith("apply_") ||
      buffDetails.buffType.startsWith("remove_")
    ) {
      const specialBuff = {
        type: buffDetails.buffType,
        name: buffDetails.name,
        remainingTurns: buffDetails.turnLimit,
        targets: buffDetails.targets,
        flat: buffDetails.flat || false,
      };
      if (Array.isArray(target)) {
        for (let trgt of target) {
          if (!trgt.statuses.buffs) {
            trgt.statuses.buffs = [];
          }
          buffDetails.value_amount[buffDetails.value_name] = {
            ...buffDetails.value_amount[buffDetails.value_name], // Existing properties of invincible
            ...specialBuff, // New properties from specialBuff
          };
          trgt.statuses.buffs.push(buffDetails.value_amount);
          trgt.statuses.buffs[buffDetails.value_amount].push(specialBuff);
          this.battleLogs.push(
            `${user.name} applied ${buffDetails.name} to ${trgt.name} for ${buffDetails.turnLimit} turns.`
          );
          console.log(trgt.statuses.debuffs.flat());
        }
      } else {
        buffDetails.value_amount[buffDetails.value_name] = {
          ...buffDetails.value_amount[buffDetails.value_name], // Existing properties of invincible
          ...specialBuff, // New properties from specialBuff
        };

        user.statuses.buffs.push(buffDetails.value_amount);
      }
    } else {
      // Normal case: buff application
      const buffTemplate = {
        type: buffDetails.buffType,
        name: buffDetails.name,
        remainingTurns: buffDetails.turnLimit,
        value_amount: buffDetails.value_amount,
        flat: buffDetails.flat || false,
      };

      if (Array.isArray(buffDetails.targets)) {
        for (let target of buffDetails.targets) {
          const buff = { ...buffTemplate, targets: target };
          target.statuses.buffs.push(buff);
          console.log(`Buff applied to ${user.name}:`, buff);
        }
      } else {
        const buff = { ...buffTemplate, targets: buffDetails.targets };
        buffDetails.targets.statuses.buffs.push(buff);
        console.log(`Buff applied to ${user.name}:`, buff);
      }
    }

    // Log the buff application
    this.battleLogs.push(
      `${user.name} applied ${buffDetails.name} to ${
        target.name
      } granting themselves ${buffDetails.buffType.split("_")[1]} for ${
        buffDetails.turnLimit
      } turns.`
    );
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
