const Ability = require('./Ability');

class ShieldBash extends Ability {
  constructor() {
    super('Shield Bash', 'Delivers a powerful blow with the shield, slowing the opponent.', this.executeShieldBash);
  }

  executeShieldBash(user, target) {
    console.log(`${user} uses Shield Bash on ${target}. ${target} is slowed!`);
    // Implement slow effect on the target here
  }
}

class Defend extends Ability {
  constructor() {
    super('Defend', 'Raises a defensive stance, reducing incoming damage for a short duration.', this.executeDefend);
  }

  executeDefend(user) {
    console.log(`${user} uses Defend. Their defense is increased.`);
    // Implement increased defense logic here
  } 

}
class Bloodlust extends Ability {
  constructor() {
    super('Bloodlust', 'Enters a state of frenzy, increasing attack speed and damage temporarily.', this.executeBloodlust);
  }

  executeBloodlust(user) {
    console.log(`${user} enters a state of frenzy. Their attack speed and damage increase.`);
    // Implement increased attack speed and damage logic here
  }
}

class RagingStrike extends Ability {
  constructor() {
    super('Raging Strike', 'Unleashes a wild and uncontrolled strike, dealing massive damage.', this.executeRagingStrike);
  }

  executeRagingStrike(user, target) {
    console.log(`${user} unleashes a wild Raging Strike on ${target}. It deals massive damage!`);
    // Implement massive damage logic here
  }
}

class ArenaSpin extends Ability {
  constructor() {
    super('Arena Spin', 'Performs a spinning attack, hitting multiple opponents in the vicinity.', this.executeArenaSpin);
  }

  executeArenaSpin(user, targets) {
    console.log(`${user} performs an Arena Spin, hitting multiple opponents.`);
    // Implement hit multiple targets logic here
  }
}

class CrowdControl extends Ability {
  constructor() {
    super('Crowd Control', 'Taunts the enemy, forcing them to focus attacks on the Gladiator.', this.executeCrowdControl);
  }

  executeCrowdControl(user, target) {
    console.log(`${user} taunts ${target}. ${target} is now focused on ${user}.`);
    // Implement taunt effect logic here
  }
}

class PrecisionStrike extends Ability {
  constructor() {
    super('Precision Strike', 'Executes a swift and precise strike, dealing critical damage.', this.executePrecisionStrike);
  }

  executePrecisionStrike(user, target) {
    console.log(`${user} executes a precise Precision Strike on ${target}. It's a critical hit!`);
    // Implement critical damage logic here
  }
}

class HonorsResolve extends Ability {
  constructor() {
    super("Honor's Resolve", 'Enters a defensive stance, gaining increased resistance to status effects.', this.executeHonorsResolve);
  }

  executeHonorsResolve(user) {
    console.log(`${user} enters Honor's Resolve, gaining increased resistance to status effects.`);
    // Implement status effect resistance logic here
  }
}

class Fireball extends Ability {
  constructor() {
    super('Fireball', 'Hurls a ball of fire at the enemy, causing damage over time.', this.executeFireball);
  }

  executeFireball(user, target) {
    console.log(`${user} hurls a Fireball at ${target}. ${target} takes damage over time.`);
    // Implement damage over time logic here
  }
}

class ArcaneShield extends Ability {
  constructor() {
    super('Arcane Shield', 'Creates a protective shield that absorbs incoming magic attacks.', this.executeArcaneShield);
  }

  executeArcaneShield(user) {
    console.log(`${user} creates an Arcane Shield, absorbing incoming magic attacks.`);
    // Implement shield logic here
  }
}

class FrostNova extends Ability {
  constructor() {
    super('Frost Nova', 'Freezes enemies in a radius, slowing their movement and attack speed.', this.executeFrostNova);
  }

  executeFrostNova(user, targets) {
    console.log(`${user} casts Frost Nova, freezing enemies in a radius.`);
    // Implement freeze effect logic here
  }
}

class Thunderstorm extends Ability {
  constructor() {
    super('Thunderstorm', 'Calls forth a powerful lightning storm, damaging multiple opponents.', this.executeThunderstorm);
  }

  executeThunderstorm(user, targets) {
    console.log(`${user} calls forth a Thunderstorm, damaging multiple opponents.`);
    // Implement lightning damage logic here
  }
}

class RaiseDead extends Ability {
  constructor() {
    super('Raise Dead', 'Summons a skeletal minion to aid in battle.', this.executeRaiseDead);
  }

