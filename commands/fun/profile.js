const { EmbedBuilder } = require("discord.js");
const { mongoClient } = require("../../data/mongo/mongo.js");
const Canvas = require("@napi-rs/canvas");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const players = require("../../data/players.json");

module.exports = {
  name: "profile",
  description: "Displays the profile of a player.",
  aliases: ["sw", "me", "status"],
  async execute(client, message, args) {
    console.log("Executing profile command...");

    try {
      // Check if a player name is provided
      let playerId = args[0] || message.author.id;

      // Fetch player data from MongoDB
      const player = await getPlayerData(playerId);

      if (!player) {
        return message.reply("Player not found. Provide a valid player ID.");
      }

      console.log(`Player data found: ${player}`);

      // Create a canvas to draw the profile
      const canvas = Canvas.createCanvas(1050, 700);
      const ctx = canvas.getContext("2d");

      // Background color
      ctx.fillStyle = "#f9ecb6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw the rounded user avatar
      const avatar = await Canvas.loadImage(
        message.author.displayAvatarURL({ format: "jpg" })
      );

      // Draw player information
      ctx.fillStyle = "#000000";
      ctx.font = "50px Arial";
      ctx.beginPath();
      ctx.fillText(`${player.name}`, 400, 65);
      ctx.fillStyle = "#000000";
      ctx.font = "24px Arial";
      ctx.fillText(`${player.race}:`, 45, 240);
      ctx.fillText(`${player.class}:`, 45, 270);
      ctx.font = "30px Arial";
      ctx.fillText("Player Stats:", 45, 310);
      ctx.fillText("Player Description:", 355, 310);
      ctx.fillText("Player Affiliations:", 745, 310);
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(110, 130, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 30, 50, 160, 160);

      // Convert the canvas to a buffer
      const buffer = canvas.toBuffer("image/png");

      // Send the image as an attachment in an embed
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Profile - ${player.name}`)
        .setImage("attachment://profile.png");

      message.channel.send({
        files: [{ name: "profile.png", attachment: buffer }],
      });
    } catch (error) {
      console.error("An error occurred:", error);
      message.reply("An error occurred while processing your request.");
    }
  },
};

// Function to get player data from MongoDB based on player ID
async function getPlayerData(playerId) {
  try {
    // Find the player in the MongoDB collection
    const player = await collection.findOne({ _id: playerId });

    // If player is not found, return null
    if (!player) {
      return null;
    }

    return player;
  } catch (error) {
    console.error("Error fetching player data from MongoDB:", error);
    return null;
  }
}
