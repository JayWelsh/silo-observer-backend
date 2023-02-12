const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('path');

import dotenv from "dotenv";
dotenv.config();

const commands : String[] = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync(path.join(__dirname, '../discord-bot/commands/')).filter((file: any) => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	console.log('Adding Discord Command to Active List:', file)
	const command = require(path.join(__dirname, `../discord-bot/commands/${file}`));
	commands.push(command.data.toJSON());
}

const registerCommands = async () => {
	try {

		// Construct and prepare an instance of the REST module
		const rest = new REST({ version: '10' }).setToken(process.env["DISCORD_BOT_TOKEN"]);

		// deleting all commands

		await rest.put(Routes.applicationCommands(process.env["DISCORD_BOT_CLIENT_ID"]), { body: [] })
			.then(() => console.log('Successfully deleted all application commands.'))
			.catch(console.error);

		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env["DISCORD_BOT_CLIENT_ID"]),
      { body: commands }
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
}

export default registerCommands;