  executeRaiseDead(user) {
    console.log(`${user} summons a skeletal minion to aid in battle.`);
    // Implement minion summoning logic here
  }
}

class DrainLife extends Ability {
  constructor() {
    super('Drain Life', 'Drains the life force from the enemy, healing the necromancer.', this.executeDrainLife);
  }

  executeDrainLife(user, target) {
    console.log(`${user} drains the life force from ${target}. ${user} is healed.`);
    // Implement healing logic here
  }
}

class MirrorImage extends Ability {
  constructor() {
    super('Mirror Image', 'Creates multiple illusory copies to confuse opponents.', this.executeMirrorImage);
  }

  executeMirrorImage(user) {
    console.log(`${user} creates multiple illusory copies to confuse opponents.`);
    // Implement illusion logic here
  }
} 

class MindTrick extends Ability {
  constructor() {
    super('Mind Trick', 'Imposes an illusion on the enemy, disorienting their movement.', this.executeMindTrick);
  }

  executeMindTrick(user, target) {
    console.log(`${user} uses a Mind Trick on ${target}. ${target} is disoriented.`);
    // Implement disorientation logic here
  }
}

class Backstab extends Ability {
  constructor() {
    super('Backstab', 'Strikes the enemy from behind, dealing massive damage.', this.executeBackstab);
  }

  executeBackstab(user, target) {
    console.log(`${user} strikes ${target} from behind. It's a backstab!`);
    // Implement backstab damage logic here
  }
}

class ShadowStep extends Ability {
  constructor() {
    super('Shadow Step', 'Teleports behind the enemy, gaining a positional advantage.');
  }

  execute(user, target) {
    console.log(`${user} teleports behind ${target}, gaining a positional advantage.`);
    // Implement teleportation logic here
  }
}
class DualWield extends Ability {
    constructor() {
        super('Dual Wield', 'Wields two weapons simultaneously, increasing attack speed.');
    }

    execute(user) {
        console.log(`${user} wields two weapons simultaneously, increasing attack speed.`);
        // Implement attack speed increase logic here
    }
}

class Evasion extends Ability {
    constructor() {
        super('Evasion', 'Dodges incoming attacks, reducing damage taken for a short period.');
    }

    execute(user) {
        console.log(`${user} evades incoming attacks, reducing damage taken for a short period.`);
        // Implement damage reduction logic here
    }
}

class SmokeBomb extends Ability {
    constructor() {
        super('Smoke Bomb', 'Creates a cloud of smoke, obscuring vision and providing a chance to escape.');
    }

    execute(user) {
        console.log(`${user} throws a Smoke Bomb, creating a cloud of smoke.`);
        // Implement smoke cloud logic here
    }
}

class ShurikenBarrage extends Ability {
    constructor() {
        super('Shuriken Barrage', 'Throws a flurry of shurikens, hitting multiple targets.');
    }

    execute(user, targets) {
        console.log(`${user} throws a flurry of shurikens, hitting multiple targets.`);
        // Implement shuriken damage logic here
    }
}

class CharmingPresence extends Ability {
    constructor() {
        super('Charming Presence', 'Charms the enemy, temporarily making them passive.');
    }

    execute(user, target) {
        console.log(`${user} uses Charming Presence. ${target} is charmed and becomes passive.`);
        // Implement charm effect logic here
    }
}

class AcrobaticFlourish extends Ability {
    constructor() {
        super('Acrobatic Flourish', 'Performs a dazzling display of acrobatics, increasing evasion.');
    }

    execute(user) {
        console.log(`${user} performs an Acrobatic Flourish, increasing evasion.`);
        // Implement evasion increase logic here
    }
}

class HealingLight extends Ability {
    constructor() {
        super('Healing Light', 'Restores health to the cleric or an ally.');
    }

    execute(user, target) {
        console.log(`${user} uses Healing Light on ${target}. ${target} is healed.`);
        // Implement healing logic here
    }
}

class DivineProtection extends Ability {
    constructor() {
        super('Divine Protection', 'Provides a shield that absorbs incoming damage for a short duration.');
    }

    execute(user) {
        console.log(`${user} provides a shield of Divine Protection, absorbing incoming damage.`);
        // Implement shield logic here
    }
}

class AdaptableNature extends Ability {
    constructor() {
        super('Adaptable Nature', 'Gains a small bonus to all attributes.');
    }

