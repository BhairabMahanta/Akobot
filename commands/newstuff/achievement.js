const { achievementModel } = require("../../data/mongo/achievementSchema.js");

class Achievement {
  constructor(name, description, reward) {
    this.name = name;
    this.description = description;
    this.reward = reward;
  }

  async achieve(client, collectionName, userId) {
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
      achievedBy: userId,
    });

    await achievementData.save();
    console.log("Saved achievement data");
  }
}

module.exports = { Achievement };
