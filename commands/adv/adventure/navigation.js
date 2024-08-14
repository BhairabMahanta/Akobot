const { ActionRowBuilder, ButtonBuilder } = require("discord.js"); // Replace with your actual library
const { EmbedBuilder } = require("discord.js");
const {
  Location,
  Floor,
  floor1,
  floor2,
  allFloors,
} = require("../information/loc.js");
const { GameImage, Player, cycleCooldowns } = require("./sumfunctions.js");
const players = require("../../../data/players.json");
const { Battle, BossMonster, Environment } = require("../action/battle2.js");
const { mongoClient } = require("../../../data/mongo/mongo.js");
const { NPC } = require("../quest/npc.js");
const { set } = require("mongoose");
let updatedImageBuffer = null;
let hasAttackButton = false;
let hasTalkButton = false;
let dontGoThrough = false;

// Create a button-based navigation interface
const navigationRowUp = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("Empty")
    .setLabel("☠️ ded")
    .setStyle("Secondary")
    .setDisabled(true),
  new ButtonBuilder()
    .setCustomId("north")
    .setLabel("↑ North")
    .setStyle("Danger"),
  new ButtonBuilder()
    .setCustomId("Empty2")
    .setLabel("☠️ ded")
    .setStyle("Secondary")
    .setDisabled(true)
);
const navigationRowMid = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("west")
    .setLabel("←←West")
    .setStyle("Success"),
  new ButtonBuilder()
    .setCustomId("south")
    .setLabel("↓ South")
    .setStyle("Danger"),
  new ButtonBuilder().setCustomId("east").setLabel("→→East").setStyle("Success")
);
const navigationRowTalk = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("talk_npc")
    .setLabel("💬 Talk")
    .setStyle("Primary"),
  new ButtonBuilder()
    .setCustomId("north")
    .setLabel("↑ North")
    .setStyle("Danger"),
  new ButtonBuilder()
    .setCustomId("Empty2")
    .setLabel("☠️ ded")
    .setStyle("Secondary")
    .setDisabled(true)
);
const navigationRowAttack = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("Empty")
    .setLabel("☠️ ded")
    .setStyle("Secondary")
    .setDisabled(true),
  new ButtonBuilder()
    .setCustomId("north")
    .setLabel("↑ North")
    .setStyle("Danger"),
  new ButtonBuilder()
    .setCustomId("attack_monster")
    .setLabel("⚔️ Attack")
    .setStyle("Primary")
);
const navigationRowInteract = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("Empty")
    .setLabel("☠️ ded")
    .setStyle("Secondary")
    .setDisabled(true),
  new ButtonBuilder()
    .setCustomId("north")
    .setLabel("↑ North")
    .setStyle("Danger"),
  new ButtonBuilder()
    .setCustomId("interact_collect")
    .setLabel("Grab!")
    .setStyle("Primary")
);
const interactRow = [navigationRowInteract, navigationRowMid];
const navigationRow = [navigationRowUp, navigationRowMid];
const talktRow = [navigationRowTalk, navigationRowMid];
const attackRow = [navigationRowAttack, navigationRowMid];
const bothButton = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("talk_npc")
    .setLabel(" 🗣️ Talk")
    .setStyle("Primary"),
  new ButtonBuilder()
    .setCustomId("attack_monster")
    .setLabel("⚔️ Attack")
    .setStyle("Primary")
);
const nowBattling = new EmbedBuilder()
  .setTitle("Adventuring")
  .setImage("attachment://area2.png")
  .setDescription("Use the navigation buttons to move around the area!");

