const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const tutorialData = require('./story.json');
 const firstId = tutorialData.questions.find((d) => d.id === 1);

class Tutorial {
  constructor(player, name, message) {
    this.player = player
    this.playerId = message.author.id;
    console.log('playerID:', this.playerId)
    this.name = name;
    console.log('name:', this.name)
    this.affection = 0;
    this.dialogueIndex = 0;
    this.embed = null;
    this.row = null;
    this.message = message
    this.collectorMessage = null
    this.collector = null;
    this.answerFields = null;
    this.selectionMap = {};
    this.text = null;
    this.questName = null;
    this.quest = null;
    this.answers = null;
    this.imageUrl = null;
    this.yesNoButton = null;
  }

  async askQuestion(dialogue) {
    const { text, answers, imageUrl } = dialogue;
    this.text = text;
    this.answers = answers;
    this.imageUrl = imageUrl;

    // Create the answer buttons
    const answerButtons = answers.map((answer, index) => {
      const label = String.fromCharCode(65 + index); // Convert index to A, B, C, D labels
      const selection = label.toLowerCase();
      this.selectionMap[selection] = answer.outcome.nextQuestionId;
      return new ButtonBuilder()
        .setStyle('Primary')
        .setCustomId(`answer_${index + 1}`)
        .setLabel(label);
    });

    // Create the row with answer buttons
    this.row = new ActionRowBuilder().addComponents(...answerButtons);

const answerFields = [];
// answers.forEach((answer, index) => {
  // if (index % 2 === 0) {
  //   answerFields.push({
  //     name: `${String.fromCharCode(65 + index)}. ${answer.text}`, // Combine index and answer text
  //     value: '', // Empty value for alternating
  //     inline: false,
  //   });
  // }
  // else {
  //   // Use the previous entry's value for the current entry
  //   answerFields[answerFields.length - 1].value = `****${String.fromCharCode(65 + index)}.   ${answer.text}****`;
  // }
  // Create the field for all options
answerFields.push({
  name: "Choose any of the options below:",
  value: '- ', // Start a code block
  inline: false,
});

// Loop through answers and add them to the code block
answers.forEach((answer, index) => {
  // Append each option to the code block
  answerFields[0].value += `${String.fromCharCode(65 + index)}.  **${answer.text}**\n- `;
});

// Close the code block
answerFields[0].value = answerFields[0].value.substring(0, answerFields[0].value.length - 2);
// });

    await this.editFields();
    this.embed.setDescription(`### ${text}\n\n`);
    this.embed.setImage(this.imageUrl, { format: "png", dynamic: true, size: 1024 })
    this.embed.addFields(...answerFields);

    // Send the question embed
    await this.collectorMessage.edit({ embeds: [this.embed], components: [this.row] });

    // Start the collector
    this.collectorka();
  }

  async collectorka() {
    if (!this.collector) {
      const filter = i => (i.user.id === this.message.author.id) 
      this.collector = await this.collectorMessage.createMessageComponentCollector({filter, idle: 600000 });

      this.collector.on('collect', async (interaction) => {
        console.log('interactionId:', interaction.customId)
        await interaction.deferUpdate();
        if (interaction.customId === 'start') {
          this.askQuestion(firstId);
        } else if (interaction.customId === 'cancel') {
          // Handle cancel logic here
          this.collectorMessage.delete();
        } else if (interaction.customId === 'Accept') {
          this.quest.acceptQuest()
          
        } else if (interaction.customId === 'Decline') {
          this.quest.declineQuest()
        }
        if (interaction.customId != 'cancel') {
        const selectedAnswerId = parseInt(interaction.customId.split('_')[1]);
        const selectedAnswer = this.answers.find((answer) => answer.id === selectedAnswerId);

        if (selectedAnswer) {
          const outcome = selectedAnswer.outcome;

          if (outcome.nextQuestionId) {
            // If the outcome is another question, ask the next question
            const nextQuestion = tutorialData.questions.find((q) => q.id === outcome.nextQuestionId);
            this.askQuestion(nextQuestion);
          } else if (outcome.text) {
            console.log('outcometext:', outcome.text)
            await this.editFields()
            this.embed.setDescription(`### ${outcome.text}\n\n`);
            this.embed.setImage(this.imageUrl, { format: "png", dynamic: true, size: 1024 })
            await this.collectorMessage.edit({ embeds: [this.embed], components: [this.row] });
            // If the outcome is a result, show the final result to the user
           if (outcome.text.startsWith('quest_')) {
             this.questName = outcome.text.replace('quest_', '')
              console.log('questName:', this.questName)
             this.quest = new Quest(this);
             this.quest.showQuestDetails();
           }
            
            
            // this.showResult(channel, outcome);
          }
        }
        }
      });
    }
  }

  async editFields() {
    this.embed = new EmbedBuilder()
      .setTitle(`Talking to ${this.name}`)
      .setDescription(`Have something like {dialogueindex}`)
      .setColor("#0099ff");
  }