    execute(user) {
        console.log(`${user} adapts to their surroundings, gaining a bonus to all attributes.`);
        // Implement attribute bonus logic here
    }
}

class VersatileTraining extends Ability {
    constructor() {
        super('Versatile Training', 'Can learn and master a wider range of skills.');
    }

    execute(user) {
        console.log(`${user} has versatile training, allowing them to learn a wider range of skills.`);
        // Implement skill learning logic here
    }
}

class ElvenGrace extends Ability {
    constructor() {
        super('Elven Grace', 'Increased agility and dexterity, improving evasion and accuracy.');
    }

    execute(user) {
        console.log(`${user} exhibits Elven Grace, increasing agility and dexterity.`);
        // Implement agility and dexterity boost logic here
    }
}

class NaturesFavor extends Ability {
    constructor() {
        super("Nature's Favor", 'Enhanced affinity with nature-based magic.');
    }

    execute(user) {
        console.log(`${user} receives Nature's Favor, enhancing their affinity with nature-based magic.`);
        // Implement nature magic affinity logic here
    }
}

class DwarvenResilience extends Ability {
    constructor() {
        super('Dwarven Resilience', 'Higher resistance to physical damage and status effects.');
    }

    execute(user) {
        console.log(`${user} demonstrates Dwarven Resilience, showing higher resistance to physical damage.`);
        // Implement physical damage resistance logic here
    }
}

class MasterCraftsman extends Ability {
    constructor() {
        super('Master Craftsman', 'Proficient in crafting weapons and armor.');
    }

    execute(user) {
        console.log(`${user} is a Master Craftsman, skilled in crafting weapons and armor.`);
        // Implement crafting proficiency logic here
    }
}

class FeralStrength extends Ability {
    constructor() {
        super('Feral Strength', 'Increased physical strength, dealing more damage in melee combat.');
    }

    execute(user) {
        console.log(`${user} harnesses Feral Strength, gaining increased physical power.`);
        // Implement strength increase logic here
    }
}

class SavageFury extends Ability {
    constructor() {
        super('Savage Fury', 'Becomes more powerful as health decreases.');
    }

    execute(user) {
        console.log(`${user} channels Savage Fury, becoming more powerful as health decreases.`);
        // Implement health-dependent power logic here
    }
}

class SneakyTricks extends Ability {
    constructor() {
        super('Sneaky Tricks', 'Increased chances of successfully stealing or evading detection.');
    }

    execute(user) {
        console.log(`${user} employs Sneaky Tricks, improving chances of stealing or evading detection.`);
        // Implement sneaky behavior logic here
    }
}

class LuckyCharm extends Ability {
    constructor() {
        super('Lucky Charm', 'Occasionally gains a small advantage in critical situations.');
    }

    execute(user) {
        console.log(`${user} possesses a Lucky Charm, occasionally gaining advantages in critical situations.`);
        // Implement luck-based advantages logic here
    }
}

class ArcaneBrilliance extends Ability {
    constructor() {
        super('Arcane Brilliance', 'Innate proficiency in arcane magic.');
    }

    execute(user) {
        console.log(`${user} shines with Arcane Brilliance, displaying innate proficiency in arcane magic.`);
        // Implement arcane magic proficiency logic here
    }
}

class InventiveMind extends Ability {
    constructor() {
        super('Inventive Mind', 'Can create and utilize unique gadgets and contraptions.');
    }

    execute(user) {
        console.log(`${user} has an Inventive Mind, capable of creating and using unique gadgets.`);
        // Implement gadget creation and usage logic here
    }
}

module.exports = {
  ShieldBash,
  Defend,
  Bloodlust, RagingStrike, ArenaSpin, CrowdControl, PrecisionStrike, HonorsResolve, Fireball, ArcaneShield, FrostNova, Thunderstorm, RaiseDead, DrainLife, MirrorImage, MindTrick, Backstab, ShadowStep,
    DualWield,
    Evasion,
    SmokeBomb,
    ShurikenBarrage,
   DualWield,
    Evasion,
    SmokeBomb,
    ShurikenBarrage,
    CharmingPresence,
    AcrobaticFlourish,
    HealingLight,
    DivineProtection,
    AdaptableNature,
    VersatileTraining,
    ElvenGrace,
    NaturesFavor,
    DwarvenResilience,
    MasterCraftsman,
    FeralStrength,
    SavageFury,
    SneakyTricks,
    LuckyCharm,
    ArcaneBrilliance,
    InventiveMind,
  // Add other abilities here
};
