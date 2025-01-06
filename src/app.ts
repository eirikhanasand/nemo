import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import config from './utils/config.js'
import { 
    ChatInputCommandInteraction, 
    Client, 
    Collection, 
    Events, 
    GatewayIntentBits, 
    Interaction, 
    InteractionType, 
    Message, 
    MessageReaction, 
    Partials, 
    TextChannel, 
    User 
} from 'discord.js'
import handleComponents from './utils/handleComponents.js'
import validCommands from './utils/valid.js'
import Autocomplete from './utils/autoComplete.js'
import getID from './utils/getID.js'
import { PREPARATION_CHANNEL_NAME } from '../constants.js'
import deleteAndRecreate from './utils/deleteAndRecreate.js'

global.preppedTasks = new Map
global.finished = new Map

const token = config.token
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.User,
    ],
}) as any

client.commands = new Collection()
const foldersPath = join(__dirname, 'commands')
const commandFolders = readdirSync(foldersPath)

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder)
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'))
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file)
        const command = await import(filePath)
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command)
		} else {
			console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
}

client.once(Events.ClientReady, async () => {
    // Tries to locate prepped tasks channel
    for (const [, guild] of client.guilds.cache) {
        try {
            const channels = await guild.channels.fetch()
            for (const [, channel] of channels) {
                if (channel?.isTextBased() && ('name' in channel) && channel?.name?.includes('prepped-tasks')) {
                    deleteAndRecreate(channel)
                }
            }
        } catch (error) {
            console.error(`Failed to fetch channels for guild ${guild.name}:`, error)
        }
    }

    console.log("Ready!")
})

client.on(Events.InteractionCreate, async (interaction: Interaction<"cached">) => {
    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
        Autocomplete(interaction)
        return
    }

    const chatInteraction = interaction as ChatInputCommandInteraction

	if (!interaction.isChatInputCommand() && !('customId' in interaction)) {
        console.error('Input is not a command nor interaction.')
        return
    }

    const command = client.commands.get(chatInteraction.commandName)
    if (!command && !('customId' in chatInteraction)) {
        return
    }

    if (validCommands.includes(chatInteraction.commandName) || ('customId' in interaction && validCommands.includes(interaction.customId as string))) {
        return handleComponents(chatInteraction, getID(chatInteraction.commandName))
    }

    if (!command) {
        return
    }

    await command.execute(interaction)
})

client.on(Events.MessageReactionAdd, async (reaction: MessageReaction, user: User) => {
	// Checks if a reaction is partial, and if so fetches the entire structure
	if (reaction.partial) {
		try {
			await reaction.fetch()
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error)
			return
		}
	}

    if (!(reaction.message.channel instanceof TextChannel) || !reaction.message.channel.name.includes(PREPARATION_CHANNEL_NAME)) {
        // DMs not supported
        return
    }

    console.log("detected add")
    deleteAndRecreate(reaction.message.channel)
})

client.on(Events.MessageReactionRemove, async (reaction: MessageReaction, user: User) => {
	// Checks if a reaction is partial, and if so fetches the entire structure
	if (reaction.partial) {
		try {
			await reaction.fetch()
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error)
			return
		}
	}

    if (!(reaction.message.channel instanceof TextChannel) || !reaction.message.channel.name.includes(PREPARATION_CHANNEL_NAME)) {
        // DMs not supported
        return
    }

    console.log("detected remove")
    deleteAndRecreate(reaction.message.channel)
})

client.on(Events.MessageCreate, async (message: Message) => {
    console.log("message created, deleteAndRecreate called")
    if (message.channel instanceof TextChannel) {
        deleteAndRecreate(message.channel)
    }
})

client.login(token)

process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Promise Rejection:\n", err)
})

process.on("uncaughtException", async (err) => {
    console.error("Uncaught Promise Exception:\n", err)
})

process.on("uncaughtExceptionMonitor", async (err) => {
    console.error("Uncaught Promise Exception (Monitor):\n", err)
})

export default client