  async initiateTutorial() {
    this.embed = new EmbedBuilder()
      .setTitle(`${this.name}`)
      .setDescription(`Do you want to start the tutorial?`)
      .setColor("#0099ff");
    
 this.yesNoButton = new ActionRowBuilder().addComponents(
        // const options = [
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Yes")
            .setCustomId("start"),
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("No")
            .setCustomId("cancel"),
        // ];
          );
            this.row = this.yesNoButton
        console.log('this.row', this.row)
        // this.row = new ActionRowBuilder().addComponents(options);
        // this.embed.addFields({ name: "makeIndex", value: "setDialogues from npcname:", inline: false });

        this.dialogueIndex++;
    this.collectorMessage = await this.message.channel.send({ embeds: [this.embed], components: [this.row] });
    this.collectorka();
  }

  // Function for NPC1's dialogue based on player's level
  async npc1() {
    if (this.player.exp.level < 5) {
      if (this.dialogueIndex === 0) {
        this.embed.setDescription(`## Do You want to talk to ${this.name}?`);
        // this.yesNoButton = new ActionRowBuilder().addComponents(
        // // const options = [
        //   new ButtonBuilder()
        //     .setStyle("Primary")
        //     .setLabel("Yes")
        //     .setCustomId("start"),
        //   new ButtonBuilder()
        //     .setStyle("Primary")
        //     .setLabel("No")
        //     .setCustomId("cancel"),
        // // ];
        //   );
        //     this.row = this.yesNoButton
        // console.log('this.row', this.row)
        // this.row = new ActionRowBuilder().addComponents(options);
        this.embed.addFields({ name: "makeIndex", value: "setDialogues from npcname:", inline: false });

        this.dialogueIndex++;
        return this.row;
      }

      // Handle other dialogue stages and options here

      // Increment dialogueIndex to progress to the next dialogue
    }
  }

  // Function to handle quest initiation
  initiateQuest(player) {
    if (player.level < 5) {
      // Handle low-level quest initiation
    } else if (player.level > 10) {
      // Handle high-level quest initiation
    }
  }

  // Function to handle quest completion
  completeQuest(player) {
    // Handle quest completion logic
  }
}
/*



class Tutorial {
  constructor(player, name, message) {
    this.player = player;
    this.name = name;
    this.message = message;
    this.embed = null;
    this.row = null;
    this.collector = null;
    this.answerFields = null;
    this.selectionMap = {};
    this.text = null;
    this.answers = null;
    this.imageUrl = null;
    this.currentQuestion = 0;
  }

  async initiateTutorial() {
    this.embed = new EmbedBuilder()
      .setTitle(`Tutorial with ${this.name}`)
      .setDescription(`This is a tutorial about ${this.name}.`)
      .setColor("#0099ff");
    this.collectorMessage = await this.message.channel.send({ embeds: [this.embed] });

    this.askQuestion(this.currentQuestion);
  }

  async askQuestion(index) {
    console.log('indexxxx:', index)
    try {
        const { text, answers, imageUrl } = tutorialData;
    const question = tutorialData.questions[index];

    // Create the answer buttons
    const answerButtons = question.answers.map((answer, index) => {
      const label = String.fromCharCode(65 + index); // Convert index to A, B, C, D labels
      const selection = label.toLowerCase();
      this.selectionMap[selection] = answer.outcome.nextQuestionId;
      return new ButtonBuilder()
        .setStyle('Danger')
        .setCustomId(`answer_${index + 1}`)
        .setLabel(label);
    });     

    // Create the row with answer buttons
    this.row = new ActionRowBuilder().addComponents(...answerButtons);

    // Create the answer fields for the embed
    const answerFields = question.answers.map((answer, index) => {
      return {
        name: `Answer ${index + 1}`,
        value: answer.text,
        inline: false,
      };
    });

    // Update the embed with the question and answer fields
    this.embed
      .setDescription(question.text)
      .setImage(question.imageUrl, { format: "png", dynamic: true, size: 1024 })
      .setFields(...answerFields);

    // Edit the message with the updated embed
    await this.collectorMessage.edit({ embeds: [this.embed], components: [this.row] });

    // Start the collector if not already

      if (!this.collector) {
    this.collector = this.collectorMessage.createMessageComponentCollector({ idle: 60000 });

    this.collector.on('collect', async (interaction) => {
      console.log('interactioniD', interaction.customId)
      await interaction.deferUpdate();
      const selectedAnswerId = parseInt(interaction.customId.split('_')[1]);
      const selectedAnswer = question.answers.find((answer) => answer.id === selectedAnswerId);

      if (selectedAnswer) {
        const outcome = selectedAnswer.outcome;
        console.log('OUTCOME:', outcome)

        if (outcome.nextQuestionId) {
          // If the outcome is another question, ask the next question
          this.currentQuestion = outcome.nextQuestionId;
          this.askQuestion(this.currentQuestion);
        } else if (outcome.text) {
          // If the outcome is a result, show the final result to the user
          console.log('Outcome:', outcome);
          this.showResult(outcome);
        }
      }
    });
      }
    }catch(error) {
      console.log('ERRORCAUISSED:', error)
    }
  }

  async showResult(outcome) {
    // Update the embed with the result text
    this.embed.setDescription(outcome.text);

    // Edit the message with the updated embed
    await this.message.edit({ embeds: [this.embed] });
  }
}
*/
module.exports = {Tutorial};
