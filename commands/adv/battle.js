const players = require('../../data/players.json');
const {mongoClient} = require('../../data/mongo/mongo.js')
const db = mongoClient.db('Akaimnky');
const collection = db.collection('akaillection');
const { quests } = require('./quests');
const {bosses} = require('./bosses.js');
const {mobs} = require('./mobs.js');
const {cards} = require('../fun/cards.js'); // Import the cards data from 'cards.js'
const {
    checkResults,
    getCardStats,
    getCardMoves,
    calculateDamage,
    getPlayerMoves
} = require('../util/glogic.js');
const classes = require('../../data/classes/allclasses');
const abilities = require('../../data/abilities.js');
const {
    Ability
} = require('./AbilitiesFunction.js');
let initialMessage = null;
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const buttonRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId('action_normal')
        .setLabel('Attack')
        .setStyle('Danger'),
        new ButtonBuilder()
        .setCustomId('action_doge')
        .setLabel('Dodge')
        .setStyle('Danger')
    );


class Battle {
    constructor(player, enemy, message ) {
        this.mobSource = JSON.parse(JSON.stringify(mobs));
        this.bossSource  = JSON.parse(JSON.stringify(bosses));
        this.famSource  = JSON.parse(JSON.stringify(cards));
        this.enemyDetails = enemy
        this.message = message;
        this.player = player;
        this.mobs = [];
        this.abilityOptions = [];
        try {if (this.player.selectedFamiliars) {
               this.playerFamiliar = this.player.selectedFamiliars.name;
                 } else if (!this.player.selectedFamiliars) {
                console.log('gay')
                this.playerFamiliar = ["Fire Dragon"];
                this.message.channel.send('You have to select your familiar first using a!selectFamiliar')
                return this.continue = false;
            }} catch (error) { console.log('No selected Familiars!', error); }
        this.familiarInfo = [];
        this.mobInfo = [];
        this.playerName = this.player.name;
        this.playerClass = null;
        this.playerRace = null;
        if (this.enemyDetails.type === 'boss') {
        this.boss = this.bossSource[this.enemyDetails.name];
        } else {
          this.boss = this.bossSource['Dragon Lord']
        }
        this.currentTurn = null;
        this.characters = [];
        this.environment = [];
        this.currentTurnIndex = 0; // Index of the character whose turn it is
        this.turnCounter = 0; // Counter to track overall turns
        this.battleLogs = [];
        this.ability = new Ability(this);
        this.initialMessage = initialMessage;
        this.aliveFam = [];
        this.aliveEnemies = [];
        this.deadEnemies = [];
        this.battleEmbed = null;
        this.allEnemies = [];
        this.waves = this.enemyDetails.waves
        this.enemyFirst = false;
        this.pickEnemyOptions = null;
        this.selectMenu = null;
        this.pickedChoice = false
        this.enemyToHit = null;

    }

  
    async initialiseStuff()
 {
    try{
    for (const familiarName of this.playerFamiliar) {
      const familiarData = this.famSource[familiarName];
      if (familiarData) {
          this.familiarInfo.push(familiarData);
      } }
    if (this.enemyDetails.type === 'boss') {
    this.boss = this.bossSource[this.enemyDetails.name];
    this.allEnemies.push(this.boss)
    } else {
    this.boss = this.bossSource['Dragon Lord']
    }
    if (this.enemyDetails.type === 'mob' && this.enemyDetails.hasAllies.includes('none')) {
    this.mobs.push(this.enemyDetails.name)
    } else if (this.enemyDetails.type === 'mob' && !this.enemyDetails.hasAllies.includes('none')) {
     this.mobs.push(this.enemyDetails.name)
     this.mobs.push(this.enemyDetails.hasAllies.join(','))
    }
    console.log('this.mobs:', this.mobs)
    for (const mobName of this.mobs) {
    const mobData = this.mobSource[mobName];
      if (mobData) {
        console.log('MobDATAAAHTAHHA:', mobData)
      this.mobInfo.push(mobData);
    } }
    this.allEnemies.push(...this.mobInfo)
    if (this.enemyDetails.type === 'boss') {
    this.characters = [this.player, ...this.familiarInfo, this.boss];

    } else {
    this.characters = [this.player, ...this.familiarInfo, ...this.mobInfo];
    }
    if (this.player.class != null) {
      this.playerClass = this.player.class
      this.continue = true;
    } else if (this.player.class === null) {
      this.message.channel.send('You have to select a class first, use a!selectclass');
      return this.continue = false;
    }
    if (this.player.race != null) {
      this.playerRace = this.player.race
    } else if (this.player.class === null) {
      this.message.channel.send('You have to select a race first, use a!selectrace');
    }
    for (const character of this.characters) {
     try {
      character.maxHp = character.stats.hp
    } catch (error) {
      console.log('fillBarError:', error);
    }
      character.atkBar = 0;
      character.attackBarEmoji = [];
      character.hpBarEmoji = [];
      console.log(character.name, '-', character.attackBarEmoji), '-', character.hpBarEmoji;
    }
    console.log('this.allEnemies:', this.allEnemies)
    this.aliveEnemies = this.allEnemies;
} catch (error) {
        console.log('The error is here:', error)
}
  }     
  
