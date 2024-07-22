const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { mongoClient } = require("../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const tutorialData = require("./story.json");
const Quest = require("../adv/quest/quest.js");
const firstId = tutorialData.questions.find((d) => d.id === "1");

const backButton = new ButtonBuilder()
  .setCustomId("back")
  .setLabel("Back")
  .setStyle("Primary");
const backRow = new ActionRowBuilder().addComponents(backButton);
class Tutorial {
  constructor(player, name, message) {
    this.player = player;
    this.playerId = message.author.id;
    console.log("playerID:", this.playerId);
    this.name = name;
    console.log("name:", this.name);
    this.affection = 0;
    this.dialogueIndex = 0;
    this.embed = null;
    this.row = null;
    this.message = message;
    this.collectorMessage = null;
    this.collector = null;
    this.answerFields = null;
    this.selectionMap = {};
    this.text = null;
    this.questName = null;
    this.quest = null;
    this.answers = null;
    this.imageUrl = null;
    this.yesNoButton = null;
    this.savedAnswers = null;
  }

  async askQuestion(dialogue) {
    const { text, answers, imageUrl } = dialogue;
    this.text = text;
    this.answers = answers;
    this.imageUrl = imageUrl;

    // Create the answer buttons
    if (answers) {
      const answerButtons = answers.map((answer, index) => {
        const label = String.fromCharCode(65 + index); // Convert index to A, B, C, D labels
        const selection = label.toLowerCase();
        this.selectionMap[selection] = answer.outcome.nextQuestionId;
        return new ButtonBuilder()
          .setStyle("Primary")
          .setCustomId(`answer_${index + 1}`)
          .setLabel(label);
      });

      // Create the row with answer buttons
      this.row = new ActionRowBuilder().addComponents(...answerButtons);
    }
    const answerFields = [];

    // Create the field for all options
    answerFields.push({
      name: "Choose any of the options below:",
      value: "- ", // Start a code block
      inline: false,
    });
    if (answers) {
      // Loop through answers and add them to the code block
      answers.forEach((answer, index) => {
        // Append each option to the code block
        answerFields[0].value += `${String.fromCharCode(65 + index)}.  **${
          answer.text
        }**\n- `;
      });

      // Close the code block
      answerFields[0].value = answerFields[0].value.substring(
        0,
        answerFields[0].value.length - 2
      );
      // });
    }

    await this.editFields();
    this.embed.setDescription(`### ${text}\n\n`);
    this.embed.setImage(this.imageUrl, {
      format: "png",
      dynamic: true,
      size: 1024,
    });
    this.embed.addFields(...answerFields);

    // Send the question embed
    await this.collectorMessage.edit({
      embeds: [this.embed],
      components: [this.row],
    });

    // Start the collector
    this.collectorka();
  }

  async collectorka() {
    if (!this.collector) {
      const filter = (i) => i.user.id === this.message.author.id;
      this.collector =
        await this.collectorMessage.createMessageComponentCollector({
          filter,
          idle: 600000,
        });

      this.collector.on("collect", async (interaction) => {
        console.log("interactionId:", interaction.customId);
        await interaction.deferUpdate();
        if (interaction.customId === "start") {
          console.log("start");
          const filter = { _id: this.playerId };
          const playerData = await collection.findOne(filter);

          console.log("playerData:", playerData);
          if (!playerData.outcomeId || playerData.outcomeId === "Beginner") {
            console.log("firstId:", firstId);
            this.askQuestion(firstId);
          } else if (playerData.outcomeId) {
            console.log("notbEGINNER");
            const nextQuestion = tutorialData.outcomes.find(
              (q) => q.id === playerData.outcomeId
            );
            this.askQuestion(nextQuestion);
          }
        } else if (interaction.customId === "cancel") {
          // Handle cancel logic here
          this.collectorMessage.delete();
        } else if (interaction.customId === "Accept") {
          this.quest.acceptQuest();
        } else if (interaction.customId === "Decline") {
          this.quest.declineQuest();
        } else if (interaction.customId === "back") {
          this.askQuestion(
            tutorialData.questions.find((q) => q.id === this.savedAnswers.id)
          );
        }
        if (interaction.customId != "cancel") {
          const selectedAnswerId = parseInt(interaction.customId.split("_")[1]);
          console.log("selectedAnswerId:", selectedAnswerId);
          const selectedAnswer = this.answers.find(
            (answer) => answer.id === selectedAnswerId.toString()
          );
          this.savedAnswers = selectedAnswer;
          console.log("selectedAnswer:", selectedAnswer);

          if (selectedAnswer) {
            const outcome = selectedAnswer.outcome;
            console.log("OUTCOME:", outcome);
            if (outcome.activation && outcome.text) {
              const activationButton = new ButtonBuilder()
                .setCustomId(outcome.activation)
                .setLabel("Do it")
                .setStyle("Primary");
              const activationButtonRow = new ActionRowBuilder().addComponents(
                activationButton,
                backButton
              );
              console.log("outcometext:", outcome.text);
              const filter = { _id: this.playerId };
              const newEmbed = new EmbedBuilder()
                .setTitle(`${outcome.activation}`)
                .setDescription(`### ${outcome.text}\n\n`)
                .setFooter({
                  text: "You can use a!tutorial again to start where you left (any checkpoints) off anytime or continue",
                })
                .setImage(this.imageUrl, {
                  format: "png",
                  dynamic: true,
                  size: 1024,
                });
              const newMessage = await this.message.channel.send({
                embeds: [newEmbed],
                components: [activationButtonRow],
              });
              await newMessage.delete({ timeout: 15000 });
              const playerData = await collection.findOne(filter);
              playerData.outcomeId = outcome.idS;
              const updates = {
                $set: { outcomeId: outcome.idS.toString() },
              };
              console.log("vrooom");
              await collection.updateOne(filter, updates);
            }
            if (outcome.id && outcome.nextQuestionId) {
              const nextQuestion = tutorialData.outcomes.find(
                (q) => q.id === outcome.id.toString()
              );
              console.log("gae", nextQuestion);
              this.askQuestion(nextQuestion);
            } else if (outcome.nextQuestionId) {
              // If the outcome is another question, ask the next question
              const nextQuestion = tutorialData.questions.find(
                (q) => q.id === outcome.nextQuestionId.toString()
              );
              this.askQuestion(nextQuestion);
            } else if (outcome.id) {
              const nextQuestion = tutorialData.outcomes.find(
                (q) => q.id === outcome.id.toString()
              );
              this.askQuestion(nextQuestion);
            }
            if (outcome.text && !outcome.activation) {
              console.log("outcometext:", outcome.text);
              const filter = { _id: this.playerId };
              await this.editFields();
              this.embed.setDescription(`### ${outcome.text}\n\n`);
              this.embed.setImage(this.imageUrl, {
                format: "png",
                dynamic: true,
                size: 1024,
              });
              await this.collectorMessage.edit({
                embeds: [this.embed],
                components: [backRow],
              });
              const playerData = await collection.findOne(filter);
              playerData.outcomeId = outcome.id;
              const updates = {
                $set: { outcomeId: outcome.id.toString() },
              };
              await collection.updateOne(filter, updates);
              // If the outcome is a result, show the final result to the user
              if (outcome.text.startsWith("quest_")) {
                this.questName = outcome.text.replace("quest_", "");
                console.log("questName:", this.questName);
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
      .setTitle(`Proceeding with ${this.name}`)
      .setDescription("Have something like {dialogueindex}")
      .setColor("#0099ff");
  }

  async initiateTutorial(stuff) {
    if (!stuff) {
      this.embed = new EmbedBuilder()
        .setTitle(`${this.name}`)
        .setDescription("Do you want to start the tutorial?")
        .setColor("#0099ff");
    } else {
      this.embed = new EmbedBuilder()
        .setTitle(`${this.name}`)
        .setDescription(
          "Do you want to resume the tutorial where you left off?"
        )
        .setColor("#0099ff");
    }
    this.yesNoButton = new ActionRowBuilder().addComponents(
      // const options = [
      new ButtonBuilder()
        .setStyle("Primary")
        .setLabel("Yes")
        .setCustomId("start"),
      new ButtonBuilder()
        .setStyle("Primary")
        .setLabel("No")
        .setCustomId("cancel")
      // ];
    );
    this.row = this.yesNoButton;
    console.log("this.row", this.row);
    // this.row = new ActionRowBuilder().addComponents(options);
    // this.embed.addFields({ name: "makeIndex", value: "setDialogues from npcname:", inline: false });

    this.dialogueIndex++;
    this.collectorMessage = await this.message.channel.send({
      embeds: [this.embed],
      components: [this.row],
    });
    this.collectorka();
  }

  // Function for NPC1's dialogue based on player's level
  async npc1() {
    if (this.player.exp.level < 5) {
      if (this.dialogueIndex === 0) {
        this.embed.setDescription(`## Do You want to talk to ${this.name}?`);

        // this.embed.addFields({ name: "makeIndex", value: "setDialogues from npcname:", inline: false });

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
/*answers.forEach((answer, index) => {
  if (index % 2 === 0) {
    answerFields.push({
      name: `${String.fromCharCode(65 + index)}. ${answer.text}`, // Combine index and answer text
      value: '', // Empty value for alternating
      inline: false,
    });
  }
  else {
    // Use the previous entry's value for the current entry
    answerFields[answerFields.length - 1].value = `****${String.fromCharCode(65 + index)}.   ${answer.text}****`;
  }*/
module.exports = { Tutorial };
