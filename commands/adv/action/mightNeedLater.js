/*
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


   async generateAreaElements(areaName) {
    // Fetch area data from area.js based on areaName
    const areaData = areas[areaName];

    // Initialize counts for monsters and NPCs
    let monsterCount = 0;
    let npcCount = 0;
    const maxElements = 10;

    // Loop through the area data and generate elements
    for (let i = this.elements.length; i < maxElements; i++) {
      // const row = Math.floor(Math.random() * (this.imgH - 50)) + 50;
      // const col = Math.floor(Math.random() * (this.imgW - 50)) + 50;

      // Generate monsters
      if (monsterCount < areaData.monsters.length) {
        const monster = areaData.monsters[monsterCount];
        this.elements.push({
          name: monster.name,
          x: monster.position.x,
          y: monster.position.y,
          area: areaName, // Store the area name with the element
          type: monster.type,
          hasAllies: monster.hasAllies,
          waves: monster.waves,
          rewards: monster.rewards,
        });
        this.monsterArray.push({
          name: monster.name,
          x: monster.position.x,
          y: monster.position.y,
          area: areaName,
          amt: monster.amount,
          type: monster.type,
          hasAllies: monster.hasAllies,
          waves: monster.waves,
          rewards: monster.rewards,
        });
        monsterCount++;
      }

      // Generate NPCs
      if (npcCount < areaData.npcs.length) {
        const npc = areaData.npcs[npcCount];
        this.elements.push({
          name: npc.name,
          x: npc.position.x,
          y: npc.position.y,
          area: areaName, // Store the area name with the element
        });
        this.npcArray.push({
          name: npc.name,
          x: npc.position.x,
          y: npc.position.y,
          area: areaName, // Store the area name with the element
        });
        npcCount++;
      }

      // Break if we've generated enough monsters and NPCs
      if (
        monsterCount >= areaData.monsters.length &&
        npcCount >= areaData.npcs.length
      ) {
        break;
      }
    }
  }

  */