    async startEmbed() {
      await this.initialiseStuff()
      let selectedValue;
            // Create the embed for the adventure command
    this.battleEmbed = new EmbedBuilder()
      .setTitle('Start battle lul')
      .setDescription(`### - Do you want to really fight the monsters?\n\n>>> **Player and familiars:**\n- __${this.player.name} Level__: ${this.player.exp.level} \n- __Familiars selected__: ${this.familiarInfo.map(familiar => familiar.name).join(', ' )} \n\n **Enemy Info**:\n - __${this.enemyDetails.name} Level__: It not made smh \n\n **Automate this battle?**\n- automating has its own issues it does worse than you would normally do!! \n\n **Your Power Level vs Recommended**\n- somethings you needa make that shit\n\n **Difficulty**\n- bhag le\n\n **Start Battle**\n To start, click on the "Lets Dive into it" button!!`)
            // Display options for quests, bosses, mobs, and adventures
    const optionSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('option_krlo')
      .setPlaceholder('Select an option')
      .addOptions([
        { label: 'Bosses', value: 'klik_bosses' },
        { label: 'Mobs', value: 'klik_mobs' },
        { label: 'Fight', value: 'klik_fight' }
      ]);
const stringMenuRow = new ActionRowBuilder().addComponents(optionSelectMenu);
 const gaeMessage = await this.message.channel.send({embeds: [this.battleEmbed], components: [stringMenuRow]})
    const filter = i => (['start_adventure', 'cancel_adventure'].includes(i.customId)) || (i.customId === 'option_krlo') || (i.customId === 'go_in');
       const collector = await gaeMessage.createMessageComponentCollector({ filter, time: 300000 });

    collector.on('collect', async (i) => {
                      
      if (i.customId === 'option_krlo') {
        i.deferUpdate();
        selectedValue = i.values[0]; // Get the selected value // gae shit
                  
                       if (selectedValue.startsWith('klik_')) {
                        console.log('bro clicked fr??:', selectedValue);
                         const selectedValueName = selectedValue.replace('klik_', '');
                         if (selectedValueName === 'fight') {
                           gaeMessage.delete()
   if (this.continue) {
 this.startBattle(this.message);
   }
      }
                       }}  
                        });
 // // await  battle.isSelected();
 //   if (this.continue) {
 //  console.log('playerSElECTFAMILOIAR:', this.player.selectedFamilar )
 // this.startBattle(this.message);
 //   }
    }
    
