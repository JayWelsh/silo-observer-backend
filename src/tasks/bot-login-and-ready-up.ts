// Require the necessary discord.js classes
import fs from 'node:fs'
import path from 'node:path'
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
import dotenv from "dotenv";

dotenv.config();

const botLoginAndReadyUp = () => {
  try {
    console.log("Running login")
    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    //@ts-ignore
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '../discord-bot/commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
        //@ts-ignore
        client.commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }

    const eventsPath = path.join(__dirname, '../discord-bot/events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      if (event.once) {
        client.once(event.name, (...args: any) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args: any) => event.execute(client, ...args));
      }
    }

    // Log in to Discord with your client's token
    client.login(process.env["DISCORD_BOT_TOKEN"]);

    return client;
  } catch (e) {
    console.error(`Error logging into Discord`, e);
  }
}

export default botLoginAndReadyUp