const { mongoClient } = require("../../data/mongo/mongo.js");
const mongoose = require("mongoose");
const { playerModel } = require("../../data/mongo/playerschema.js"); // Adjust the path to match your schema file location
const { Tutorial } = require("./tutorial.js");
// Specify the collection name (you can use the 'collection' property of the schema)
const collectionName = "akaillection";
const story = require("./story.json"); // Load the story from the JSON file
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const players = require("../../data/players.json");
const locations = require("../../data/locations");
const { cards } = require("../adv/information/cards.js");
let startedTutorial = [537619455409127442];
let deniedTutorial = [];
let collectionCounter = 0; // Initialize the collection counter
module.exports = {
  name: "register",
  aliases: ["reg", "r"],
  description: "Lets begin",

  async execute(client, message, args) {
    const { db } = client;
    let akaillection = "akaillection";

    let Player = await playerModel(db, akaillection);

    /* const count = await Player.countDocuments();
  if (count >= 20) {
      // Increment the collection counter
      collectionCounter++;
    }
  

    // Update the collection name
    if (collectionCounter > 0) {
      akaillection = `akaillection${collectionCounter}`;
    } else {
      akaillection = "akaillection";
    }*/
    Player = await playerModel(db, akaillection);

    if (!startedTutorial.includes(message.author.id)) {
      if (!args[0] || args[0].length > 20 || args[0].length < 3) {
        // Check character name validity
        const registerErrorEmbed = new EmbedBuilder()
          .setColor(0x992e22)
          .setDescription(
            "Provide a valid character name. (The name should be 3 < length < 20 characters)"
          );
        return message.channel.send({ embeds: [registerErrorEmbed] });
      }
    }
    const characterName = args[0];
    // Check if the character name already exists
    const existingCharacter = Object.values(players).find(
      (player) => player.name.toLowerCase() === characterName.toLowerCase()
    );
    console.log("startd:", startedTutorial);
    if (existingCharacter && !startedTutorial.includes(message.author.id)) {
      const existingNameErrorEmbed = new EmbedBuilder()
        .setColor(0x992e22)
        .setDescription(
          "A character with the same name already exists. Inform them?"
        )
        .setFields(
          { name: "🇦", value: "You'll regret taking my name.", inline: false },
          { name: "🇧", value: "you're kinda fucked", inline: false },
          { name: "🇨", value: "It's fine I guess", inline: false },
          { name: "🇩", value: "Oh the name is all yours", inline: false }
        );
      return message.channel.send({ embeds: [existingNameErrorEmbed] });
    }
    // Check if the user exists in the database
    const userExists = await Player.exists({ _id: message.author.id });

    // If the user exists, send a message
    if (userExists) {
      //   const tutorial = new Tutorial(players, 'My Tutorial', message);
      // tutorial.initiateTutorial();
      // return message.channel.send('chillax, you dont needa register more than once (using database)');
      console.log("Fix later");
    }
    // if (players[message.author.id]) {
    //   return message.channel.send('chillax, you dont needa register more than once');
    // }

    function getRandomCard() {
      const cardNames = Object.keys(cards);
      console.log("cardnames:", cardNames);
      const randomCardName =
        cardNames[Math.floor(Math.random() * cardNames.length)];
      const randomCard = cards[randomCardName];
      console.log("name:", randomCardName, "card:", randomCard);
      return { name: randomCardName, card: randomCard };
    }

    const randomCardData = getRandomCard();
    // Initialize the player's data with the character name
    const playerId = message.author.id;
    // Send the initial question to the user
    const firstQuestion = story.questions.find((q) => q.id === 1);

    const playerData2 = new Player({
      _id: playerId,
      name: characterName,
      location: locations[0],
      inventory: { active: [], backpack: [] },
      stats: {
        attack: 1,
        tactics: 0,
        magic: 1,
        training: 0,
        defense: 1,
        speed: 1,
        hitpoints: 20,
        intelligence: 1,
        wise: 1,
        luck: 1,
        devotion: 0,
        potential: 1,
      },
      balance: { coins: 0, gems: 0 },
      exp: { xp: 0, level: 0 },
      cards: { name: [randomCardData.name] },
      class: null,
      race: null,
      stuff: {
        generatedRandomElements: false,
        generatedRandomElements2: false,
      },
      playerpos: { x: 100, y: 50 },
    });

    // Save the player data to the database
    try {
      // If the user exists, send a message
      if (!userExists) {
        await playerData2.save();
        console.log("saved player data");
      }
    } catch (error) {
      console.error("Error saving player data:", error);
    }
    const wantTutorial = new EmbedBuilder()
      .setColor("DarkBlue")
      .setDescription(
        "Do you wish to proceed with a small tutorial? It is honestly quite unique af, just trust me."
      )
      .setFields(
        { name: "🇦", value: "Sus, but Sure!.", inline: false },
        { name: "🇧", value: "Eh? Okay.", inline: false },
        {
          name: "🇨",
          value: "You seem.... Stinky, I refuse to.",
          inline: false,
        }
      );

    const tutSelectA = new ButtonBuilder() // Add a new button for selecting
      .setCustomId("select_buttonA")
      .setLabel("🇦")
      .setStyle("Success");
    const tutSelectB = new ButtonBuilder() // Add a new button for selecting
      .setCustomId("select_buttonB")
      .setLabel("🇧")
      .setStyle("Success");
    const tutSelectC = new ButtonBuilder() // Add a new button for selecting
      .setCustomId("select_buttonC")
      .setLabel("🇨")
      .setStyle("Primary");
    const tutRow = new ActionRowBuilder().addComponents(
      tutSelectA,
      tutSelectB,
      tutSelectC // Add the new "Select" button
    );
    const sentMessage = await message.channel.send({
      embeds: [wantTutorial],
      components: [tutRow],
    });
    const filter = (i) =>
      (i.customId.startsWith("select_button") ||
        i.customId === "select_button") &&
      i.user.id === message.author.id;
    const collector = sentMessage.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      try {
        i.deferUpdate();
        if (
          i.customId === "select_buttonB" ||
          i.customId === "select_buttonA"
        ) {
          console.log("heclicked:", i.user.id);
          console.log("id:", i.customId);
          startedTutorial.push(i.user.id);
          // console.log('First question:', firstQuestion);
          const tutorial = new Tutorial(playerData2, "My Tutorial", message);
          sentMessage.delete();
          tutorial.initiateTutorial();
        } else {
          deniedTutorial.push(i.user.id);
          const noTutorial = new EmbedBuilder()
            .setColor(0x992e22)
            .setDescription("Damn, thats kinda sad but ok.")
            .setFields(
              { name: "🇦", value: "Thanks!.", inline: false },
              { name: "🇧", value: "Yeah whatever.", inline: false },
              {
                name: "🇨",
                value: "Don't respond with anything.",
                inline: false,
              },
              {
                name: "🇩",
                value: "Now get out im losing patience.",
                inline: false,
              }
            );
          sentMessage.edit({ embeds: [noTutorial] });
        }
      } catch (error) {
        console.error("An error occurred:", error);
        message.channel.send("noob ass, caused an error.");
      }
    });
  },
};