    async sendInitialEmbed() {
        try {
            // const filledBars = Math.floor(atkBar / 10);
            //  const emptyBars = 10 - filledBars;
            //  const attackBarString = `${'⚔️'.repeat(filledBars)}${' '.repeat(emptyBars)}`;
            console.log(this.player.name, '-inside', this.player.attackBarEmoji);
            this.battleEmbed = new EmbedBuilder()
                .setTitle('Battle')
                .setDescription(`You are fighting against ${this.enemyDetails.name}`)
                .setFooter({
                    text: 'You can run if you want lol no issues'
                })
              .setColor(0x0099FF)
              if (this.enemyDetails.type === 'boss') {
                this.battleEmbed.addFields({
                    name: `Enemies Info:`,
                    value: `\`\`\`ansi\n[2;31m> ${this.boss.name}\n[2;32m HitPoints: ${this.boss.hpBarEmoji} ${this.boss.stats.hp}\n[2;36m AttackBar: [2;34m${this.boss.attackBarEmoji} ${Math.floor(this.boss.atkBar)}\`\`\``,
                    inline: false
                })
              } else if(this.enemyDetails.type === 'mob') {
                let mobInfo = ''; // Initialize an empty string to store the info
              for (const mob of this.mobInfo) {
                      mobInfo += `[2;35m> ${mob.name}\n[2;32m HitPoints: ${mob.hpBarEmoji} ${mob.stats.hp}\n[2;36m AttackBar: [2;34m${mob.attackBarEmoji} ${Math.floor(mob.atkBar)}\n\n`;
                }
                this.battleEmbed.addFields({
                    name: 'Enemies Info:',
                    value: `\`\`\`ansi\n${mobInfo}\`\`\``,
                    inline: false
                });
              }
              this.battleEmbed.addFields({
                    name: `Current Turn`,
                    value: `\`\`\`${this.currentTurn}\`\`\``,
                    inline: false
                }, );
            if (this.player) {
                let playerAndFamiliarsInfo = ''; // Initialize an empty string to store the info

                for (const familiar of this.familiarInfo) {
                    playerAndFamiliarsInfo += `[2;35m> ${familiar.name}\n[2;32m HitPoints: ${familiar.hpBarEmoji} ${familiar.stats.hp}\n[2;36m AttackBar: [2;34m${familiar.attackBarEmoji} ${Math.floor(familiar.atkBar)}\n\n`;
                }

                // Add the player's HP and AttackBar to the info
                playerAndFamiliarsInfo += `[2;35m> ${this.playerName}\n[2;32m HitPoints: ${this.player.hpBarEmoji} ${this.player.stats.hp}\n[2;36m AttackBar: [2;34m${this.player.attackBarEmoji} ${Math.floor(this.player.atkBar)}`;

                this.battleEmbed.addFields({
                    name: 'Your Team Info:',
                    value: `\`\`\`ansi\n${playerAndFamiliarsInfo}\`\`\``,
                    inline: false
                });
            }
            console.log('battleLOgsLengthBefore', this.battleLogs.length);
            if (this.battleLogs.length > 6 && this.battleLogs.length <= 7) {
                this.battleLogs.shift();
            } else if (this.battleLogs.length > 7 && this.battleLogs.length <= 8) {
                this.battleLogs.shift()
                this.battleLogs.shift();
            } else if (this.battleLogs.length > 8) {
                this.battleLogs.shift();
                this.battleLogs.shift();
                this.battleLogs.shift();
            }
            console.log('battleLogsLengthAfterr:', this.battleLogs.length)

            if (this.battleLogs.length > 0) {

                this.battleEmbed.addFields({
                    name: 'Battle Logs',
                    value: '```diff\n' + this.battleLogs.join('\n') + '```',
                    inline: false
                });
            } else {
                this.battleEmbed.addFields({
                    name: 'Battle Logs',
                    value: 'No battle logs yet.',
                    inline: false
                });
            }
            return this.battleEmbed
            // return await message.channel.send({ embeds: [initialEmbed], components: [buttonRow] });
        } catch (error) {
            console.error('Error on hit:', error);
        }
        // Implement code to send an initial embed with battle information
    }

    async toCamelCase(str) {

        const words = str.split(' ');
        if (words.length === 1) {
            return words[0].toLowerCase();
        }
        if (words.length === 2) {
            return words[0].toLowerCase() + words[1];
        }
        return str.replace(/\s(.)/g, function (match, group1) {
            console.log('group1:', group1);
            console.log('match:', match);
            return group1.toUpperCase();
        }).replace(/\s/g, ''); // Remove any remaining spaces

}

