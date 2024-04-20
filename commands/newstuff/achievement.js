const { achievementModel } = require("../../data/mongo/achieveschema.js");
const { playerModel } = require("../../data/mongo/mailschema.js");
class Achievement {
  constructor(name, description, reward) {
    this.name = name;
    this.description = description;
    this.reward = reward;
  }

  async hiddenAchieve(client, collectionName, userId) {
    const { db } = client;
    const AchievementModel = await achievementModel(db, collectionName);
    let existingHiddenAchievements = await AchievementModel.find({
      _id: /^hidden_achievement/,
    });
    if (!existingHiddenAchievements) {
      existingHiddenAchievements = 0;
    }
    const achievementData = new AchievementModel({
      _id: "hidden_achievement" + existingHiddenAchievements.length,
      name: this.name,
      description: this.description,
      reward: this.reward,
      firstAchieved: userId,
      achievedBy: 1,
    });

    await achievementData.save();
    console.log("Saved achievement data");
  }

  async normalAchieve(client, collectionName, userId) {
    const { db } = client;
    const AchievementModel = await achievementModel(db, collectionName);

    // Find all normal achievements
    const existingNormalAchievements = await AchievementModel.find({
      _id: /^normal_achievement/,
    });

    // Calculate the count of existing normal achievements
    const normalAchievementCount = existingNormalAchievements.length;

    // Create a new achievement document
    const achievementData = new AchievementModel({
      _id: "normal_achievement" + normalAchievementCount,
      name: this.name,
      description: this.description,
      reward: this.reward,
      achievedBy: userId,
    });

    // Save the new achievement document
    await achievementData.save();
    console.log("Saved normal achievement data");
  }

  async achieve(client, collectionName, achievementId, userId) {
    const { db } = client;
    const AchievementModel = await achievementModel(db, collectionName);

    try {
      // Find the achievement by ID
      const existingAchievement = await AchievementModel.findById(
        achievementId
      );

      // If the achievement doesn't exist, return
      if (!existingAchievement) {
        console.log("Achievement not found.");
        return;
      }

      // Increment the count of the achievement
      existingAchievement.achievedBy += 1;

      // Save the updated achievement document
      await existingAchievement.save();
      console.log("Updated achievement count and rewarded player.");

      const collections = await db.listCollections().toArray();

      // Iterate over each collection in the database
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;

        // Check if the collection name starts with "akaillection"
        if (collectionName.startsWith("akaillection")) {
          const PlayerModel = await playerModel(db, collectionName);

          // Find all player documents in the collection
          const player = await PlayerModel.find({ _id: userId });
          // Update player's rewards
          player.coins += existingAchievement.coins;
          player.gems += existingAchievement.gems;
          player.xp += existingAchievement.xp;

          // Save the updated player document
          await player.save();
        }
      }
      console.log("Rewards updated for all players.");
    } catch (error) {
      console.error("Error updating achievement:", error);
    }
  }
}

module.exports = { Achievement };
