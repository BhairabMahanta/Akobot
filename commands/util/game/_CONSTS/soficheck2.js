/*'use strict';

const attacks = require('../../../../scripts/attacks');
const { modalResponse, createButton, ActionRow } = require('../../../core/utils/Util');
const Moves = require('./moves');
const { activeRaidModel } = require('../../../mongo/models/guild/activeRaid');

class Player {
  constructor(player) {
    this.id = player.id;
    this.guildId = player.guild.id;
    this.username = player.username;
    this.guild = player.guild;
    this.deck = player.deck;
    this.url = player.url;
    this.finishEmbedUrl = null;
    this.fixedStats = player.fixedStats;
    this.dynamicStats = player.dynamicStats;
    this.moves = [];
    this.messageId = player.messageId;
    this.isRaid = true;
    this.maxSpeed = 0;
    this.previousMoves = [];
    this.selectedMove = null;
    this.accumulatedPoints = 0;
    this.shadowBallChoice = null;
    this.druidBlessingChoice = null;
    this.battleLogs = [];
    this.movesCollection = new Moves();
    this.raidedAt = player.raidedAt;
    this.finishedAt = null;
    this.apPerRound = 0;
    this.defenseFactor = 0;
    this.apRound = false;
    this.movesPlayed = [];
    this.points = 0;
    this.shared = null;
    this.finished = false;
    this.surrender = false;
    this.dbUser = null;
    this.finishEmbedUrl = null;
    this.difficulty = 0;
  }

  async setDbUser() {
    this.dbUser = (await activeRaidModel.findOne({ active: true }).select('participants')).participants.find(
      c => c.id === this.id,
    );
  }

  setSurrender() {
    this.surrender = true;
  }

  setFinished() {
    this.finishedAt = new Date();
    this.finished = true;
  }

  setFinishEmbedUrl(url) {
    this.finishEmbedUrl = url;
  }

  async setPostRaidData() {
    const dbPlayer = {
      id: this.id,
      guildId: this.guildId,
      damage: Math.floor(this.movesCollection.totalDamage),
      points: this.points,
      difficulty: this.difficulty,
      url: this.url,
      finishEmbedUrl: this.finishEmbedUrl,
      codes: this.dynamicStats.map(c => c.code),
      finished: this.finished,
      moves: this.movesCollection.round,
      surrender: this.surrender,
      shared: this.shared ? this.shared.codes : [],
      raidedAt: this.raidedAt,
      finishedAt: this.finishedAt,
      url2: this.finishEmbedUrl,
    };

    await activeRaidModel.updateOne(
      { active: true, 'participants.id': this.id },
      { $set: { 'participants.$': dbPlayer } },
    );
  }

  setDifficulty(difficulty) {
    this.movesCollection.setDifficulty(difficulty);
    this.difficulty = difficulty;
  }

  async setPreRaidData() {
    const dbPlayer = {
      id: this.id,
      guildId: this.guildId,
      url: this.url,
      code: this.dynamicStats.map(c => c.code),
      finished: false,
      surrender: false,
      moves: 0,
      raidedAt: this.raidedAt,
      difficulty: this.difficulty,
    };
    if (!this.dbUser) {
      await activeRaidModel.updateOne({ active: true }, { $push: { participants: dbPlayer } });
    }
  }

  raidDonePayload(raidEmbed, files) {
    const btn1 = createButton(`${this.messageId}_history`, 'PRIMARY', 'History', null);
    const linkBtn = createButton(null, 'LINK', 'Go to raid', null, this.dbUser.url);
    return {
      components: [ActionRow([linkBtn, btn1])],
      embeds: [raidEmbed],
      files,
    };
  }

  setOpponentStats(fixedStats, dynamicStats) {
    this.opponentFixedStats = fixedStats;
    this.opponentDynamicStats = dynamicStats;
  }

  setBattleLogs(battleLogs) {
    this.battleLogs = battleLogs;
    this.movesCollection.setBattleLogs(battleLogs);
  }

  setMaxSpeed() {
    this.maxSpeed = this.fixedStats.map(c => c.speed).sort((a, b) => b - a)[0];
    this.setApPerRound();
  }

  incrementAp() {
    if (!this.apRound) {
      this.accumulatedPoints += this.apPerRound;
    }

    if (this.accumulatedPoints >= 20) {
      this.accumulatedPoints -= 20;
      this.battleLogs.push('= AP accumulated monster DMG will not reach');
      this.apRound = true;
    } else {
      this.apRound = false;
    }
  }

  setMoves() {
    for (const [moveOf, card] of this.fixedStats.entries()) {
      if (card?.moves) {
        const s1 = card.selectedMoves?.split('-') || card.moves.slice(0, 2).map(s => s.split('-')[0]);
        const movesCd = {
          15: 4,
          11: 1,
          18: 1,
        };

        const filteredMoves = card.moves.filter(k => s1.includes(k.split('-')[0]));

        for (const move of filteredMoves) {
          const [id, eff] = move.split('-');
          const { name, emoji, description } = attacks[parseInt(id)];
          const opt = {
            label: name.length === 0 ? 'No name' : `${moveOf + 1} - ${name} (${eff}%)`,
            description: description.length > 99 ? `${description.slice(0, 96)}...` : description,
            emoji: emoji.length === 0 ? '💥' : emoji,
            value: `${this.messageId}_${id}_${eff}`,
            selected: false,
            disabled: false,
            moveOf,
            id: parseInt(id),
            onCd: movesCd[parseInt(id)] || 0,
          };
          this.moves.push(opt);
        }
      }
    }

    if (this.isRaid) {
      this.moves.push({
        label: 'Sofi Special',
        value: 'run',
        emoji: '1060710701229948998',
        description: 'Sofi Special attack',
        run: true,
        onCd: 0,
      });
      this.moves.push({
        label: 'Refresh',
        value: 'refresh',
        emoji: '895652697410273291',
        description: 'To refresh the moves again like shadow ball and druid',
        refresh: true,
        onCd: 0,
      });
      this.setMaxSpeed();
    }
  }

  toggleMoveState(moveOf, to, all = false) {
    for (const move of this.moves) {
      if (move.moveOf === moveOf && !all) {
        move.disabled = to;
      }
      if (all) {
        move.selected = to;
      }
    }
  }

  async selectMove(interaction, value) {
    const selectedMoveIndex = this.moves.findIndex(move => move.value === value);
    this.toggleMoveState(0, false, true);
    if (selectedMoveIndex === -1) {
      return 'Cannot find the move';
    }
    if (this.moves[selectedMoveIndex].disabled) {
      return 'That move is disabled';
    }

    this.selectedMove = this.moves[selectedMoveIndex];

    if (this.selectedMove.id === 8 || this.selectedMove.id === 20) {
      const choiceSuccess = await this.waitForUserResponse(interaction);
      if (!choiceSuccess) {
        await interaction.deferUpdate().catch(() => null);
        return;
      }
    }
    await interaction.deferUpdate().catch(() => null);
    this.moves[selectedMoveIndex].selected = true;
  }

  updateMovesCooldown() {
    for (const move of this.moves) {
      if (move.onCd !== 0 && !move.refresh) move.onCd--;
    }
  }

  updateMoves() {
    const cardHps = this.dynamicStats.map(c => c.hp);
    if (cardHps[0] <= 0) {
      this.toggleMoveState(0, true);
    } else {
      this.toggleMoveState(0, false);
    }
    if (cardHps[1] <= 0) {
      this.toggleMoveState(1, true);
    } else {
      this.toggleMoveState(1, false);
    }
    if (cardHps[2] <= 0) {
      this.toggleMoveState(2, true);
    } else {
      this.toggleMoveState(2, false);
    }
  }

  toggleRaid() {
    this.isRaid = !this.isRaid;
  }

  getMax(a, b, c) {
    if (a >= b && a >= c) {
      return 0;
    } else if (b >= a && b >= c) {
      return 1;
    } else {
      return 2;
    }
  }

  // Input variables are HP
  getMin(a, b, c) {
    const hps = [
      [0, a],
      [1, b],
      [2, c],
    ];
    const filtered = hps.filter(l => l[1] > 0);
    return filtered.length ? filtered.sort((d, e) => d[1] - e[1])[0][0] : 0;
  }

  async waitForUserResponse(interaction) {
    let modalChoice = this.getMin(this.dynamicStats[0].hp, this.dynamicStats[1].hp, this.dynamicStats[2].hp) + 1;

    const { response, mreply } = await modalResponse(interaction, 'nametext', 'nameentry', {
      label: `Enter the card you want to ${this.selectedMove.id === 20 ? 'heal' : 'protect'}`,
      style: 'SHORT',
      placeHolder: 'yes',
      value: modalChoice.toString(),
      modalTitle: `${this.selectedMove.id === 20 ? 'Druid Blessing Heal' : 'Shadow Ball: Protection'}`,
      time: 15_000,
    });

    if (!response || !mreply) return null;

    if (![1, 2, 3].includes(parseInt(response))) {
      return mreply.reply({ content: 'Invalid choice provided' });
    }

    modalChoice = parseInt(response);
    if (this.dynamicStats[modalChoice - 1].hp <= 0)
      return mreply.reply({ content: 'The card is defeated. Type of new choice' });

    mreply.reply({ content: 'Choice was successfully taken', ephemeral: true });
    this.battleLogs.push(
      this.selectedMove.id === 20
        ? `+ Card ${modalChoice} was healed`
        : '+ That card will be protected during next attack',
    );

    if (this.selectedMove.id === 20) {
      this.movesCollection.druidChoice = modalChoice - 1;
    } else {
      this.shadowBallChoice = modalChoice - 1;
    }
    return true;
  }

  increaseMovesCooldown() {
    const selectedMoveIndex = this.moves.findIndex(c => c.selected);
    if (this.moves[selectedMoveIndex]?.onCd === 0) {
      if ([20, 16, 9, 24, 4, 15, 18, 10, 1, 29].includes(this.moves[selectedMoveIndex].id)) {
        this.moves[selectedMoveIndex].onCd = 3;
      } else {
        this.moves[selectedMoveIndex].onCd = 2;
      }
    }
  }

  applyMove(opponentStats) {
    if (!this.selectedMove) return 'No move selected';
    const effectiveness = parseInt(this.selectedMove.value.split('_')[2]);
    const moveOf = this.selectedMove.moveOf;
    const attacker = {
      fixedStats: this.fixedStats,
      dynamicStats: this.dynamicStats,
    };
    this.increaseMovesCooldown();
    this.movesPlayed.push({ moveOf, id: this.selectedMove.id, effectiveness });
    this.movesCollection.setMoveOf(moveOf);
    this.movesCollection.setStats(attacker, opponentStats);

    this.movesCollection.execute(this.selectedMove.id, effectiveness);
    this.movesCollection.lastRoundsHps = this.dynamicStats.map(c => c.hp);
  }

  setApPerRound() {
    const remainingSpeeds = this.fixedStats
      .map(c => c.speed)
      .sort((a, b) => b - a)
      .slice(1);
    this.apPerRound = remainingSpeeds.map(c => this.getApRange(c)).reduce((a, b) => a + b, 0);
  }

  getApRange(speed) {
    if (speed <= 80) {
      return (speed - 20) * 0.025;
    } else if (speed <= 140) {
      return (speed - 80) * 0.015 + (80 - 20) * 0.025;
    } else {
      return (speed - 140) * 0.01 + (140 - 80) * 0.015 + (80 - 20) * 0.025;
    }
  }

  setXP(xp) {
    this.points = xp;
  }

  setSharedCards(xpCards) {
    this.shared = xpCards || null;
  }

  async deckConflict(interaction, collector) {
    if (this.shared?.codes.some(c => this.dynamicStats.map(l => l.code).includes(c))) {
      collector.stop('conflict');
      await interaction.reply({
        content: 'The deck and share XP deck has some cards in common. Change the deck or change the shared cards',
        ephemeral: true,
      });
      return true;
    }
  }
}

module.exports = Player;
*/