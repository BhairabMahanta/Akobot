const { EmbedBuilder } = require("discord.js");
const { mongoClient } = require("../../data/mongo/mongo.js");
const Canvas = require("@napi-rs/canvas");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const players = require("../../data/players.json");

module.exports = {
  name: "profile",
  description:
    "Displays the profile image of the player with inputable name, description, age, height, etc., and is an image",
  aliases: ["sw", "me", "status"],
  async execute(client, message, args) {
    console.log("gae");
    try {
      // Check if a player name is provided
      let playerName = args[0];
      console.log("gae2");

      // If no player name provided, show the profile of the message author
      if (!playerName) {
        playerName = message.author.id;
        console.log("yes");
      }

      // Fetch player data from JSON or MongoDB based on your implementation
      const player = await getPlayerData(playerName); // Implement this function

      if (!player) {
        return message.reply("Player not found. Provide valid player id.");
      }
      console.log(`Player data found: ${player}`);
      // Create a canvas to draw the profile
      const canvas = Canvas.createCanvas(650, 500);
      const ctx = canvas.getContext("2d");

      // Background color
      ctx.fillStyle = "#f9ecb6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log("test2");
      // Draw player information
      ctx.fillStyle = "#000000";
      ctx.font = "20px Arial";
      console.log("test2");
      console.log(
        "message.author.displayAvatarURL",
        message.author.displayAvatarURL()
      );
      const URL = message.author.displayAvatarURL();
      const url = URL.replace(".webp", ".png");
      console.log("url:", url);
      // Load an image (replace 'player.imageURL' with your actual image URL property)
      const image = await Canvas.loadImage(url);
      console.log("test3");
      ctx.drawImage(image, 10, 30, 200, 200);
      ctx.fillText(`Name: ${player.name}`, 10, 270, 250);
      ctx.fillText(`Description: {player.description}`, 10, 300);
      ctx.fillText(`Age: {player.age}`, 10, 330);
      ctx.fillText(`Height: {player.height}`, 10, 360);
      console.log("test3");
      // Convert the canvas to a buffer
      const buffer = canvas.toBuffer("image/png");
      console.log("test4");
      // Send the image as an attachment in an embed
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Profile - ${player.name}`)
        .setImage("attachment://profile.png");
      console.log("should have sent");
      message.channel.send({
        embeds: [embed],
        files: [{ name: "profile.png", attachment: buffer }],
      });
    } catch (error) {
      console.error("An error occurred:", error);
      message.reply("An error occurred while processing your request.");
    }
  },
};

// Function to get player data from MongoDB based on player name
async function getPlayerData(playerName) {
  try {
    // Convert the player name to lowercase for case-insensitive search
    // const lowerPlayerName = playerName.toLowerCase();

    // Find the player in the MongoDB collection
    const player = await collection.findOne({ _id: playerName });

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