async function handleNavigation(
  allFloors,
  message,
  adventureEmbed,
  initialMessage,
  areaImage,
  player
) {
  const db = mongoClient.db("Akaimnky");
  const collection = db.collection("akaillection");
  // Define the filter based on the _id
  const dbFilter = { _id: message.user.id };
  const playerData2 = await collection.findOne(dbFilter);

  // Simulate player data (replace with your actual data)

  const playerFloorIndex = 0; // Replace with the actual floor index for the player
  const playerLocationIndex = 0; // Replace with the actual location index for the player

  const selectedFloor = allFloors[playerFloorIndex];
  const selectedLocation = selectedFloor.locations[playerLocationIndex];

  // Create instances of the classes
  const gameImage = new GameImage(600, 600, player, message);
  const newNpc = new NPC(playerData2, "npc1", message);
  const playerpos = gameImage.playerpos;

  // Call methods on the instances
  // await gameImage.generateAreaElements("Forest Clearing");
  // await gameImage.generateRandomElements(0.55, 0.5, 10);
  await gameImage.generateTutorialEntities();

  // Generate the updated image with the player's position
  updatedImageBuffer = await gameImage.generateUpdatedImage(
    areaImage,
    playerpos
  );
  nowBattling.setImage(`attachment://updatedMap.png`);
  // Now you can use initialMessage to edit it or perform other actions

  // Collect button interactions
  const filter = (i) =>
    i.user.id === message.user.id &&
    (["attack_monster", "cancel_adventure"].includes(i.customId) ||
      i.customId.startsWith("action_") ||
      i.customId === "option_select" ||
      i.customId === "go_in" ||
      i.customId === "talk_npc" ||
      i.customId.match(/^(north|south|west|east)$/i));

  // const filter = i => (['attack_monster', 'cancel_adventure'].includes(i.customId)) && i.user.id === message.author.id || (i.customId === 'option_select') || (i.customId === 'go_in') || i.customId.match(/^(north|south|west|east)$/i);
  const collector = initialMessage.createMessageComponentCollector({
    filter,
    time: 600000,
  });
  console.log("click1test1 :", playerpos);
  // initialMessage.edit({ files: [updatedImageBuffer] });
  const hahaTrueOrFalse = await gameImage.nearElement(
    hasAttackButton,
    message,
    initialMessage,
    navigationRow,
    attackRow,
    talktRow,
    bothButton,
    hasTalkButton,
    nowBattling,
    interactRow,
    updatedImageBuffer
  );
  if (!hahaTrueOrFalse) {
    try {
      initialMessage.edit({
        // content: `You are at: ${selectedLocation.name}\nDescription: ${selectedLocation.description}`,
        embeds: [nowBattling],
        components: [...navigationRow],
        files: [updatedImageBuffer],
      });
    } catch (error) {
      console.error("error hoogaya:", error);
    }
  }

  console.log("click1test2 :", playerpos);

  // Handle button interactions
  collector.on("collect", async (i) => {
    await i.deferUpdate();
    hasAttackButton = initialMessage.components.some((component) =>
      component.components.some(
        (subComponent) => subComponent.customId === "attack_monster"
      )
    );
    hasTalkButton = initialMessage.components.some((component) =>
      component.components.some(
        (subComponent) => subComponent.customId === "talk_npc"
      )
    );

    if (i.customId === "north" && i.user.id === message.user.id) {
      playerpos.y -= 50;

      console.log("click1test :", playerpos);
      updatedImageBuffer = await gameImage.movePlayer(player);
      console.log("i should work:");

      initialMessage.edit({ files: [updatedImageBuffer] });
      // ...
    } else if (i.customId === "east" && i.user.id === message.user.id) {
      console.log("click1test :  button");
      playerpos.x += 50;

      console.log("click1test :", playerpos);
      updatedImageBuffer = await gameImage.movePlayer(player);

      initialMessage.edit({ files: [updatedImageBuffer] });
      // ...
    } else if (i.customId === "west" && i.user.id === message.user.id) {
      console.log("click1test :  button");
      playerpos.x -= 50;

      console.log("click1test :", playerpos);
      updatedImageBuffer = await gameImage.movePlayer(player);

      initialMessage.edit({ files: [updatedImageBuffer] });

      // ...
    } else if (i.customId === "south" && i.user.id === message.user.id) {
      console.log("click1test :  button");
      playerpos.y += 50;

      console.log("click1test :", playerpos);
      updatedImageBuffer = await gameImage.movePlayer(player);

      initialMessage.edit({ files: [updatedImageBuffer] });

      // ...
    } else if (
      i.customId === "attack_monster" &&
      i.user.id === message.user.id
    ) {
      dontGoThrough = true;
      initialMessage.edit({ components: [] });
      const thatArray = gameImage.elementArray[0];
      setTimeout(async () => {
        const battle = new Battle(playerData2, thatArray, message);
        console.log("worked Here beta");
        await battle.startEmbed();
      }, 1000);
      setTimeout(async () => {
        initialMessage.delete();
      }, 1000);
    } else if (i.customId === "talk_npc" && i.user.id === message.user.id) {
      // Handle the attack logic here
      // message.channel.send('You are talking with \`\`NpcName\`\`!');
      newNpc.initiateTalk();
      initialMessage.edit({ components: [] });
    }
    console.log("click1test3 :", playerpos);
    const phals = false;

    if (dontGoThrough === false) {
      console.log("click1test4 :", playerpos);
      gameImage.nearElement(
        hasAttackButton,
        message,
        initialMessage,
        navigationRow,
        attackRow,
        talktRow,
        bothButton,
        hasTalkButton,
        nowBattling,
        interactRow,
        phals
      );
    }
  });

  // // Handle collector end
  // if (!dontGoThrough) {
  //   collector.on("end", (collected) => {
  //     initialMessage.edit({
  //       content: "Button interaction ended.",
  //       components: [],
  //     });
  //   });
  // }
}

module.exports = {
  navigationRow,
  handleNavigation,
};
