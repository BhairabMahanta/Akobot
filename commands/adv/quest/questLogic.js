// QuestLogic.js
const { quests } = require('./quests.js');
const {mongoClient} = require('../../../data/mongo/mongo.js')
const db = mongoClient.db('Akaimnky');
const collection = db.collection('akaillection');
const options = { upsert: true };

   
class QuestLogic {
  constructor(message, interaction, sentMessage, embed, row, row2, dbData, db) {
    this.player = dbData;
    this.db = db;
    this.quests = quests;
    this.message = message;
    this.embed = embed;
    this.row = row;
    this.row2 = row2;
    this.i = interaction;
    this.sentMessage = sentMessage;
    
    // Initialize quest logic variables and methods here
  }



  async startQuest(questId) {
    
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
      this.embed.setFields({
        name: `Quest Name:`,
        value: this.quests[questId].title,
        inline: true
      })
      return this.sentMessage.edit({ embeds: [this.embed], components: [this.row, this.row2] });
    } 
// Check if the player has the "gather_ingredients" quest
if (!this.player.activeQuests[questId]) {
  const quest = this.quests[questId];
  console.log('questTIMELEFT:', quest.timeLimit)
  const timeLeft = Math.floor((Date.now() / 1000) + quest.timeLimit * 24 * 60 * 60);
 console.log('timeLEFT: timeLeft', timeLeft)
  const stuff = {
    objectives: [],
    timeLimit: {
      totalDays: `${quest.timeLimit}`,
      daysLeft: `${timeLeft}`,
    },
    questChannel: "newChannelId",
    questStatus: "incomplete",
  };

  for (const objective of quest.objectives) {
    const objectiveData = {
      id: `${objective.id}`,
      target: `${objective.target}`,
      description: `${objective.description}`,
      current: `${objective.current}`,
      required: `${objective.required}`,
    };

    stuff.objectives.push(objectiveData);
  }

  this.player.activeQuests[questId] = stuff;
}
console.log('this.player.activeQuests:', this.player.activeQuests)
 // Save the updated player's data to the database
 try {
  // Retrieve the player's document
  const filter = {_id: this.message.author.id}
  const playerData2 = await collection.findOne(filter);

   if (playerData2) { 
    // Update the player's document
    await collection.updateOne(filter, { $set: this.player });

    console.log('Player data updated:', this.player);
  } else {
    console.log('Player not found or updated.');
  }

} catch (err) {
  console.error('Error updating/adding gather_ingredients quest:', err);
}
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

  }

module.exports = { QuestLogic };
