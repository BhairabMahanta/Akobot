const classes = {
  Knight: {
    abilities: ["Shield Bash", "Defend"],
    description:
      "A heavily armored warrior skilled in swordsmanship and defense.",
  },
  Berserker: {
    abilities: ["Bloodlust", "Raging Strike"],
    description:
      "A fierce warrior who enters a state of uncontrollable rage, dealing massive damage.",
  },
  Gladiator: {
    abilities: ["Arena Spin", "Crowd Control"],
    description:
      "A master of close-quarters combat, specializing in arena-style duels.",
  },
  Samurai: {
    abilities: ["Precision Strike", "Honor's Resolve"],
    state: "locked",
    description:
      "A disciplined warrior from the Far East, known for their precision strikes and code of honor.",
  },
  Sorcerer: {
    abilities: ["Fireball", "Arcane Shield"],
    state: "locked",
    description:
      "Harnesses the power of arcane magic to cast devastating spells.",
  },
  Mage: {
    abilities: ["Frost Nova", "Thunderstorm"],
    description:
      "Controls the elements of fire, ice, and lightning to unleash destructive forces.",
  },
  Necromancer: {
    abilities: ["Raise Dead", "Drain Life"],
    state: "locked",
    description:
      "Commands the undead and dark magic to drain life from opponents.",
  },
  Illusionist: {
    abilities: ["Mirror Image", "Mind Trick"],
    state: "locked",
    description:
      "Masters the art of illusions and deception, confusing enemies in battle.",
  },
  Assassin: {
    abilities: ["Backstab", "Shadow Step"],
    description:
      "A deadly stealthy killer, striking from the shadows with precision and speed.",
  },
  Rogue: {
    abilities: ["Dual Wield", "Evasion"],
    state: "locked",
    description:
      "A nimble and agile fighter, specializing in quick strikes and evasive maneuvers.",
  },
  Ninja: {
    abilities: ["Smoke Bomb", "Shuriken Barrage"],
    state: "locked",
    description:
      "An expert in sabotage and espionage, utilizing ninja weapons and techniques.",
  },
  Swashbuckler: {
    abilities: ["Charming Presence", "Acrobatic Flourish"],
    state: "locked",
    description:
      "A charismatic duelist, combining swordplay with acrobatics and charm.",
  },
  Cleric: {
    abilities: ["Healing Light", "Divine Protection"],
    description:
      " A holy warrior who can heal wounds and protect allies using divine magic.",
  },
};

module.exports = classes;
