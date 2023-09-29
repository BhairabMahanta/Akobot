// QuestLogic.js
const players = require('../../data/players.json');
const { quests } = require('./quests');
const fs = require('fs');
const path = require('path');
// Define the path to 'players.json' file
const playersFilePath = path.join(__dirname, '..', '..', 'data', 'players.json');
const playerData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));


class QuestLogic {
  constructor(message, interaction, sentMessage, embed, row, row2) {
    this.player = players[message.author.id]
    this.quests = quests;
    this.message = message;
    this.embed = embed;
    this.row = row;
    this.row2 = row2;
    this.i = interaction;
    this.sentMessage = sentMessage;
    
    // Initialize quest logic variables and methods here
  }


  startQuest(questId) {
    
    const quest = this.quests[questId];
    console.log('embed:', this.embed)
    if (!quest) {
      this.embed.setFooter({text:'Quest not found.'})
      return this.sentMessage.edit({ embeds: [this.embed], components: [this.row, this.row2] });
    } 
    
 
    if (questId in this.player.activeQuests) {
  
      this.embed.setFooter({text:'You already started the quest, view your progress through a!myquests.'})
      this.embed.setTitle('Already Started!')
      this.embed.setDescription("### - You already started the quest, view your progress through a!myquests.")
      return this.sentMessage.edit({ embeds: [this.embed], components: [this.row, this.row2] });
    } 
// Check if the player has the "gather_ingredients" quest
if (!players[this.message.author.id].activeQuests[questId]) {
  // Edit the "gather_ingredients" quest
// players[this.message.author.id].activeQuests[questId] = questId
    console.log('things get out of hand:',  players[this.message.author.id].activeQuests)
  console.log('APNA TIME NAI AYEGA:', this.quests[questId])
  players[this.message.author.id].activeQuests[questId] = {
    objectives: [
      {
        id: `${this.quests[questId].objectives[0].id}`,
        target: `${this.quests[questId].objectives[0].target}`,
        current: `${this.quests[questId].objectives[0].current}`,
        required: `${this.quests[questId].objectives[0].required}`,
      },
    ],
    timeLimit: {
      totalDays: `${this.quests[questId].timeLimit}`,
      daysLeft:  `${this.quests[questId].timeLimit}`,
    },
    questChannel: "newChannelId",
  };
}
console.log('playerData:', players[this.message.author.id].activeQuests[questId])
// Save the updated player's data back to players.json
// fs.writeFileSync(playersFilePath, JSON.stringify(playerData, null, 2), 'utf8');

    // this.savePlayerData();
    return this.message.channel.send(`Started quest: ${quest.title}`);
  }

  completeQuest(questId) {
    const quest = this.quests[questId];
    if (!quest) return "Quest not found.";

    if (!this.player.activeQuests.includes(questId)) {
      return "You don't have this quest.";
    }

    // Check if quest objectives are met
    const objectives = quest.objectives;
    for (const objective of objectives) {
      if (objective.current < objective.required) {
        return "Quest objectives not met.";
      }
    }

    // Remove quest from active quests and grant rewards
    const index = this.player.activeQuests.indexOf(questId);
    this.player.activeQuests.splice(index, 1);

    // Handle rewards here
    const rewards = quest.rewards;
    this.player.gainExperience(rewards.experience);
    this.player.gainItems(rewards.items);
    // this.savePlayerData();
    return `Completed quest: ${quest.title}`;
  }

  failQuest(questId) {
    const quest = this.quests[questId];
    if (!quest) return "Quest not found.";

    if (!this.player.activeQuests.includes(questId)) {
      return "You don't have this quest.";
    }

    // Handle quest failure logic here (e.g., deduct rewards or set quest status to failed)
    // ...

    // Remove quest from active quests
    const index = this.player.activeQuests.indexOf(questId);
    this.player.activeQuests.splice(index, 1);

    this.savePlayerData();
    return `Quest failed: ${quest.title}`;
  }

  // Add functions to load and save player data
  loadPlayerData() {
    try {
      const data = fs.readFileSync("player.json", "utf8");
      const parsedData = JSON.parse(data);
      this.player = parsedData;
      console.log("Player data loaded.");
    } catch (err) {
      console.error("Error loading player data:", err);
    }
  }

  savePlayerData() {
    try {
      const data = JSON.stringify(this.player, null, 2);
      fs.writeFileSync("player.json", data, "utf8");
      console.log("Player data saved.");
    } catch (err) {
      console.error("Error saving player data:", err);
    }
  }

  // Add other quest-related methods and logic according to summary
}

module.exports = { QuestLogic };
