const abilities = {
    'Shield Bash': {
        description: "Delivers a powerful blow with the shield, slowing the opponent.",
        name:'Shield Bash',
        execute: (user, target) => {
            console.log(`${user} uses Shield Bash on ${target}. ${target} is slowed!`);
          
            // Implement slow effect on the target here
        }
    },
    'Defend': {
        description: "Raises a defensive stance, reducing incoming damage for a short duration.",
        name:'Defend',
        execute: (user) => {
            console.log(`${user} uses Defend. Their defense is increased.`);
            // Implement increased defense logic here
        }
    },
    'Bloodlust': {
        description: "Enters a state of frenzy, increasing attack speed and damage temporarily.",
        name:'Bloodlust',
        execute: (user) => {
            console.log(`${user} enters a state of frenzy. Their attack speed and damage increase.`);
            // Implement increased attack speed and damage logic here
        }
    },
    'Raging Strike': {
        description: "Unleashes a wild and uncontrolled strike, dealing massive damage.",
      name:'Raging Strike',
        execute: (user, target) => {
            console.log(`${user} unleashes a wild Raging Strike on ${target}. It deals massive damage!`);
            // Implement massive damage logic here
        }
    },
    'Arena Spin': {
        description: "Performs a spinning attack, hitting multiple opponents in the vicinity.",
       name:'Arena Spin',
        execute: (user, targets) => {
            console.log(`${user} performs an Arena Spin, hitting multiple opponents.`);
            // Implement hit multiple targets logic here
        }
    },
    'Crowd Control': {
        description: "Taunts the enemy, forcing them to focus attacks on the Gladiator.",
      name:'Crowd Control',
        execute: (user, target) => {
            console.log(`${user} taunts ${target}. ${target} is now focused on ${user}.`);
            // Implement taunt effect logic here
        }
    },
    'Precision Strike': {
        description: "Executes a swift and precise strike, dealing critical damage.",
      name:'Precision Strike',
        execute: (user, target) => {
            console.log(`${user} executes a precise Precision Strike on ${target}. It's a critical hit!`);
            // Implement critical damage logic here
        }
    },
    'Honor\'s Resolve': {
        description: "Enters a defensive stance, gaining increased resistance to status effects.",
      name:'Honor\'s Resolve',
        execute: (user) => {
            console.log(`${user} enters Honor's Resolve, gaining increased resistance to status effects.`);
            // Implement status effect resistance logic here
        }
    },
    'Fireball': {
        description: "Hurls a ball of fire at the enemy, causing damage over time.",
      name:'Fireball',
        execute: (user, target) => {
            console.log(`${user} hurls a Fireball at ${target}. ${target} takes damage over time.`);
            // Implement damage over time logic here
        }
    },
    'Arcane Shield': {
        description: "Creates a protective shield that absorbs incoming magic attacks.",
      name:'Arcane Shield',
        execute: (user) => {
            console.log(`${user} creates an Arcane Shield, absorbing incoming magic attacks.`);
            // Implement shield logic here
        }
    },
    'Frost Nova': {
        description: "Freezes enemies in a radius, slowing their movement and attack speed.",
      name:'Frost Nova',
        execute: (user, targets) => {
            console.log(`${user} casts Frost Nova, freezing enemies in a radius.`);
            // Implement freeze effect logic here
        }
    },
    'Thunderstorm': {
        description: "Calls forth a powerful lightning storm, damaging multiple opponents.",
       name:'Thunderstorm',
        execute: (user, targets) => {
            console.log(`${user} calls forth a Thunderstorm, damaging multiple opponents.`);
            // Implement lightning damage logic here
        }
    },
    'Raise Dead': {
        description: "Summons a skeletal minion to aid in battle.",
       name:'Raise Dead',
        execute: (user) => {
            console.log(`${user} summons a skeletal minion to aid in battle.`);
            // Implement minion summoning logic here
        }
    },
    'Drain Life': {
        description: "Drains the life force from the enemy, healing the necromancer.",
      name:'Drain Life',
        execute: (user, target) => {
            console.log(`${user} drains the life force from ${target}. ${user} is healed.`);
            // Implement healing logic here
        }
    },
    'Mirror Image': {
        description: "Creates multiple illusory copies to confuse opponents.",
      name:'Mirror Image',
        execute: (user) => {
            console.log(`${user} creates multiple illusory copies to confuse opponents.`);
            // Implement illusion logic here
        }
    },
    'Mind Trick': {
        description: "Imposes an illusion on the enemy, disorienting their movement.",
      name:'Mind Trick',
        execute: (user, target) => {
            console.log(`${user} uses a Mind Trick on ${target}. ${target} is disoriented.`);
            // Implement disorientation logic here
        }
    },
    'Backstab': {
        description: "Strikes the enemy from behind, dealing massive damage.",
      name:'Backstab',
        execute: (user, target) => {
            console.log(`${user} strikes ${target} from behind. It's a backstab!`);
            // Implement backstab damage logic here
        }
    },
    'Shadow Step': {
        description: "Teleports behind the enemy, gaining a positional advantage.",
      name:'Shadow Step',
        execute: (user, target) => {
            console.log(`${user} teleports behind ${target}, gaining a positional advantage.`);
            // Implement teleportation logic here
        }
    },
    'Dual Wield': {
        description: "Wields two weapons simultaneously, increasing attack speed.",
      name:'Dual Wield',
        execute: (user) => {
            console.log(`${user} wields two weapons simultaneously, increasing attack speed.`);
            // Implement attack speed increase logic here
        }
    },
    'Evasion': {
        description: "Dodges incoming attacks, reducing damage taken for a short period.",
      name:'Evasion',
        execute: (user) => {
            console.log(`${user} evades incoming attacks, reducing damage taken for a short period.`);
            // Implement damage reduction logic here
        }
    },
    'Smoke Bomb': {
        description: "Creates a cloud of smoke, obscuring vision and providing a chance to escape.",
      name:'Smoke Bomb',
        execute: (user) => {
            console.log(`${user} throws a Smoke Bomb, creating a cloud of smoke.`);
            // Implement smoke cloud logic here
        }
    },
    'Shuriken Barrage': {
        description: "Throws a flurry of shurikens, hitting multiple targets.",
      name:'Shuriken Barrage',
        execute: (user, targets) => {
            console.log(`${user} throws a flurry of shurikens, hitting multiple targets.`);
            // Implement shuriken damage logic here
        }
    },
    'Charming Presence': {
        description: "Charms the enemy, temporarily making them passive.",
      name:'Charming Presence',
        execute: (user, target) => {
            console.log(`${user} uses Charming Presence. ${target} is charmed and becomes passive.`);
            // Implement charm effect logic here
        }
    },
    'Acrobatic Flourish': {
        description: "Performs a dazzling display of acrobatics, increasing evasion.",
       name:'Acrobatic Flourish',
        execute: (user) => {
            console.log(`${user} performs an Acrobatic Flourish, increasing evasion.`);
            // Implement evasion increase logic here
        }
    },
    'Healing Light': {
        description: "Restores health to the cleric or an ally.",
        name:'Healing Light',
        execute: (user, target) => {
            console.log(`${user} uses Healing Light on ${target}. ${target} is healed.`);
            // Implement healing logic here
        }
    },
    'Divine Protection': {
        description: "Provides a shield that absorbs incoming damage for a short duration.",
      name:'Divine Protection',
        execute: (user) => {
            console.log(`${user} provides a shield of Divine Protection, absorbing incoming damage.`);
            // Implement shield logic here
        }
    },
    'Adaptable Nature': {
        description: "Gains a small bonus to all attributes.",
        execute: (user) => {
            console.log(`${user} adapts to their surroundings, gaining a bonus to all attributes.`);
            // Implement attribute bonus logic here
        }
    },
    'Versatile Training': {
        description: "Can learn and master a wider range of skills.",
        execute: (user) => {
            console.log(`${user} has versatile training, allowing them to learn a wider range of skills.`);
            // Implement skill learning logic here
        }
    },
    'Elven Grace': {
        description: "Increased agility and dexterity, improving evasion and accuracy.",
        execute: (user) => {
            console.log(`${user} exhibits Elven Grace, increasing agility and dexterity.`);
            // Implement agility and dexterity boost logic here
        }
    },
    'Nature\'s Favor': {
        description: "Enhanced affinity with nature-based magic.",
        execute: (user) => {
            console.log(`${user} receives Nature's Favor, enhancing their affinity with nature-based magic.`);
            // Implement nature magic affinity logic here
        }
    },
    'Dwarven Resilience': {
        description: "Higher resistance to physical damage and status effects.",
        execute: (user) => {
            console.log(`${user} demonstrates Dwarven Resilience, showing higher resistance to physical damage.`);
            // Implement physical damage resistance logic here
        }
    },
    'Master Craftsman': {
        description: "Proficient in crafting weapons and armor.",
        execute: (user) => {
            console.log(`${user} is a Master Craftsman, skilled in crafting weapons and armor.`);
            // Implement crafting proficiency logic here
        }
    },
    'Feral Strength': {
        description: "Increased physical strength, dealing more damage in melee combat.",
        execute: (user) => {
            console.log(`${user} harnesses Feral Strength, gaining increased physical power.`);
            // Implement strength increase logic here
        }
    },
    'Savage Fury': {
        description: "Becomes more powerful as health decreases.",
        execute: (user) => {
            console.log(`${user} channels Savage Fury, becoming more powerful as health decreases.`);
            // Implement health-dependent power logic here
        }
    },
    'Sneaky Tricks': {
        description: "Increased chances of successfully stealing or evading detection.",
        execute: (user) => {
            console.log(`${user} employs Sneaky Tricks, improving chances of stealing or evading detection.`);
            // Implement sneaky behavior logic here
        }
    },
    'Lucky Charm': {
        description: "Occasionally gains a small advantage in critical situations.",
        execute: (user) => {
            console.log(`${user} possesses a Lucky Charm, occasionally gaining advantages in critical situations.`);
            // Implement luck-based advantages logic here
        }
    },
    'Arcane Brilliance': {
        description: "Innate proficiency in arcane magic.",
        execute: (user) => {
            console.log(`${user} shines with Arcane Brilliance, displaying innate proficiency in arcane magic.`);
            // Implement arcane magic proficiency logic here
        }
    },
    'Inventive Mind': {
        description: "Can create and utilize unique gadgets and contraptions.",
        execute: (user) => {
            console.log(`${user} has an Inventive Mind, capable of creating and using unique gadgets.`);
            // Implement gadget creation and usage logic here
        }
    },
};

module.exports = abilities;
