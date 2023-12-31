const bosses = require('./bosses.js');
const abilities = require('../../data/abilities.js');
const { calculateDamage } = require('../util/glogic.js');
class BossAI {
    constructor(that, boss) {
        this.name = boss.name;
        this.abilities = bosses[boss.name].abilities;
        this.attackPattern = bosses[boss.name].attackPattern;
    }

    async normalAttack(boss, target) {
        const damage = calculateDamage(boss.stats.attack, target.stats.defense);
        // Boss's logic for normal attack
        return damage;
    }

    async ability(boss, target, nextMove) {
        const abilityName = this.attackPattern[nextMove];
        const ability = this.abilities[abilityName];

        console.log(`${this.name} uses ${abilityName} on ${target}!`);
        // Boss's logic for using the specified ability on the target
    }
}

module.exports = BossAI;
