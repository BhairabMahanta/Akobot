const { mobs } = require("../monsterInfo/mobs.js");
const abilities = require("../../../data/abilities.js");
const { calculateDamage } = require("../../util/glogic.js");
const {
  Ability,
  // eslint-disable-next-line no-undef
} = require("./AbilitiesFunction.js");
class MobAI {
  constructor(that, mob) {
    this.name = mob.name;
    this.enemyDetails = mob;
    this.i = 0;
    console.log("mobaBility: ", mobs[mob.name].abilities);
    this.abilities = mobs[mob.name].abilities;
    this.attackPattern = mobs[mob.name].attackPattern;
    this.battleLogs = that.battleLogs;
    this.ability = new Ability(this);
    if (!this.enemyDetails.hasAllies.includes("none")) {
      this.allies = mob.allies;
    }
  }

  async move(mob, target) {
    if (mob.index >= this.attackPattern.length) {
      mob.index = 0;
    }
    for (; mob.index < this.attackPattern.length; mob.index++) {
      console.log("i: ", mob.index);
      const move = this.attackPattern[mob.index];
      console.log("move: ", move);
      if (move === "Basic Attack") {
        console.log("moveTrue?: ", move);
        mob.index++;
        return await this.normalAttack(mob, target);
      } else {
        console.log("moveFalse?: ", move);
        mob.index++;
        return await this.abilityUse(mob, target, move);
      }
    }
  }

  async normalAttack(mob, target) {
    var damage = await calculateDamage(mob.stats.attack, target.stats.defense);
    console.log("damage: ", damage);
    if (damage < 0) {
      damage = 0;
      this.battleLogs.push(
        `${target.name}'s defense was too strong ${mob.name}'s attack nullified!`
      );
    }
    return damage;
  }
  async toCamelCase(str) {
    const words = str.split(" ");
    if (words.length === 1) {
      return words[0].toLowerCase();
    }
    if (words.length === 2) {
      return words[0].toLowerCase() + words[1];
    }
    return str
      .replace(/\s(.)/g, function (match, group1) {
        console.log("group1:", group1);
        console.log("match:", match);
        return group1.toUpperCase();
      })
      .replace(/\s/g, ""); // Remove any remaining spaces
  }

  async abilityUse(mob, target, nextMove) {
    const abilityName = nextMove;
    const abilityNameCamel = await this.toCamelCase(abilityName);
    console.log("abilityName:a", abilityNameCamel);
    if (typeof this.ability[abilityNameCamel] === "function") {
      this.ability[abilityNameCamel](mob, target);
    } else {
      console.log(`Ability ${abilityName} not found.`);
    }

    console.log(`${this.name} uses ${abilityName} on ${target}!`);
    // mob's logic for using the specified ability on the target
  }
}

module.exports = MobAI;