    async startBattle(message) {

        await this.getNextTurn()

        this.initialMessage = await this.sendInitialEmbed(message);
        this.initialMessage = await message.channel.send({
            embeds: [this.initialMessage],
            components: await
            this.getDuelActionRow()
        }); if(this.enemyFirst) {
       this.printBattleResult();
         const updatedEmbed = await this.sendInitialEmbed(message);
         await this.initialMessage.edit({
             embeds: [updatedEmbed],
             components: await this.getDuelActionRow()
         });
        }
        const filter = i => (i.user.id === message.user.id) && i.customId.startsWith('action_') || i.customId === 'starter';

        const collector = this.initialMessage.createMessageComponentCollector({
            filter,
            time: 600000
        });
        // Handle button interactions
        collector.on('collect', async (i) => {
            await i.deferUpdate();
            console.log('customid:', i.customId)

            if (i.customId === 'action_normal') {
                try {
                    if (this.pickedChoice || this.aliveEnemies.length === 1){
                        this.pickedChoice = false;
                    if (this.aliveEnemies.length === 1) {
                        this.enemyToHit = this.aliveEnemies[0];
                    }
                    this.performTurn(message);
                    await this.getNextTurn()
                    await this.performEnemyTurn(message);
                    console.log('currentTurn:', this.currentTurn);
                  this.printBattleResult();
                } else {
                    i.followUp({content: 'Please pick an enemy to hit using the Select Menu', ephemeral: true})
                }

                    
                   
                
                } catch (error) {
                    console.error('Error on hit:', error);
                }
            } else if (i.customId === 'action_select') {
                        const targetIndex = i.values[0]
                        const realTarget = targetIndex.replace('enemy_', '')
                        this.enemyToHit = this.aliveEnemies[realTarget];
                        this.pickedChoice = true;
                        // Continue with your code logic after selecting an enemy
                      }
            else if (i.customId === 'starter') {
                const selectedClassValue = i.values[0]; // Get the selected value // gae shit
                console.log('selectedValues', selectedClassValue)
                if (this.pickedChoice || this.aliveEnemies.length === 1) {
                    this.pickedChoice = false;
                    if (this.aliveEnemies.length === 1) {
                        this.enemyToHit = this.aliveEnemies[0];
                    }
                if (selectedClassValue.startsWith('player_ability_')) {
                    try {
                        const abilityName = selectedClassValue.replace('player_ability_', '');
                        console.log('abilityName:a', abilityName)
                        const abilityNameCamel = await this.toCamelCase(abilityName);
                        console.log('abilityName:a', abilityNameCamel)
                        // Check if the abilityName exists as a method in the Ability class
                        if (typeof this.ability[abilityNameCamel] === 'function') {
                            await this.ability[abilityNameCamel](this.player, this.enemyToHit);
                            await this.getNextTurn()
                            await this.performEnemyTurn(message);
                            console.log('currentTurn:', this.currentTurn);
                          this.printBattleResult();
                            const updatedEmbed = await this.sendInitialEmbed(message);
                        } else {
                            console.log(`Ability ${abilityName} not found.`);
                        }
                        

                    } catch (error) {
                        console.error('Error on hit:', error);
                        message.channel.send('You perhaps have not selected a class yet. Please select it using "a!classselect", and select race using "a!raceselect".')
                    }
                } else if (selectedClassValue.startsWith('fam-')) {
                    try {
                        const abilityName = selectedClassValue.replace('fam-', '');
                        console.log('abilityName:a', abilityName)
                        const abilityNameCamel = await this.toCamelCase(abilityName);
                        console.log('abilityName:a', abilityNameCamel)
                        if (typeof this.ability[abilityNameCamel] === 'function') {
                            // Execute the ability by calling it using square brackets
                            for (const familiar of this.familiarInfo) {
                                if (familiar.name === this.currentTurn) {
                                    this.ability[abilityNameCamel](familiar, this.enemyToHit);
                                    await this.getNextTurn()
                                    await this.performEnemyTurn(message);
                                    console.log('currentTurn:', this.currentTurn);
                                  this.printBattleResult();
                                   break;
                                }
                            }
                        } else {
                            console.log(`Ability ${abilityName} not found.`);
                        }
                        
                    } catch (error) {
                        console.log('ErrorFamiliar:', error)
                    }
                }
            }  else {
                i.followUp({content: 'Please pick an enemy to hit using the Select Menu', ephemeral: true})
            }
            }

        });

    }
   
