const allFamiliars = {
  Tier1: {
    "Fire Blob": {
      id: 1,
      sl: 1,
      name: "Fire Blob",
      element: "Fire",
      tier: 1,
      stats: {
        attack: 80,
        defense: 60,
        speed: 98,
        hp: 100,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 1,
          name: "Flame Strike",
          power: 150,
          cooldown: 3,
          level: 1,
        },
        {
          id: 2,
          name: "Dragon Claw",
          power: 190,
          cooldown: 2,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Water Nymph": {
      id: 2,
      sl: 2,
      name: "Water Nymph",
      element: "Water",
      tier: 1,
      stats: {
        attack: 65,
        defense: 70,
        speed: 99,
        hp: 90,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 3,
          name: "Aqua Blast",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        {
          id: 4,
          name: "Healing Wave",
          power: -25,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },

    "Earth Golem": {
      id: 3,
      sl: 3,
      name: "Earth Golem",
      element: "Earth",
      tier: 1,
      stats: {
        attack: 75,
        defense: 85,
        speed: 70,
        hp: 120,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 5,
          name: "Rock Throw",
          power: 20,
          cooldown: 3,
          level: 1,
        },
        {
          id: 6,
          name: "Quake",
          power: 30,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Air Sylph": {
      id: 4,
      sl: 4,
      name: "Air Sylph",
      element: "Air",
      tier: 1,
      stats: {
        attack: 70,
        defense: 55,
        speed: 110,
        hp: 80,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 7,
          name: "Gust",
          power: 15,
          cooldown: 2,
          level: 1,
        },
        {
          id: 8,
          name: "Aerial Slash",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Thunder Imp": {
      id: 5,
      sl: 5,
      name: "Thunder Imp",
      element: "Electric",
      tier: 1,
      stats: {
        attack: 75,
        defense: 60,
        speed: 90,
        hp: 85,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 9,
          name: "Thunderbolt",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        {
          id: 10,
          name: "Static Shock",
          power: 20,
          cooldown: 2,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Shadow Panther": {
      id: 6,
      sl: 6,
      name: "Shadow Panther",
      element: "Dark",
      tier: 1,
      stats: {
        attack: 85,
        defense: 50,
        speed: 105,
        hp: 95,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 11,
          name: "Shadow Strike",
          power: 20,
          cooldown: 3,
          level: 1,
        },
        {
          id: 12,
          name: "Dark Claw",
          power: 25,
          cooldown: 2,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Leaf Sprite": {
      id: 7,
      sl: 7,
      name: "Leaf Sprite",
      element: "Nature",
      tier: 1,
      stats: {
        attack: 60,
        defense: 65,
        speed: 95,
        hp: 80,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 13,
          name: "Vine Whip",
          power: 20,
          cooldown: 3,
          level: 1,
        },
        {
          id: 14,
          name: "Leaf Shield",
          power: 0,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Frost Wyvern": {
      id: 8,
      sl: 8,
      name: "Frost Wyvern",
      element: "Ice",
      tier: 1,
      stats: {
        attack: 90,
        defense: 70,
        speed: 80,
        hp: 110,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 15,
          name: "Ice Breath",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        {
          id: 16,
          name: "Frost Nova",
          power: 30,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Magma Salamander": {
      id: 9,
      sl: 9,
      name: "Magma Salamander",
      element: "Fire",
      tier: 1,
      stats: {
        attack: 85,
        defense: 75,
        speed: 85,
        hp: 105,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 17,
          name: "Lava Spit",
          power: 20,
          cooldown: 3,
          level: 1,
        },
        {
          id: 18,
          name: "Scorching Tail",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Goblin Archer": {
      id: 10,
      sl: 10,
      name: "Goblin Archer",
      element: "Neutral",
      tier: 1,
      stats: {
        attack: 70,
        defense: 45,
        speed: 100,
        hp: 75,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 19,
          name: "Arrow Shot",
          power: 20,
          cooldown: 2,
          level: 1,
        },
        {
          id: 20,
          name: "Precision Strike",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    Rockling: {
      id: 11,
      sl: 11,
      name: "Rockling",
      element: "Earth",
      tier: 1,
      stats: {
        attack: 70,
        defense: 75,
        speed: 85,
        hp: 95,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 21,
          name: "Rock Toss",
          power: 15,
          cooldown: 2,
          level: 1,
        },
        {
          id: 22,
          name: "Earthquake",
          power: 30,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Gale Hawk": {
      id: 12,
      sl: 12,
      name: "Gale Hawk",
      element: "Air",
      tier: 1,
      stats: {
        attack: 75,
        defense: 55,
        speed: 105,
        hp: 85,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 23,
          name: "Wind Slash",
          power: 20,
          cooldown: 3,
          level: 1,
        },
        {
          id: 24,
          name: "Aero Burst",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Icicle Sprite": {
      id: 13,
      sl: 13,
      name: "Icicle Sprite",
      element: "Ice",
      tier: 1,
      stats: {
        attack: 60,
        defense: 65,
        speed: 95,
        hp: 80,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 25,
          name: "Frost Bite",
          power: 20,
          cooldown: 3,
          level: 1,
        },
        {
          id: 26,
          name: "Ice Shard",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Flame Sprite": {
      id: 14,
      sl: 14,
      name: "Flame Sprite",
      element: "Fire",
      tier: 1,
      stats: {
        attack: 65,
        defense: 60,
        speed: 100,
        hp: 85,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 27,
          name: "Ember",
          power: 20,
          cooldown: 3,
          level: 1,
        },
        {
          id: 28,
          name: "Inferno",
          power: 25,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Fire Dragon": {
      id: 14.1,
      sl: 14.1,
      name: "Fire Dragon",
      element: "Fire",

      stats: {
        attack: 65,
        defense: 70,
        speed: 120,
        hp: 90,
        tier: 1,
      },
      experience: {
        current: 0,
        required: 100,
        level: 1,
      },
      moves: [
        {
          id: 27.1,
          name: "Flame Strike",
          description: "shit",
          power: 150,
          cooldown: 3,
          level: 1,
        },
        {
          id: 28.1,
          name: "Dragon Claw",
          description: "shit2",
          power: 205,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
  },

  Tier2: {
    "Flame Dragon": {
      id: 15,
      sl: 1,
      name: "Flame Dragon",
      element: "Fire",
      tier: 2,
      stats: {
        attack: 100,
        defense: 80,
        speed: 120,
        hp: 150,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 29,
          name: "Fire Breath",
          power: 30,
          cooldown: 3,
          level: 1,
        },
        {
          id: 30,
          name: "Scorching Roar",
          power: 35,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Frost Phoenix": {
      id: 16,
      sl: 2,
      name: "Frost Phoenix",
      element: "Ice",
      tier: 2,
      stats: {
        attack: 90,
        defense: 70,
        speed: 130,
        hp: 140,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 31,
          name: "Blizzard",
          power: 35,
          cooldown: 3,
          level: 1,
        },
        {
          id: 32,
          name: "Ice Shards",
          power: 30,
          cooldown: 2,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Thunder Titan": {
      id: 17,
      sl: 3,
      name: "Thunder Titan",
      element: "Electric",
      tier: 2,
      stats: {
        attack: 110,
        defense: 90,
        speed: 100,
        hp: 170,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 33,
          name: "Thunderstorm",
          power: 40,
          cooldown: 3,
          level: 1,
        },
        {
          id: 34,
          name: "Lightning Strike",
          power: 45,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Mystic Unicorn": {
      id: 18,
      sl: 4,
      name: "Mystic Unicorn",
      element: "Light",
      tier: 2,
      stats: {
        attack: 80,
        defense: 120,
        speed: 110,
        hp: 160,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 35,
          name: "Divine Sparkle",
          power: 35,
          cooldown: 3,
          level: 1,
        },
        {
          id: 36,
          name: "Holy Horn",
          power: 40,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Shadow Assassin": {
      id: 19,
      sl: 5,
      name: "Shadow Assassin",
      element: "Dark",
      tier: 2,
      stats: {
        attack: 120,
        defense: 70,
        speed: 150,
        hp: 140,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 37,
          name: "Shadow Strike",
          power: 40,
          cooldown: 3,
          level: 1,
        },
        {
          id: 38,
          name: "Assassinate",
          power: 50,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Tidal Leviathan": {
      id: 20,
      sl: 6,
      name: "Tidal Leviathan",
      element: "Water",
      tier: 2,
      stats: {
        attack: 100,
        defense: 100,
        speed: 120,
        hp: 180,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 39,
          name: "Tsunami",
          power: 40,
          cooldown: 3,
          level: 1,
        },
        {
          id: 40,
          name: "Aqua Whirl",
          power: 45,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Forest Guardian": {
      id: 21,
      sl: 7,
      name: "Forest Guardian",
      element: "Nature",
      tier: 2,
      stats: {
        attack: 90,
        defense: 110,
        speed: 100,
        hp: 170,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 41,
          name: "Nature's Wrath",
          power: 35,
          cooldown: 3,
          level: 1,
        },
        {
          id: 42,
          name: "Forest Fury",
          power: 40,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Gargoyle Sentinel": {
      id: 22,
      sl: 8,
      name: "Gargoyle Sentinel",
      element: "Neutral",
      tier: 2,
      stats: {
        attack: 100,
        defense: 120,
        speed: 90,
        hp: 160,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 43,
          name: "Stone Barrage",
          power: 40,
          cooldown: 3,
          level: 1,
        },
        {
          id: 44,
          name: "Sentinel's Shield",
          power: 0,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Arcane Sorcerer": {
      id: 23,
      sl: 9,
      name: "Arcane Sorcerer",
      element: "Magic",
      tier: 2,
      stats: {
        attack: 110,
        defense: 80,
        speed: 140,
        hp: 150,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 45,
          name: "Arcane Blast",
          power: 45,
          cooldown: 3,
          level: 1,
        },
        {
          id: 46,
          name: "Mystic Shield",
          power: 0,
          cooldown: 3,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Phoenix Guardian": {
      id: 24,
      sl: 10,
      name: "Phoenix Guardian",
      element: "Light",
      tier: 2,
      stats: {
        attack: 100,
        defense: 100,
        speed: 130,
        hp: 170,
      },
      experience: {
        current: 0,
        required: 200,
        level: 1,
      },
      moves: [
        {
          id: 47,
          name: "Heavenly Flames",
          power: 40,
          cooldown: 3,
          level: 1,
        },
        {
          id: 48,
          name: "Sacred Wing",
          power: 45,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    // Add more tier 2 familiars here
  },

  Tier3: {
    "Sasuke Uchiha": {
      id: 25,
      sl: 1,
      name: "Sasuke Uchiha",
      element: "Dark",
      tier: 3,
      stats: {
        attack: 130,
        defense: 90,
        speed: 160,
        hp: 180,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 49,
          name: "Chidori",
          power: 50,
          cooldown: 3,
          level: 1,
        },
        {
          id: 50,
          name: "Amaterasu",
          power: 60,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Ichigo Kurosaki": {
      id: 26,
      sl: 2,
      name: "Ichigo Kurosaki",
      element: "Light",
      tier: 3,
      stats: {
        attack: 140,
        defense: 100,
        speed: 170,
        hp: 190,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 51,
          name: "Getsuga Tenshou",
          power: 55,
          cooldown: 3,
          level: 1,
        },
        {
          id: 52,
          name: "Bankai: Tensa Zangetsu",
          power: 65,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Jin Mori": {
      id: 27,
      sl: 3,
      name: "Jin Mori",
      element: "Neutral",
      tier: 3,
      stats: {
        attack: 150,
        defense: 110,
        speed: 180,
        hp: 200,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 53,
          name: "Renewal Taekwondo: Recoilless Kick",
          power: 60,
          cooldown: 3,
          level: 1,
        },
        {
          id: 54,
          name: "Yeoui: Ruyi Jingu",
          power: 70,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    Ryuk: {
      id: 28,
      sl: 4,
      name: "Ryuk",
      element: "Dark",
      tier: 3,
      stats: {
        attack: 120,
        defense: 80,
        speed: 150,
        hp: 170,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 55,
          name: "Death Note",
          power: 50,
          cooldown: 3,
          level: 1,
        },
        {
          id: 56,
          name: "Shinigami Eyes",
          power: 60,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Dark Reaper": {
      id: 29,
      sl: 5,
      name: "Dark Reaper",
      element: "Dark",
      tier: 3,
      stats: {
        attack: 200,
        defense: 150,
        speed: 180,
        hp: 220,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 75,
          name: "Shadow Strike",
          power: 80,
          cooldown: 3,
          level: 1,
        },
        {
          id: 76,
          name: "Reaper's Grasp",
          power: 90,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Titanic Ogre": {
      id: 30,
      sl: 6,
      name: "Titanic Ogre",
      element: "Earth",
      tier: 3,
      stats: {
        attack: 220,
        defense: 180,
        speed: 160,
        hp: 250,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 77,
          name: "Earthquake",
          power: 90,
          cooldown: 3,
          level: 1,
        },
        {
          id: 78,
          name: "Titan Smash",
          power: 100,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Hellfire Behemoth": {
      id: 31,
      sl: 7,
      name: "Hellfire Behemoth",
      element: "Fire",
      tier: 3,
      stats: {
        attack: 240,
        defense: 200,
        speed: 170,
        hp: 260,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 79,
          name: "Inferno Breath",
          power: 100,
          cooldown: 3,
          level: 1,
        },
        {
          id: 80,
          name: "Hell Blaze",
          power: 110,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Shadow Sentinel": {
      id: 32,
      sl: 8,
      name: "Shadow Sentinel",
      element: "Dark",
      tier: 3,
      stats: {
        attack: 180,
        defense: 220,
        speed: 190,
        hp: 240,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 81,
          name: "Shadow Shield",
          power: 90,
          cooldown: 3,
          level: 1,
        },
        {
          id: 82,
          name: "Sentinel Strike",
          power: 100,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Volcanic Drake": {
      id: 33,
      sl: 9,
      name: "Volcanic Drake",
      element: "Fire",
      tier: 3,
      stats: {
        attack: 260,
        defense: 190,
        speed: 200,
        hp: 270,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 83,
          name: "Magma Burst",
          power: 110,
          cooldown: 3,
          level: 1,
        },
        {
          id: 84,
          name: "Volcanic Roar",
          power: 120,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Titanic Goliath": {
      id: 34,
      sl: 10,
      name: "Titanic Goliath",
      element: "Earth",
      tier: 3,
      stats: {
        attack: 240,
        defense: 220,
        speed: 210,
        hp: 280,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 85,
          name: "Goliath Punch",
          power: 120,
          cooldown: 3,
          level: 1,
        },
        {
          id: 86,
          name: "Earth Slam",
          power: 130,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Dread Shadow": {
      id: 35,
      sl: 11,
      name: "Dread Shadow",
      element: "Dark",
      tier: 3,
      stats: {
        attack: 210,
        defense: 250,
        speed: 220,
        hp: 290,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 87,
          name: "Dreadful Gaze",
          power: 120,
          cooldown: 3,
          level: 1,
        },
        {
          id: 88,
          name: "Shadow Veil",
          power: 130,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Molten Gargoyle": {
      id: 36,
      sl: 12,
      name: "Molten Gargoyle",
      element: "Fire",
      tier: 3,
      stats: {
        attack: 230,
        defense: 260,
        speed: 230,
        hp: 300,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 89,
          name: "Lava Spit",
          power: 130,
          cooldown: 3,
          level: 1,
        },
        {
          id: 90,
          name: "Stone Rain",
          power: 140,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
    "Frostbite Yeti": {
      id: 37,
      sl: 13,
      name: "Frostbite Yeti",
      element: "Ice",
      tier: 3,
      stats: {
        attack: 220,
        defense: 280,
        speed: 240,
        hp: 310,
      },
      experience: {
        current: 0,
        required: 300,
        level: 1,
      },
      moves: [
        {
          id: 91,
          name: "Icicle Smash",
          power: 140,
          cooldown: 3,
          level: 1,
        },
        {
          id: 92,
          name: "Frozen Grip",
          power: 150,
          cooldown: 4,
          level: 1,
        },
        // Add more moves as needed
      ],
    },
  },
};

module.exports = { allFamiliars };
