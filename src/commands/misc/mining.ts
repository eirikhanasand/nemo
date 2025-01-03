import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'

const DYNAMITE_WEIGHT = 2
const TNT_WEIGHT = 3
const SHOVEL_WEIGHT = 4
const PICKAXE_WEIGHT = 5

export const data = new SlashCommandBuilder()
    .setName('mining')
    .setDescription('Mining calculator.')
    .addNumberOption((option) => option
        .setName('target')
        .setDescription('What is the amount you want to mine?')
        .setRequired(true)
        .setMinValue(0)
    )
    .addNumberOption((option) => option
        .setName('dynamite')
        .setDescription('How many dynamites do you want to use?')
        .setMinValue(0)
    )
    .addNumberOption((option) => option
        .setName('tnt')
        .setDescription('How many tnts do you want to use?')
        .setMinValue(0)
    )
    .addNumberOption((option) => option
        .setName('shovel')
        .setDescription('How many shovels do you want to use?')
        .setMinValue(0)
    )
    .addNumberOption((option) => option
        .setName('pickaxe')
        .setDescription('How many pickaxes do you want to use?')
        .setMinValue(0)
    )
export async function execute(message: ChatInputCommandInteraction) {
    const target = message.options.getNumber('target') || 0
    const dynamite = message.options.getNumber('dynamite') || 0
    const tnt = message.options.getNumber('tnt') || 0
    const shovel = message.options.getNumber('shovel') || 0
    const pickaxe = message.options.getNumber('pickaxe') || 0
    const result = calculateOres(dynamite, tnt, shovel, pickaxe)
    const missing = target - result
    const enough = result >= target
    const suggestion = getSuggestions(missing)
    const suggestions = enough ? '> You have enough tools to achieve your target.👍' : `You are missing ${missing} ores. You can use ${suggestion} to mine the remaining ${missing} ores`

    const embed = new EmbedBuilder()
        .setTitle('Do you have enough mining tools for a mining task?')
        .setDescription(`❖ Your Settings :\n> You aim to extract ${target} ores.\n> With ${dynamite}x :Dynamite: , ${tnt}x :TNT_Barrel:, ${shovel}x :Shovel:, ${pickaxe}x :Pickaxe:, you can extract ${result} ores.\n❖ Results :\n> ${suggestions}.`)
        .setColor("#fd8738")
        .setTimestamp()

    await message.reply({ embeds: [embed]})
}

function calculateOres(dynamite: number, tnt: number, shovel: number, pickaxe: number) {
    const dynamiteWeight = dynamite * DYNAMITE_WEIGHT
    const tntWeight = tnt * TNT_WEIGHT
    const shovelWeight = shovel * SHOVEL_WEIGHT
    const pickaxeWeight = pickaxe * PICKAXE_WEIGHT

    return dynamiteWeight + tntWeight + shovelWeight + pickaxeWeight
}

const toolValues = { dynamite: 2, tnt: 3, shovel: 4, pickaxe: 5 }
function getSuggestions(shortfall: number) {
    const suggestions = []
    for (const [tool, value] of Object.entries(toolValues)) {
        const quantity = Math.ceil(shortfall / value)
        suggestions.push(`${quantity}x :${tool}:`)
    }

    return suggestions.sort((a, b) => parseInt(a) - parseInt(b)).join(' or ')
}
