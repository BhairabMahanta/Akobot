 
   const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const { QuestLogic } = require('./questLogic');
const { quests } = require('./quests');
const fs = require('fs');
const path = require('path');
const playersFilePath = path.join(__dirname, '..', '..', 'data', 'players.json');
const playerData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));

class Quest {
  constructor(that) {
    this.player = that.player;
    this.playerId = that.playerId
    this.questName = that.questName;
    this.questDetails = null;
    this.questLogic = new QuestLogic(this.player);
    this.embed = that.embed;
    this.row = that.row
    this.message = that.message
    this.collectorMessage = that.collectorMessage;
    this.yesNoButton = that.yesNoButton
  }
  async editFields() {
    this.embed = new EmbedBuilder()
      .setTitle(`Quest Details: ${quests[this.questName].title}`)
      .setDescription(`Have something like {dialogueindex}`)
      .setColor("#0099ff");
  }

  async showQuestDetails() {
    const questDetails = quests[this.questName]
    this.questDetails = questDetails;
    console.log('questDetails:', questDetails)
      await this.editFields();
    this.embed.setDescription(`### - Description: ${questDetails.description}`);

    const rewardFields = [];
questDetails.rewards.forEach((reward) => {
  console.log('xp:', reward.experience)

    rewardFields.push({
      name: `- **Rewards:** `, // Combine index and answer text
      value: `- **Experience: ${reward.experience}** \n\n **Items: ${reward.items}**`, // Empty value for alternating
      inline: false,
    });
  console.log('rewardsFields:',rewardFields);
  
});
     this.embed.addFields(...rewardFields);
     const acceptCancel = new ActionRowBuilder().addComponents(
        // const options = [
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Accept")
            .setCustomId("Accept"),
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Decline")
            .setCustomId("Decline"),
        // ];
          );
            this.row = [acceptCancel]
     // this.row =  await this.yesNoButton

    // Send the question embed
    await this.collectorMessage.edit({ embeds: [this.embed], components: this.row });
    
    // Implement logic to show quest details in an embed
    // Include buttons to Accept or Decline the quest
  }

  async acceptQuest() {
     this.editFields()
    this.embed.setDescription(`### - You have accepted the quest ${this.questDetails.title}.\n- Objective: ${this.questDetails.objective}\n- You can view your selected quests by typing a!myquests`)
    
    // Check if the player has a quest array
if (!playerData[this.playerId].quests) {
  // If the quest array doesn't exist, create it as an empty array
  playerData[this.playerId].quests = [];
}if (playerData[this.playerId].quests) {
 // Check if the quest title already exists in the quest array
if (playerData[this.playerId].quests.includes(this.questDetails.title)) {
  // If it exists, send a message indicating that the quest is already pending
  this.embed.setDescription('### - You already have that quest pending, clear it first dumbass.');
} else {
  // If it doesn't exist, push the quest title to the quest array
  playerData[this.playerId].quests.push(this.questDetails.title);

  // Write the updated player data back to the JSON file
  fs.writeFileSync(playersFilePath, JSON.stringify(playerData, null, 2), 'utf8');

  
}
    await this.collectorMessage.edit({ embeds: [this.embed], components: [] });
    // Implement logic to accept the quest
    // await this.questLogic.startQuest(this.player, this.questName);
  }
  }

  async declineQuest() {
     this.editFields()
    this.embed.setDescription(`### - You have declined the quest ${this.questDetails.title}.\n- Objective: ${this.questDetails.objective}\n- You can view your selected quests by typing a!myquests`)
    await this.collectorMessage.edit({ embeds: [this.embed], components: [] });

    // Implement logic to decline the quest
  }
}

module.exports = {Quest};