    async getDuelActionRow() {
        // console.log('thiscurenttyrn:', this.currentTurn)
        //    console.log('thiscurenttyrn:', this.playerFamiliar)
        if (this.playerFamiliar.includes(this.currentTurn)) {
            let familiarArray = [];
            familiarArray.push(this.currentTurn);
            const moveFinder = familiarArray.map(cardName => getCardMoves(cardName));


            try {
                this.abilityOptions = moveFinder[0].map((ability) => {
                    if (ability && ability.id) {
                        return {
                            label: ability.name,
                            description: ability.description,
                            value: `fam-${ability.name}`,
                        };
                    }
                });
                familiarArray = [];
                // console.log('abilityOptions:', this.abilityOptions)
            } catch (error) {
                console.log('moveOptionsError:', error)
            }
        }
       else if (this.currentTurn === this.player.name) {
            const playerAbility = classes[this.player.class].abilities;
            // console.log('stuffimportant:', playerAbility)
            try {
                const moveFinder = playerAbility.map(cardName => getPlayerMoves(cardName));
                // console.log('moveFinder:', moveFinder)
                this.abilityOptions = moveFinder.map((ability, index) => {
                    if (ability && ability.description) {
                        // ability.execute(this.currentTurn, this.boss.name)
                        // console.log('execuTE:', ability.execute); 
                        return {
                            label: ability.name,
                            description: ability.description,
                            value: `player_ability_${ability.name}`,
                        };
                    }
                });
                // console.log('abilityOptions:', this.abilityOptions)
            } catch (error) {
                console.log('moveOptionsError:', error)
            }
        }
      for (const enemy of this.allEnemies) {
        if (enemy.name === this.currentTurn) {
          this.enemyFirst = true;
          this.abilityOptions = [{
                      label: 'namename',
                      description: 'whatever',
                      value: `uh oh`,
                  }]
          this.performEnemyTurn(this.message);
            }
      }
      this.pickEnemyOptions = this.aliveEnemies.map((enemy, index) => ({
        label: enemy.name,
        description: `Attack ${enemy.name}`,
        value: `enemy_${index}`
      }));
      console.log('This.pickEnemyOptions:', this.pickEnemyOptions)
      this.selectMenu = new StringSelectMenuBuilder()
        .setCustomId('action_select')
        .setPlaceholder('Select the target')
        .addOptions(this.pickEnemyOptions);
      console.log('This.selectEmnu:', this.selectMenu)
       


        const stringMenu = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('Make a selection!')
            .addOptions(this.abilityOptions);



        const stringMenuRow = new ActionRowBuilder().addComponents(stringMenu);
console.log('stringMENUROW:', stringMenuRow)
const gaeRow = new ActionRowBuilder().addComponents(await this.selectMenu)

        const rows = [buttonRow, stringMenuRow, gaeRow];


        return rows;
    }

    async calculateOverallSpeed(character) {
        try {
            if (character === this.player) {

                return this.player.stats.speed;

            } else if (this.playerFamiliar.includes(character.name)) {
                // Find the familiar's speed by matching it with this.familiarInfo
                const familiarInfo = this.familiarInfo.find((fam) => fam.name === character.name);
                const familiarSpeed = familiarInfo ? familiarInfo.stats.speed : 0; // Default to 0 if not found

                return familiarSpeed;
            } else if (character === this.boss) {

                return this.boss.stats.speed;
              } else if (this.mobs.includes(character.name)) {
                // Find the familiar's speed by matching it with this.familiarInfo
                const familiarInfo = this.mobInfo.find((fam) => fam.name === character.name);
                const familiarSpeed = familiarInfo ? familiarInfo.stats.speed : 0; // Default to 0 if not found

                return familiarSpeed;
            }
              else {
                console.log(`Calculating speed for unknown character type: 0`);
                return 0; // Default to 0 for unknown character types
            }
        } catch (error) {
            console.log('speedcalculator:', error);
        }
    } 

    async calculateOverallHp(character) {
      // console.log('character:', character)
        try {
            if (character === this.player) {

                return this.player.stats.hp;

            } else if (this.playerFamiliar.includes(character.name)) {
                // Find the familiar's speed by matching it with this.familiarInfo
                const familiarInfo = this.familiarInfo.find((fam) => fam.name === character.name);
                const familiarHp = familiarInfo ? familiarInfo.stats.hp : 0; // Default to 0 if not found

                return familiarHp;
            } else if (character === this.boss) {

                return this.boss.stats.hp;
            } else if (this.mobs.includes(character.name)) {
              // Find the familiar's speed by matching it with this.familiarInfo
              const familiarInfo = this.mobInfo.find((fam) => fam.name === character.name);
              const familiarHp = familiarInfo ? familiarInfo.stats.hp : 0; // Default to 0 if not found

              return familiarHp;
            } else {
                console.log(`Calculating speed for unknown character type: 0`);
                return 0; // Default to 0 for unknown character types
            }
        } catch (error) {
            console.log('speedcalculator:', error);
        }
    }

