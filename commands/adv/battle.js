const players = require('../../data/players.json');
const {
    bosses
} = require('./bosses.js');
const {
    cards
} = require('../fun/cards.js'); // Import the cards data from 'cards.js'
const {
    checkResults,
    updateMovesOnCd,
    calculateAbilityDamage,
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
    constructor(player, bossName, message) {
        this.message = message;
        this.player = player;
        this.abilityOptions = [];
        try {

            console.log('TRYING MY ARSAEAWSS OFF', this.player.selectedFamiliars)
            if (this.player.selectedFamiliars) {
                console.log('true', player.selectedFamiliars)
                this.playerFamiliar = player.selectedFamiliars.name;
                console.log('selectedplayerFamiliar:', this.playerFamiliar)
            } else if (!this.player.selectedFamiliars) {
                console.log('gay')
                this.playerFamiliar = ["Fire Dragon"];
                this.message.channel.send('You have to select your familiar first using a!selectFamiliar')
                return this.continue = false;
            }

        } catch (error) {
            console.log('No selected Familiars!', error);
        }
        this.familiarInfo = [];
        // Loop through each familiar name in the array
        console.log('TRYING MY ASS OFF', this.playerFamiliar)
        for (const familiarName of this.playerFamiliar) {
            const familiarData = cards[familiarName];
            if (familiarData) {
                this.familiarInfo.push(familiarData);
            }

        }
        this.playerName = this.player.name;
        if (this.player.class != null) {

            this.playerClass = this.player.class
            this.continue = true;
        } else if (this.player.class === null) {
            this.message.channel.send('You have to select a class first, use a!selectclass');
            return this.continue = false;

        }


        this.playerRace = this.player.race
        this.boss = bosses[bossName];
        this.currentTurn = null;
        this.mobs = null;
        this.characters = [this.player, ...this.familiarInfo, this.boss];
        for (const character of this.characters) {
           try {
            for (const character of this.characters) {  
              if (character === this.boss) {
                character.maxHp = character.physicalStats.hp
              }else if (character === this.player) {
                character.maxHp = character.stats.hitpoints
              }else {
              character.maxHp = character.stats.hp
            }
               
            }
        } catch (error) {
            console.log('fillBarError:', error);
        }
            character.atkBar = 0;
            character.attackBarEmoji = [];
            character.hpBarEmoji = [];
            console.log(character.name, '-', character.attackBarEmoji), '-', character.hpBarEmoji;
        }
        this.environment = [];
        this.currentTurnIndex = 0; // Index of the character whose turn it is
        this.turnCounter = 0; // Counter to track overall turns
        this.battleLogs = [];
        this.ability = new Ability(this);
        this.initialMessage = initialMessage;
        

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
        });
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
                    this.performTurn(message);
                    await this.getNextTurn()
                    await this.performEnemyTurn(message);
                    console.log('currentTurn:', this.currentTurn);
                    const updatedEmbed = await this.sendInitialEmbed(message);
                    this.initialMessage.edit({
                        embeds: [updatedEmbed],
                        components: await this.getDuelActionRow()
                    });


                    // this.printBattleResult();
                    if (this.boss.physicalStats.hp < 0) {
                        message.channel.send("You won the battle against the Monster, you can continue the journey where you left off (I lied  you can't)")
                    } else if (this.player.stats.hitpoints < 0) {
                        message.channel.send("You lost, skill issue.")
                    }

                } catch (error) {
                    console.error('Error on hit:', error);
                }
            }
            else if (i.customId === 'starter') {
                const selectedClassValue = i.values[0]; // Get the selected value // gae shit
                console.log('selectedValues', selectedClassValue)
                if (selectedClassValue.startsWith('player_ability_')) {
                    try {
                        const abilityName = selectedClassValue.replace('player_ability_', '');
                        console.log('abilityName:a', abilityName)
                        const abilityNameCamel = await this.toCamelCase(abilityName);
                        console.log('abilityName:a', abilityNameCamel)
                        // Check if the abilityName exists as a method in the Ability class
                        if (typeof this.ability[abilityNameCamel] === 'function') {
                            await this.ability[abilityNameCamel](this.player, this.boss);
                            await this.getNextTurn()
                            await this.performEnemyTurn(message);
                            console.log('currentTurn:', this.currentTurn);
                            const updatedEmbed = await this.sendInitialEmbed(message);
                            this.initialMessage.edit({
                                embeds: [updatedEmbed],
                                components: await this.getDuelActionRow()
                            });
                        } else {
                            console.log(`Ability ${abilityName} not found.`);
                        }
                        // this.printBattleResult();
                        if (this.boss.physicalStats.hp < 0) {
                            message.channel.send("You won the battle against the Monster, you can continue the journey where you left off (I lied  you can't)")
                        } else if (this.player.stats.hitpoints < 0) {
                            message.channel.send("You lost, skill issue.")
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
                                    this.ability[abilityNameCamel](familiar, this.boss);
                                    await this.getNextTurn()
                                    await this.performEnemyTurn(message);
                                    console.log('currentTurn:', this.currentTurn);
                                    const updatedEmbed = await this.sendInitialEmbed(message);
                                    this.initialMessage.edit({
                                        embeds: [updatedEmbed],
                                        components: await this.getDuelActionRow()
                                    });
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

            }

        });

    }
    // components: getDuelActionRow(authorCards, opponentCards, attackedUsers, opponent, authorMoves, opponentMoves)
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
        if (this.currentTurn === this.player.name) {
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


        const stringMenu = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('Make a selection!')
            .addOptions(this.abilityOptions);



        const stringMenuRow = new ActionRowBuilder().addComponents(stringMenu);



        const rows = [buttonRow, stringMenuRow];


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

                return this.boss.physicalStats.speed;
            } else {
                console.log(`Calculating speed for unknown character type: 0`);
                return 0; // Default to 0 for unknown character types
            }
        } catch (error) {
            console.log('speedcalculator:', error);
        }
    }

    async calculateOverallHp(character) {
        try {
            if (character === this.player) {

                return this.player.stats.hitpoints;

            } else if (this.playerFamiliar.includes(character.name)) {
                // Find the familiar's speed by matching it with this.familiarInfo
                const familiarInfo = this.familiarInfo.find((fam) => fam.name === character.name);
                const familiarHp = familiarInfo ? familiarInfo.stats.hp : 0; // Default to 0 if not found

                return familiarHp;
            } else if (character === this.boss) {

                return this.boss.physicalStats.hp;
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
                character.atkBar += speed * 0.07 * speedMultiplier;
                character.attackBarEmoji = await this.generateAttackBarEmoji(character.atkBar);
              if (character === this.boss) {
                character.hpBarEmoji = await this.generateHPBarEmoji(character.physicalStats.hp, character.physicalStats.hp)
              }else if (character === this.player) {
                character.hpBarEmoji = await this.generateHPBarEmoji(character.stats.hitpoints, character.stats.hitpoints)
              }else {
              character.hpBarEmoji = await this.generateHPBarEmoji(character.stats.hp, character.stats.hp)
            }
               
            }
        } catch (error) {
            console.log('fillBarError:', error);
        }
    }

     async fillHpBars() {
        try {
            for (const character of this.characters) {
               
              const hp = await this.calculateOverallHp(character);
              
              if (character === this.boss) {
                character.hpBarEmoji = await this.generateHPBarEmoji(character.physicalStats.hp, character.maxHp)
              }else if (character === this.player) {
                character.hpBarEmoji = await this.generateHPBarEmoji(character.stats.hitpoints, character.maxHp)
              }else {
              character.hpBarEmoji = await this.generateHPBarEmoji(character.stats.hp, character.maxHp)
            }
               
            }
        } catch (error) {
            console.log('fillBarError:', error);
        }
    }

    async generateAttackBarEmoji(atkBar) {
        const emoji = '■';
        let emptyBars = 0;
        const filledBars = Math.floor(atkBar / 5);

        emptyBars = Math.floor(21 - filledBars);

        if (atkBar > 100) {
            emptyBars = Math.floor(22 - filledBars);

        }


        const attackBarString = `${emoji.repeat(filledBars)}${' '.repeat(emptyBars)}`;
        return `[${attackBarString}]`;
    }

    async generateHPBarEmoji(currentHP, maxHP) {
        const emoji = '■';
        const filledBars = Math.floor((currentHP / maxHP) * 21); 
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


    async sendInitialEmbed() {
        try {
            // const filledBars = Math.floor(atkBar / 10);
            //  const emptyBars = 10 - filledBars;
            //  const attackBarString = `${'⚔️'.repeat(filledBars)}${' '.repeat(emptyBars)}`;
            console.log(this.player.name, '-inside', this.player.attackBarEmoji);
            const initialEmbed = new EmbedBuilder()
                .setTitle('Battle')
                .setDescription(`You are fighting against ${this.boss.name}`)
                .setFooter({
                    text: 'You can run if you want lol no issues'
                })
                .addFields({
                    name: `Enemies Info:`,
                    value: `\`\`\`ansi\n[2;31m> ${this.boss.name}\n[2;32m HitPoints: ${this.boss.hpBarEmoji} ${this.boss.physicalStats.hp}\n[2;36m AttackBar: [2;34m${this.boss.attackBarEmoji} ${Math.floor(this.boss.atkBar)}\`\`\``,
                    inline: false
                }, {
                    name: `Current Turn`,
                    value: `\`\`\`${this.currentTurn}\`\`\``,
                    inline: false
                }, );
            if (this.player) {
                let playerAndFamiliarsInfo = ''; // Initialize an empty string to store the info

                for (const familiar of this.familiarInfo) {
                    const familiarHP = familiar.stats.hp;
                    playerAndFamiliarsInfo += `[2;35m> ${familiar.name}\n[2;32m HitPoints: ${familiar.hpBarEmoji}  ${familiarHP}\n[2;36m AttackBar: [2;34m${familiar.attackBarEmoji} ${Math.floor(familiar.atkBar)}\n`;
                }

                // Add the player's HP and AttackBar to the info
                playerAndFamiliarsInfo += `[2;35m> ${this.playerName}\n[2;32m HitPoints: ${this.player.hpBarEmoji} ${this.player.stats.hitpoints}\n[2;36m AttackBar: [2;34m${this.player.attackBarEmoji} ${Math.floor(this.player.atkBar)}`;

                initialEmbed.addFields({
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

                initialEmbed.addFields({
                    name: 'Battle Logs',
                    value: '```diff\n' + this.battleLogs.join('\n') + '```',
                    inline: false
                });
            } else {
                initialEmbed.addFields({
                    name: 'Battle Logs',
                    value: 'No battle logs yet.',
                    inline: false
                });
            }
            return initialEmbed
            // return await message.channel.send({ embeds: [initialEmbed], components: [buttonRow] });
        } catch (error) {
            console.error('Error on hit:', error);
        }
        // Implement code to send an initial embed with battle information
    }

    async performTurn(message) {
        // const attacker = this.currentTurn;
        // this.getNextTurn()
        console.log('currentTurn:', this.currentTurn)
        // If the current turn is the player, let the player choose a move
        if (this.currentTurn === this.playerName) {
            // const move = attacker.chooseMove(); // Implement this method for the player
            const target = this.boss.name // Implement target selection logic
            const damage = calculateDamage(this.player.stats.attack, this.boss.physicalStats.defense);

            // Update HP and battle logs
            this.boss.physicalStats.hp -= damage;
            this.battleLogs.push(`+ ${this.currentTurn} attacks ${target} for ${damage} damage using gayness`);
            console.log('loglength:', this.battleLogs.length)
            console.log(`${this.currentTurn} attacks ${target} for ${damage} damage using gayness`)
            // this.getNextTurn()
            // console.log('currentTurn:', this.currentTurn);
        } else if (this.playerFamiliar.includes(this.currentTurn)) {
            const target = this.boss.name; // Implement target selection logic
            let damage = 0;

            // Loop through the familiars to find the attacking familiar
            for (const familiar of this.familiarInfo) {
                if (familiar.name === this.currentTurn) {
                    // Calculate damage for the attacking familiar
                    damage = calculateDamage(familiar.stats.attack, this.boss.physicalStats.defense);

                    // Update HP and battle logs
                    this.boss.physicalStats.hp -= damage;
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
        if (this.currentTurn != this.boss.name) {
            console.log('notmy turn bitches')
            return
        } else if (this.currentTurn === this.boss.name) {
            // If the current turn is the environment, let it make a move
            // const move = this.environment.makeMove();
            const target = this.playerName;
            const damage = calculateDamage(this.boss.physicalStats.attack, this.player.stats.defense);

            // Update HP and battle logs
            this.player.stats.hitpoints -= damage;
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



    printBattleResult() {
        // Implement code to display the battle result (victory, defeat, or draw)
    }
}
// const battle = new Battle(player, new Environment([monster, boss]));
// battle.startBattle();
module.exports = {
    Battle,
};