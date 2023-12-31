const {mobs} = require('./mobs.js');
const abilities = require('../../data/abilities.js');
const { calculateDamage } = require('../util/glogic.js');
class MobAI {
    constructor(that, mob) {
        this.name = mob.name;
        this.enemyDetails = mob;
        console.log('mobaBility: ', mobs[mob.name].abilities);
        this.abilities = mobs[mob.name].abilities;
        this.attackPattern = mobs[mob.name].attackPattern;
        if (!this.enemyDetails.hasAllies.includes('none')) {
            this.allies = mob.allies;
        }
    }

    async move(mob, target) {
        for (let i = 0; i < this.attackPattern.length; i++) {
            const move = this.attackPattern[i];
            if (move === 'normalAttack') {
                await this.normalAttack(mob, target);
            } else {
                await this.ability(mob, target, move);
            }
        }
    }

    async normalAttack(mob, target) {
        const damage = await calculateDamage(mob.stats.attack, target.stats.defense);
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