    async fillAtkBars() {
        try {
            for (const character of this.characters) {
                const speed = await this.calculateOverallSpeed(character);
              const hp = await this.calculateOverallHp(character);
                const speedMultiplier = character.speedBuff ? 1.3 : 1; // Apply Speed Buff if active
                character.atkBar += speed * 0.05 * speedMultiplier;
                character.attackBarEmoji = await this.generateAttackBarEmoji(character.atkBar);
              
              character.hpBarEmoji = await this.generateHPBarEmoji(character.stats.hp, character.stats.hp)
            
               
            }
        } catch (error) {
            console.log('fillBarError:', error);
        }
    }

    async fillHpBars() {
        try {
            for (const character of this.characters) {
        character.hpBarEmoji = await this.generateHPBarEmoji(character.stats.hp, character.maxHp)
            }
        } catch (error) {
            console.log('fillBarError:', error);
        }
    }

    async generateAttackBarEmoji(atkBar) {
      try{
        const emoji = '■';
        let emptyBars = 0;
      if (atkBar > 113) {
        console.log('atkBar:', atkBar)
        atkBar = 113
      }
        const filledBars = Math.floor(atkBar / 5);

        emptyBars = Math.floor(21 - filledBars);

        if (atkBar > 100) {
            emptyBars = Math.floor(22 - filledBars);

        }


        const attackBarString = `${emoji.repeat(filledBars)}${' '.repeat(emptyBars)}`;
        return `[${attackBarString}]`;
    } catch (error) {
        console.log('errorHere:', error)
    }
    }

    async generateHPBarEmoji(currentHP, maxHP) {
        const emoji = '■';
let filledBars;
         filledBars = Math.floor((currentHP / maxHP) * 21); 
            if (currentHP < 0)  {
              filledBars = 0
      }
        const emptyBars = Math.floor(21 - filledBars);

        let hpBarString = emoji.repeat(filledBars);
        if (emptyBars > 0) {
            hpBarString += ' '.repeat(emptyBars);
        }

        return `[${hpBarString}]`;
      
    }

    async getNextTurn() {
        let nextTurn = null;
        while (true) {
            await this.fillAtkBars();

            // Get all characters that have reached 100 attack bar
            const charactersWith100AtkBar = this.characters.filter((character) => character.atkBar >= 100);
            // console.log('charactersWITHQ100ATKBAR:', charactersWith100AtkBar.length)
            if (charactersWith100AtkBar.length === 1) {
                const characterWith100AtkBar = charactersWith100AtkBar[0];
                console.log(`${characterWith100AtkBar.name} has reached 100 attack bar.`);
                this.currentTurn = characterWith100AtkBar.name;
                characterWith100AtkBar.attackBarEmoji = await this.generateAttackBarEmoji(characterWith100AtkBar.atkBar);
                characterWith100AtkBar.atkBar = 0;
                console.log(`${characterWith100AtkBar.name} - ${characterWith100AtkBar.attackBarEmoji}`);
                break; // Exit the loop
            } else if (charactersWith100AtkBar.length > 1) {
                // If multiple characters have reached 100 attack bar, determine the next turn based on speed
                let fastestCharacter = charactersWith100AtkBar[0];
                for (const character of charactersWith100AtkBar) {
                    if (character.atkBar > fastestCharacter.atkBar) {
                        fastestCharacter = character;
                    }
                }
                console.log(`${fastestCharacter.name} has the highest atkBar and will take the next turn.`);
                this.currentTurn = fastestCharacter.name;
                fastestCharacter.attackBarEmoji = await this.generateAttackBarEmoji(fastestCharacter.atkBar);

                console.log(`${fastestCharacter.name} - ${fastestCharacter.atkBar} - ${fastestCharacter.attackBarEmoji}`);
                fastestCharacter.atkBar -= 100;
                break; // Exit the loop
            }
        }
        await this.fillHpBars()
        return nextTurn;
    }

