/*
'use strict';

const bossElementals = require('../../../../scripts/bossElemental');
const natureElementals = require('../../../../scripts/natureElemental');
const crypto = require('node:crypto');

const defaultChances = [
  [1, 25],
  [26, 46],
  [47, 61],
  [62, 87],
  [88, 100],
];

const specialChances = {
  'atk-normal': [
    [1, 20],
    [21, 51],
    [52, 66],
    [67, 87],
    [88, 100],
  ],
  'def-normal': [
    [1, 30],
    [31, 50],
    [51, 71],
    [72, 78],
    [79, 100],
  ],
  'deb-normal': [
    [1, 25],
    [31, 45],
    [46, 69],
    [70, 76],
    [77, 100],
  ],
  'atk-hp': [
    [1, 25],
    [26, 46],
    [47, 61],
    [62, 87],
    [88, 100],
  ],
  'def-hp': [
    [1, 25],
    [26, 46],
    [47, 61],
    [62, 87],
    [88, 100],
  ],
  'deb-hp': [
    [1, 25],
    [26, 46],
    [47, 61],
    [62, 87],
    [88, 100],
  ],
  'atk-atk': [
    [1, 15],
    [16, 46],
    [47, 61],
    [62, 75],
    [76, 100],
  ],
  'def-atk': [
    [1, 25],
    [26, 46],
    [47, 61],
    [62, 87],
    [88, 100],
  ],
  'deb-atk': [
    [1, 25],
    [26, 46],
    [47, 61],
    [62, 87],
    [88, 100],
  ],
};

class Monster {
  constructor(monster) {
    this.baseStats = monster.baseStats;
    this._id = monster._id;
    this.fixedStats = monster.fixedStats;
    this.dynamicStats = monster.dynamicStats;
    this.type = monster.type;
    this.condition = null;
    this.difficulty = 0;
    this.url = monster.url;
    this.element = monster.element;
    this.natureElement = monster.natureElement;
    this.name = monster.name;
    this.battleLogs = [];
    this.player = null;
    this.damage = 0;
    this.temporal = { occured: false, missed: false };
    this.lastDamage = 120;
    this.specialMove = null;
    this.defeatRate = monster.defeatRate;
    this.message = null;
    this.lastAttacked = -1;
  }

  setPlayer(player) {
    this.player = player;
  }

  setBattleLogs(raidBattleLogs) {
    this.battleLogs = raidBattleLogs;
  }

  setDifficulty(difficulty, deckMoves) {
    this.difficulty = difficulty;
    this.setStats(deckMoves);
  }

  setFixedStats(stats) {
    this.fixedStats = stats;
  }

  setDynamicStats(stats) {
    this.dynamicStats = stats;
  }

  setStats(deckMoves) {
    const moveIds = deckMoves.map(l => l.id);
    const defensiveMoves = [2, 8, 12, 27, 16];
    const attackingMoves = [19, 21, 22, 1, 2, 4, 7, 10, 14, 9, 6, 23];
    const debuffMoves = [3, 13, 24];
    const deckDefensiveMovesCount = moveIds.filter(move => defensiveMoves.includes(move)).length;
    const deckAttackingMovesCount = moveIds.filter(move => attackingMoves.includes(move)).length;
    const deckDebuffMovesCount = moveIds.filter(move => debuffMoves.includes(move)).length;
    const floor = v => Math.floor(v);
    if (this.type === 0) {
      if (deckAttackingMovesCount > 3) {
        this.condition = 'atk-normal';
      }
      if (deckDefensiveMovesCount >= 3) {
        this.condition = 'def-normal';
      }
      if (deckDebuffMovesCount === 2) {
        this.condition = 'deb-normal';
      }
    }
    if (this.type === 4) {
      if (deckAttackingMovesCount > 3) {
        this.condition = 'atk-hp';
      }
      if (deckDefensiveMovesCount >= 3) {
        this.condition = 'def-hp';
      }
      if (deckDebuffMovesCount === 2) {
        this.condition = 'deb-hp';
      }
    }
    if (this.type === 1) {
      if (deckAttackingMovesCount > 3) {
        this.condition = 'atk-atk';
      }
      if (deckDefensiveMovesCount >= 3) {
        this.condition = 'def-atk';
      }
      if (deckDebuffMovesCount === 2) {
        this.condition = 'deb-atk';
      }
    }

    if (this.difficulty === 0) {
      const stats = {
        attack: floor(this.baseStats.attack * 0.55),
        defense: floor(this.baseStats.defense * 0.55),
        speed: floor(this.baseStats.speed * 0.55),
        hp: floor(this.baseStats.hp * 0.55),
        condition: this.condition,
      };
      const stats2 = { ...stats };

      this.setFixedStats(stats);
      this.setDynamicStats(stats2);
    }
    if (this.difficulty === 1) {
      const stats = {
        attack: floor(this.baseStats.attack * 0.75),
        defense: floor(this.baseStats.defense * 0.75),
        speed: floor(this.baseStats.speed * 0.75),
        hp: floor(this.baseStats.hp * 0.75),
        condition: this.condition,
      };
      const stats2 = { ...stats };

      this.setFixedStats(stats);
      this.setDynamicStats(stats2);
    }
    if (this.difficulty === 2) {
      const stats = {
        attack: floor(this.baseStats.attack * 1.1),
        defense: floor(this.baseStats.defense * 1.1),
        speed: floor(this.baseStats.speed * 1.1),
        hp: floor(this.baseStats.hp * 1.1),
        condition: this.condition,
      };
      const stats2 = { ...stats };

      this.setFixedStats(stats);
      this.setDynamicStats(stats2);
    }
  }

  capped(damage) {
    return damage < 50 ? 50 : Math.floor(damage * 0.92);
  }

  evalDamage(opponentCard) {
    const special = 30;
    const factors = [
      [120, 1.65, 2.5, 0.15],
      [140, 1.8, 2.5, 0.21],
      [160, 2, 2, 0.28],
    ];
    const elementalFactor =
      bossElementals[this.element][opponentCard?.element || 'wind'] *
      natureElementals[this.element || 'wind'][this.natureElement];

    const damage =
      factors[this.difficulty][0] +
      (this.dynamicStats.attack * elementalFactor) / factors[this.difficulty][1] -
      (opponentCard?.defense || 50) / factors[this.difficulty][2] -
      special * factors[this.difficulty][3];
    return this.capped(damage);
  }

  setSpecialMove() {
    const roll = crypto.randomInt(1, 100);
    const isSpecialMove = roll >= 1 && roll <= 45 && this.player.movesCollection.round % 2 === 0;
    let chances = defaultChances;
    if (this.condition) chances = specialChances[this.condition];
    const chance = crypto.randomInt(1, 100);
    if (isSpecialMove) {
      if (chance >= chances[0][0] && chance <= chances[0][1] && !this.specialMove) {
        this.battleLogs.push(`= ${this.name} is preparing for a special move`);
        this.specialMove = 1;
      }

      // Monstrosity
      if (chance >= chances[1][0] && chance <= chances[1][1] && !this.specialMove) {
        this.battleLogs.push(`💥 ${this.name} is preparing for a special move`);
        this.specialMove = 2;
      }

      // Critical
      if (chance >= chances[2][0] && chance <= chances[2][1] && !this.specialMove) {
        this.battleLogs.push(`💥 ${this.name} is preparing for a special move`);
        this.specialMove = 3;
      }

      // Life Drain
      if (chance >= chances[4][0] && chance <= chances[4][1] && !this.specialMove) {
        this.battleLogs.push(`💥 ${this.name} is preparing for a special move`);
        this.specialMove = 4;
      }

      // Radiance
      if (chance >= chances[3][0] && chance <= chances[3][1] && !this.specialMove) {
        this.battleLogs.push(`💥 ${this.name} is preparing for a special move`);
        this.specialMove = 5;
      }
    }
  }

  attack(opponentCards, afk, firstMove = false) {
    // Previous Special Move
    const isAlive = this.dynamicStats.hp > 0;
    const trueDamage = this.specialMove === 1 && isAlive;
    const monstrosity = this.specialMove === 2 && isAlive;
    const criticalDamage = this.specialMove === 3 && isAlive;
    const lifeDrain = this.specialMove === 4 && isAlive;
    const radiance = this.specialMove === 5 && isAlive;
    const setTrueDamage = () => {
      if (trueDamage) {
        this.damage = 100;
        return true;
      }
      return false;
    };
    const getRandomIndex = max => {
      const randomBytes = crypto.randomBytes(4);
      const randomIndex = randomBytes.readUInt32LE(0) % max;
      return randomIndex;
    };

    if (monstrosity) {
      if ([26, 28, 22].includes(this.player?.selectedMove?.id || 1)) {
        if (this.player.selectedMove.id === 22) {
          this.dynamicStats.hp += this.player.movesCollection.damage - 50;
          this.player.movesCollection.totalDamage -= this.player.movesCollection.damage - 50;
          this.battleLogs.push(`💥 Monstrosity: ${this.name} took 50 True DMG`);
        } else {
          this.battleLogs.push(`💥 ${this.name} was unable to use Monstrosity`);
        }
      } else {
        this.dynamicStats.hp += this.player.movesCollection.damage;
        this.player.movesCollection.totalDamage -= this.player.movesCollection.damage;
        this.battleLogs.push(`💥 Monstrosity: ${this.name} reduced your DMG to nothing`);
      }
    }

    // opponent cards are dynamic stats array
    const monsterChoices = opponentCards.map((c, i) => (c.hp > 0 ? i : -1)).filter(c => c !== -1);
    const filteredChoices = monsterChoices.filter(c => c !== this.lastAttack);
    const hellFreezeData = this.player.movesCollection.hellFreezeData;
    let customHellFreezeLog = '';

    let monsterChoice =
      monsterChoices.length === 1
        ? monsterChoices[getRandomIndex(monsterChoices.length)]
        : filteredChoices[getRandomIndex(filteredChoices.length)];

    this.lastAttack = monsterChoice;

    this.damage = trueDamage ? 100 : this.evalDamage(opponentCards[monsterChoice]);

    if (trueDamage) {
      this.battleLogs.push(`💥 ${this.name}'s True DMG set to 100`);
    }

    if (criticalDamage) {
      this.damage *= 1.6;
      this.battleLogs.push(`💥 Critical: ${this.name}'s DMG boosted 1.6x`);
    }

    if (lifeDrain) {
      this.dynamicStats.hp += this.damage;
      this.player.movesCollection.totalDamage -= this.damage;
      this.battleLogs.push(`💥 Life Drain: ${this.name} healed itself by ${Math.floor(this.damage)}`);
    }

    const effectiveness = this.player.movesCollection.effectiveness;
    if (afk) {
      opponentCards[monsterChoice].hp -= this.damage * (firstMove ? 1 : 2);
      this.player.updateMoves();
      this.battleLogs.push(
        `> ${this.name} dealt DMG ${this.damage * (firstMove ? 1 : 2)} to Card ${monsterChoice + 1}`,
      );
      return;
    }

    if (this.player.apRound) {
      this.damage = 0;
    }

    let moveId = this.player.selectedMove.id;
    if (radiance) moveId = 1;

    // Venom Bite
    if (
      this.player.movesCollection.venomBiteValue[0] &&
      this.player.dynamicStats[this.player.movesCollection.venomBiteValue[1]].hp > 0
    ) {
      this.dynamicStats.hp -= Math.floor(0.04 * this.fixedStats.hp);
      this.player.movesCollection.totalDamage += Math.floor(0.04 * this.fixedStats.hp);
      this.battleLogs.push(
        `> Poison State depleted ${Math.floor(0.04 * this.fixedStats.hp)} HP (${Math.floor(0.04 * 100)}%)`,
      );
    }

    if (this.player.movesCollection.necroticValue) {
      this.dynamicStats.hp -= Math.floor(0.03 * this.fixedStats.hp);
      this.player.movesCollection.totalDamage += Math.floor(0.03 * this.fixedStats.hp);
      this.battleLogs.push(
        `> Necrotic Curse: wooshed ${Math.floor(0.03 * this.fixedStats.hp)} HP (${Math.floor(0.03 * 100)}%)`,
      );
    }

    // Vision Strike
    if (moveId === 6) {
      monsterChoice = this.player.getMax(...this.player.dynamicStats.map(c => c.hp));
      this.damage =
        (this.player.apRound ? 0 : this.evalDamage(opponentCards[monsterChoice])) * (criticalDamage ? 1.6 : 1);
      if (!hellFreezeData.active && this.dynamicStats.hp > 0) {
        opponentCards[monsterChoice].hp -= this.damage;
        this.battleLogs.push(
          `- Vision Strike: ${this.name} attacked Card ${monsterChoice + 1} and gave ${Math.floor(
            this.damage,
          )} DMG\n> DEF of Card ${monsterChoice + 1} was increased by 40%`,
        );
      } else {
        customHellFreezeLog = `> Vision Strike activated: Targetted card set to ${monsterChoice + 1}`;
      }
    }

    // Taunt
    if (moveId === 23) {
      monsterChoice = this.player.selectedMove.moveOf;
      this.damage =
        (this.player.apRound ? 0 : this.evalDamage(opponentCards[monsterChoice])) * (criticalDamage ? 1.6 : 1);

      if (!hellFreezeData.active && this.dynamicStats.hp > 0) {
        opponentCards[monsterChoice].hp -= this.damage;
        this.battleLogs.push(
          `- Taunt: ${this.name} attacked Card ${monsterChoice + 1} and gave ${Math.floor(
            this.damage,
          )} DMG\n> DEF of Card ${monsterChoice + 1} was increased by 40%`,
        );
      } else {
        customHellFreezeLog = `> Taunt activated: Targetted card set to ${monsterChoice + 1}`;
      }
    }

    // Body Shock
    if (moveId === 5) {
      this.damage /= effectiveness;
      this.damage /= 2;

      if (!hellFreezeData.active && this.dynamicStats.hp > 0) {
        opponentCards[monsterChoice].hp -= this.damage;
        if (!setTrueDamage()) {
          this.battleLogs.push(`> Body Shock: ${Math.floor(effectiveness * 0.5 * 100)}% damage reduction`);
          this.battleLogs.push(`- ${this.name} dealt ${Math.floor(this.damage)} DMG to Card ${monsterChoice + 1}`);
        }
      } else if (!setTrueDamage()) {
        customHellFreezeLog = `> Body Shock: ${Math.floor(effectiveness * 0.5 * 100)}% damage reduction`;
      }
    }

    // Shadow Ball
    if (moveId === 8) {
      if (this.player.shadowBallChoice === monsterChoice) {
        let per = 100;
        if (effectiveness <= 0.7) {
          this.damage *= 0.2;
          per = 80;
        } else {
          this.damage = 0;
        }

        if (!hellFreezeData.active) {
          opponentCards[monsterChoice].hp -= this.damage;
          if (!setTrueDamage()) {
            this.battleLogs.push(
              `${`> Shadow ball protected Card ${this.player.shadowBallChoice + 1} reducing ${per}% DMG`}`,
            );
            this.battleLogs.push(`- ${this.name} dealt ${Math.floor(this.damage)} to Card ${monsterChoice + 1}`);
          }
        } else if (!setTrueDamage()) {
          customHellFreezeLog = `${`> Shadow ball protected Card ${
            this.player.shadowBallChoice + 1
          } reducing ${per}% DMG`}`;
        }
      } else if (!hellFreezeData.active && this.dynamicStats.hp > 0) {
        opponentCards[monsterChoice].hp -= this.damage;
        this.battleLogs.push(`${'- Shadow ball was deactivated | Full DMG was given to the opponent'}`);
        this.battleLogs.push(`- ${this.name} dealt ${Math.floor(this.damage)} to Card ${monsterChoice + 1}`);
      } else {
        customHellFreezeLog = `${'- Shadow ball was deactivated | Full DMG was given to the opponent'}`;
      }
    }

    // Cosmic Impact
    if (moveId === 9) {
      const factor = effectiveness <= 0.5 ? crypto.randomInt(15, 20) : crypto.randomInt(20, 25);
      const reduction = (factor / 100) * this.dynamicStats.hp;
      this.dynamicStats.hp -= reduction;
      this.player.movesCollection.totalDamage += reduction;
      this.battleLogs.push(`> Cosmic Impact consumed ${factor}% HP`);

      if (!hellFreezeData.active && this.dynamicStats.hp > 0) {
        opponentCards[monsterChoice].hp -= this.damage;
        this.battleLogs.push(`- ${this.name} dealt ${Math.floor(this.damage)} to Card ${monsterChoice + 1}`);
      } else {
        customHellFreezeLog = '';
      }
    }

    // Rock Solid
    if (this.player.movesCollection.rockSolidState) {
      const rockSolidChance = crypto.randomInt(1, 100);
      const isRockSolid = rockSolidChance < 75;
      if (isRockSolid && !setTrueDamage()) {
        this.damage = 0;
        this.battleLogs.push(`> Rock Solid protection activated | ${Math.floor(this.damage)} DMG`);
      } else {
        if (!hellFreezeData.active && this.dynamicStats.hp > 0) {
          opponentCards[monsterChoice].hp -= this.damage;
          this.battleLogs.push(`- ${this.name} bypassed Rock Solid dealing ${Math.floor(this.damage)} DMG`);
        } else {
          customHellFreezeLog = `${this.name} bypassed Rock Solid`;
        }

        if (opponentCards[monsterChoice].hp > 0) {
          opponentCards[monsterChoice].hp += Math.floor(0.15 * this.player.fixedStats[monsterChoice].hp);
          opponentCards[monsterChoice].hp = Math.min(
            opponentCards[monsterChoice].hp,
            this.player.fixedStats[monsterChoice].hp,
          );
          this.battleLogs.push(
            `> Rock Solid recovered ${Math.floor(0.15 * this.player.fixedStats[monsterChoice].hp)} HP of Card ${
              monsterChoice + 1
            }`,
          );
        }
      }
      this.player.movesCollection.setRockSolidState();
    }

    // Atomic Blast
    if (moveId === 15) {
      const previousHP = this.dynamicStats.hp;
      const damage = Math.floor(0.65 * previousHP * effectiveness);
      this.dynamicStats.hp -= damage;
      this.player.movesCollection.totalDamage += damage;
      this.battleLogs.push(`> Atomic Blast: Took away ${damage} HP`);
      if (this.dynamicStats.hp > 0 && !hellFreezeData.active) {
        opponentCards[monsterChoice].hp -= this.damage;
        this.battleLogs.push(`- ${this.name} dealt ${Math.floor(this.damage)} to Card ${monsterChoice + 1}`);
      } else {
        customHellFreezeLog = '';
      }
    }
    // Purify
    if (
      moveId === 25 ||
      (this.player.movesCollection.purifyActive.active &&
        this.player.movesCollection.round - this.player.movesCollection.purifyActive.active.round < 2)
    ) {
      const initialDamage = this.damage;
      this.damage *= 0.9;

      if (!hellFreezeData.active && this.dynamicStats.hp > 0) {
        opponentCards[monsterChoice].hp -= this.damage;
        if (!setTrueDamage()) {
          this.battleLogs.push(`> Purify: Damage Reduction - 10% | Absorbed ${Math.floor(initialDamage * 0.1)} DMG`);
          this.battleLogs.push(`- ${this.name} dealt ${Math.floor(this.damage)} to Card ${monsterChoice + 1}`);
        }
      } else {
        this.battleLogs.push(`> Purify: Damage Reduction - 10% | Absorbed ${Math.floor(initialDamage * 0.1)} DMG`);
        customHellFreezeLog = '';
      }
    }

    if (this.temporal.occured && this.temporal.missed) {
      const dodgeChance = crypto.randomInt(1, 100);
      if (dodgeChance > 1 && dodgeChance <= 50) {
        if (effectiveness <= 0.5) {
          this.damage *= crypto.randomInt(1, 35) === 6 ? 0 : 0.2;
        } else {
          this.damage = 0;
        }
        this.battleLogs.push(
          `> Temporal Shift Half Granted | You took ${Math.floor(this.damage)} DMG with no Reflect DMG`,
        );
      } else if (!hellFreezeData.active) {
        opponentCards[monsterChoice].hp -= this.damage;
        this.battleLogs.push(
          `- Temporal Shift missed | ${this.name} dealt ${Math.floor(this.damage)} DMG to Card ${monsterChoice + 1}`,
        );
      } else {
        customHellFreezeLog = '- Temporal Shift missed';
      }
      this.temporal = { occured: false, missed: false };
    }
    // Temporal Shift
    if (moveId === 27) {
      const miss = crypto.randomInt(1, 100);
      if (miss >= 1 && miss <= 45) {
        const ogDmg = this.damage;
        this.dynamicStats.hp -= 0.6 * this.damage * effectiveness;
        if (effectiveness <= 0.5) {
          this.damage *= crypto.randomInt(1, 100) < 60 ? 0 : 0.2;
        } else {
          this.damage = 0;
        }
        this.temporal = { occured: true, missed: false };
        if (!setTrueDamage()) {
          this.battleLogs.push(
            `> Temporal Shift Fully Granted | You took ${Math.floor(this.damage)} DMG while reflecting ${Math.floor(
              0.6 * ogDmg * effectiveness,
            )} DMG`,
          );
        }
      } else {
        this.temporal = { occured: true, missed: true };
        if (!hellFreezeData.active) {
          opponentCards[monsterChoice].hp -= this.damage;
          this.battleLogs.push(
            `- Temporal Shift missed | ${this.name} dealt ${Math.floor(this.damage)} DMG to ${monsterChoice + 1}`,
          );
        } else {
          customHellFreezeLog = '- Temporal Shift missed';
        }
      }
    }

    // Hell Freeze

    if (hellFreezeData.active && this.dynamicStats.hp > 0) {
      const shieldLeft = hellFreezeData.shield[monsterChoice];
      if (shieldLeft > 0) {
        if (shieldLeft - this.damage <= 0) {
          const baseDamage = this.damage;
          const reductionTo = 1 - hellFreezeData.shield[monsterChoice] / this.damage;
          this.damage *= reductionTo;
          this.battleLogs.push(`+ Hell Freeze: Shield absorbed ${Math.floor(baseDamage - this.damage)} DMG`);
          this.battleLogs.push('- Hell Freeze: Shield was broken');
          hellFreezeData.shield[monsterChoice] = 0;
          const damage = this.damage;
          if (customHellFreezeLog.length) {
            this.battleLogs.push(customHellFreezeLog);
          }
          this.battleLogs.push(`- ${this.name} dealt ${Math.floor(damage)} DMG to Card ${monsterChoice + 1}`);
          opponentCards[monsterChoice].hp -= damage;
        } else {
          hellFreezeData.shield[monsterChoice] -= this.damage;
          if (customHellFreezeLog.length) {
            this.battleLogs.push(customHellFreezeLog);
          }
          this.battleLogs.push(
            `+ Hell Freeze: Card ${monsterChoice + 1} Shield absorbed ${Math.floor(this.damage)} DMG`,
          );
          this.damage = 0;
          opponentCards[monsterChoice].hp -= this.damage;
        }
      }
    }

    const blacklistedMoves = [27, 25, 16, 15, 12, 9, 8, 5, 6, 23];
    if (!blacklistedMoves.includes(moveId) && !radiance && !hellFreezeData.active && this.dynamicStats.hp > 0) {
      opponentCards[monsterChoice].hp -= this.damage;
      this.battleLogs.push(`- ${this.name} dealt ${Math.floor(this.damage)} DMG to Card ${monsterChoice + 1}`);
    }

    if (radiance && this.dynamicStats.hp > 0) {
      const dividedDmg = Math.floor(this.damage / 3);
      this.player.dynamicStats[0].hp -= hellFreezeData.active && monsterChoice === 0 ? 0 : dividedDmg;
      this.player.dynamicStats[1].hp -= hellFreezeData.active && monsterChoice === 1 ? 0 : dividedDmg;
      this.player.dynamicStats[2].hp -= hellFreezeData.active && monsterChoice === 2 ? 0 : dividedDmg;
      this.battleLogs.push(`💥 Radiance: ${this.name} gave ${dividedDmg} DMG to every card`);
    }

    this.player.updateMoves();
    this.player.selectedMove = null;
    this.specialMove = null;
    this.lastDamage = radiance ? this.damage / 3 : this.damage;
    this.player.movesCollection.lastRoundOn = monsterChoice;
    this.setSpecialMove();
  }
}

module.exports = Monster;
*/