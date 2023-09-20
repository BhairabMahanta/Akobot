// Quest.js
const { QuestLogic } = require('./questLogic');

class Quest {
  constructor(player, questName) {
    this.player = player;
    this.questName = questName;
    this.questLogic = new QuestLogic(this);
  }

  async showQuestDetails() {
    // Implement logic to show quest details in an embed
    // Include buttons to Accept or Decline the quest
  }

  async acceptQuest() {
    // Implement logic to accept the quest
    await this.questLogic.startQuest(this.player, this.questName);
  }

  async declineQuest() {
    // Implement logic to decline the quest
  }
}

module.exports = Quest;