    async performTurn(message) {
        // const attacker = this.currentTurn;
        // this.getNextTurn()
        console.log('currentTurn:', this.currentTurn)
        // If the current turn is the player, let the player choose a move
        if (this.currentTurn === this.playerName) {
            // const move = attacker.chooseMove(); // Implement this method for the player
          
            const target = this.enemyToHit.name 
            const damage = calculateDamage(this.player.stats.attack, this.enemyToHit.stats.defense);

            // Update HP and battle logs
            this.enemyToHit.stats.hp -= damage;
            this.battleLogs.push(`+ ${this.currentTurn} attacks ${target} for ${damage} damage using gayness`);
            console.log('loglength:', this.battleLogs.length)
            console.log(`${this.currentTurn} attacks ${target} for ${damage} damage using gayness`)
            // this.getNextTurn()
            // console.log('currentTurn:', this.currentTurn);
        } else if (this.playerFamiliar.includes(this.currentTurn)) {
            const target = this.enemyToHit.name; // Implement target selection logic
            let damage = 0;

            // Loop through the familiars to find the attacking familiar
            for (const familiar of this.familiarInfo) {
                if (familiar.name === this.currentTurn) {
                    // Calculate damage for the attacking familiar
                    damage = calculateDamage(familiar.stats.attack, this.enemyToHit.stats.defense);

                    // Update HP and battle logs
                    this.enemyToHit.stats.hp -= damage;
                    this.battleLogs.push(`+ ${this.currentTurn} attacks ${target} for ${damage} damage using an attack`);
                    console.log(`${this.currentTurn} attacks ${target} for ${damage} damage using an attack`);
                    break; // Exit the loop once the attacking familiar is found
                }
            }

            // Set the current turn to the boss's name

        }
        // this.currentTurn = this.currentTurn === this.player ? this.boss.name : this.playerName;

    }

    async performEnemyTurn(message) {
      for (const enemies of this.allEnemies) {
        console.log('enemyname:', enemies.name)
         if (enemies.name === this.currentTurn &&  !this.deadEnemies.includes(enemies.name)) {
           console.log('enemy:', enemies)
          console.log('OK BRO IT IS WORKINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')
          let isTargetingPlayer;
            // If the current turn is the environment, let it make a move
            // const move = this.environment.makeMove();
              isTargetingPlayer = Math.random() < 0.3; // 30% chance to target the player

          const aliveFamiliars = this.familiarInfo.filter(familiar => familiar.stats.hp > 0);
          console.log('length LMAOAWDOJAIHFIAJFOIAJDFFASIF: ', aliveFamiliars.length)
          if (aliveFamiliars.length < 1) {
            isTargetingPlayer = true;
          }
        const targetInfo = isTargetingPlayer ? this.player : aliveFamiliars[Math.floor(Math.random() * aliveFamiliars.length)];

            const target = targetInfo.name;
            console.log('TARGETNAME:', target)   
            const damage = calculateDamage(this.boss.stats.attack, targetInfo.stats.defense);

            // Update HP and battle logs
            targetInfo.stats.hp -= damage;
            console.log('My turn now bitches')
            this.battleLogs.push(`- ${this.currentTurn} attacks ${target} for ${damage} damage using cum!\n ============================================`);
            // message.channel.send(`\`\`\`${logsString}\`\`\``);
            console.log('loglength:', this.battleLogs.length)
            console.log(`${this.currentTurn} attacks ${target} for ${damage} damage using cum!`)
            await this.getNextTurn()
            console.log('currentTurnForDragonafter;', this.currentTurn)
            
            //  const updatedEmbed = await this.sendInitialEmbed(message);
            // this.initialMessage.edit({ embeds: [updatedEmbed], components: await this.getDuelActionRow() });

            // console.log('currentTurn:', this.currentTurn);
        }
      }
        if (this.currentTurn != this.boss.name) {
            console.log('notmy turn bitches')
            return
        } else if (this.currentTurn === this.boss.name) {
          let isTargetingPlayer;
            // If the current turn is the environment, let it make a move
            // const move = this.environment.makeMove();
              isTargetingPlayer = Math.random() < 0.3; // 30% chance to target the player
          
          const aliveFamiliars = this.familiarInfo.filter(familiar => familiar.stats.hp > 0);
          console.log('length LMAOAWDOJAIHFIAJFOIAJDFFASIF: ', aliveFamiliars.length)
          if (aliveFamiliars.length < 1) {
            isTargetingPlayer = true;
          }
    const targetInfo = isTargetingPlayer ? this.player : aliveFamiliars[Math.floor(Math.random() * aliveFamiliars.length)];

            const target = targetInfo.name;
            console.log('TARGETNAME:', target)   
            const damage = calculateDamage(this.boss.stats.attack, targetInfo.stats.defense);

            // Update HP and battle logs
            targetInfo.stats.hp -= damage;
            console.log('My turn now bitches')
            this.battleLogs.push(`- ${this.currentTurn} attacks ${target} for ${damage} damage using cum!\n ============================================`);
            // message.channel.send(`\`\`\`${logsString}\`\`\``);
            console.log('loglength:', this.battleLogs.length)
            console.log(`${this.currentTurn} attacks ${target} for ${damage} damage using cum!`)
            await this.getNextTurn()
            console.log('currentTurnForDragonafter;', this.currentTurn)
            //  const updatedEmbed = await this.sendInitialEmbed(message);
            // this.initialMessage.edit({ embeds: [updatedEmbed], components: await this.getDuelActionRow() });

            // console.log('currentTurn:', this.currentTurn);
        }
     
    }



