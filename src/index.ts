import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import config from '#config'
import {
    ActivityType,
    Client,
    Collection,
    EmbedBuilder,
    Events,
    GatewayIntentBits,
    InteractionType,
    Partials,
    TextChannel
} from 'discord.js'
import type {
    ChatInputCommandInteraction,
    Interaction,
    Message,
    MessageReaction,
    User
} from 'discord.js'
import handleComponents from '#utils/handleComponents.ts'
import validCommands from '#utils/valid.ts'
import Autocomplete from '#utils/autoComplete.ts'
import getID from '#utils/getID.ts'
import { PREPARATION_CHANNEL_FORMAT } from '#constants'
import deleteAndRecreate from '#utils/deleteAndRecreate.ts'
import restructureEmbeds from '#utils/restructureEmbeds.ts'
import { Reaction } from '#interfaces'

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
    presence: {
        activities: [{ type: ActivityType.Playing, name: "Hay Day" }],
        status: "online",
    },
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

    if (!(reaction.message.channel instanceof TextChannel)) {
        // DMs not supported
        return
    }

    if (reaction.message.channel.name.includes(PREPARATION_CHANNEL_FORMAT)) {
        if (reaction.message.author?.username === 'Nemo') {
            const name = reaction.emoji.name || ''
            if (reaction.message.author.id !== user.id) {
                reaction.users.remove(user)
                const task = reaction.message.embeds[0].fields.find((field) => field.name.includes(name))?.name || "❌ Unknown"
                const names = reaction.message.embeds[0].fields.find((field) => field.name.includes(name))?.value || "❌ Unknown"
                const formattedNames = names.split('\n').join(' ')
                const embed = new EmbedBuilder()
                    .setTitle(task)
                    .setDescription(`Task ready according to <@${user.id}>!`)
                    .setColor('#fd8732')
                    .setTimestamp()

                const channelName = (reaction.message.channel.name.match(/[a-z|A-Z]+/) || [])[0]
                const derbyChannel = reaction.message.guild?.channels.cache.find((channel) => channel.name.endsWith(`${channelName}-derby`)) as TextChannel
                if (derbyChannel) {
                    derbyChannel.send({ content: formattedNames, embeds: [embed] })
                } else {
                    console.error(`Found no channel named ${channelName}-derby. Unable to ping.`)
                }
            }
            return
        }

        restructureEmbeds(reaction, user, Reaction.Add)
    }
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

    if (!(reaction.message.channel instanceof TextChannel)) {
        // DMs not supported
        return
    }

    restructureEmbeds(reaction, user, Reaction.Remove)
})

client.on(Events.MessageCreate, async (message: Message) => {
    // No functionality requires this yet
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
