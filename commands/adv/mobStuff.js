const {mobs} = require('./mobs.js');
const abilities = require('./abilities.js');
const { calculateDamage } = require('../util/glogic.js');
class MobAI {
    constructor(that, mob) {
        this.name = mob.name;
        this.abilities = mobs[mob.name].abilities;
        this.attackPattern = mobs[mob.name].attackPattern;
        if (!this.enemyDetails.hasAllies.includes('none')) {
            this.allies = mob.allies;
        }
    }

    async normalAttack(mob, target) {
        const damage = calculateDamage(mob.stats.attack, target.stats.defense);
        // mob's logic for normal attack
        return damage;
    }

    async ability(mob, target, nextMove) {
        const abilityName = this.attackPattern[nextMove];
        const ability = this.abilities[abilityName];

        console.log(`${this.name} uses ${abilityName} on ${target}!`);
        // mob's logic for using the specified ability on the target
    }
}

module.exports = MobAI;