   async printBattleResult() {
        // Implement code to display the battle result (victory, defeat, or draw)
                          // this.printBattleResult();
                          let updatedEmbed
                          for (const character of this.allEnemies)  {
                            if (character.stats.hp < 0 && !this.deadEnemies.includes(character.name)) {
                                  this.battleLogs.push(`${character.name} died poggers`)
                                  character.stats.speed = 0;
                                  character.atkBar = 0;
                                  character.stats.hp = 0;
                                  this.deadEnemies.push(character.name)
                                  console.log('ALIVEFAM:', this.aliveEnemies)
                                  this.aliveEnemies.pop(character)
                                  console.log('ALIVEFAM:', this.aliveEnemies)
                                   break;
                              }
                          }
                     for (const character of this.familiarInfo)  {
                      if (character.stats.hp < 0 && !this.aliveFam.includes(character.name)) {
                            this.battleLogs.push(`${character.name} died lol`)
                            character.stats.speed = 0;
                            character.atkBar = 0;
                            character.stats.hp = 0;
                            this.aliveFam.push(character.name)
                            console.log('ALIVEFAM:', this.aliveFam)
                             break;
                        }
                    }
                    if (this.aliveEnemies.length === 0) {
                        const rewards = this.enemyDetails.rewards
                        if (this.player.activeQuests) {
                            for (const activeQuestName in this.player.activeQuests) {
                                if (this.player.activeQuests.hasOwnProperty(activeQuestName)) {
                                  const activeQuestDetails = quests[activeQuestName];
                                  const activeQuestDetails2 = this.player.activeQuests[activeQuestName];
                                  console.log(`stuffHere: ${activeQuestDetails.title}`)
                                  console.log(`stuffHere: ${activeQuestDetails2.objectives[0]}`)
                                  }
                              } 
                        } try {
                            const filter = { _id: this.player._id };
                        const playerData2 = await collection.findOne(filter)
                         if (playerData2) {
                            // Create an object with only the xp property to update
                            const updates = {
                                $inc: { 'exp.xp': rewards.experience, 'balance.coins': rewards.gold },
                                };
                        console.log('rewards.xpereince:', rewards.experience)
                            // Update the player's document with the xpUpdate object
                            await collection.updateOne(filter, updates);
                        
                            console.log('Player XP updated:', updates);
                          } else {
                            console.log('Player not found or updated.');
                          }
                        } catch (error) {
                          console.error('Error updating player XP:', error);
                        }
   
                        this.battleEmbed.setFields({
                            name: `You won the battle against the Monster, you can continue the journey where you left off (I lied  you can't)!!`,
                            value: `Rewards:\n Exp: ${rewards.experience}, Gold: ${rewards.gold}`,
                            inline: true,
                        })
                        this.battleEmbed.setDescription(`GGs You've won`)
                        this.initialMessage.edit({
                            embeds: [this.battleEmbed],
                            components: []
                        });
                    } else if (this.player.stats.hp < 0) {
                        this.message.channel.send("You lost, skill issue.")
                      this.player.stats.speed = 0;
                    } else {
                     updatedEmbed = await this.sendInitialEmbed(this.message);
                     this.initialMessage.edit({
                        embeds: [updatedEmbed],
                        components: await this.getDuelActionRow()
                    });
                }
    }
}

module.exports = {
    Battle,
};