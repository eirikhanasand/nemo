import { load } from 'cheerio'
import sanitize from '../../utils/sanitize.js'
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js'

const HAYDAY_LOGO = 'https://hayday.com/graphics/misc/hero_logo.png'

export const data = new SlashCommandBuilder()
    .setName('product')
    .setDescription('Info for a specific product or item in the game.')
    .addStringOption((option) => option
        .setName('product')
        .setDescription('Product or item to get info for')
        .setRequired(true)
    )

export async function execute(message: ChatInputCommandInteraction) {
    const product = sanitize(message.options.getString('product') || "")
    const name = `${product[0].toLocaleUpperCase()}${product.slice(1).toLocaleLowerCase()}`
    const info = await fetchAndConvertToJson(name)
    const type = info?.pageContent[0] || ''
    const xp = (info?.pageContent[1].match(/\d/) || [''])[0]
    const fields = []
    if (type) {
        fields.push({name: "Type", value: type, inline: true})
    }
    if (xp) {
        fields.push({name: "XP", value: `Level ${xp}`, inline: true})
    }

    const embed = new EmbedBuilder()
        .setTitle(name)
        .setDescription(info?.pageContent.join(' ').slice(0, 2000) || '')
        .setColor("#fd8738")
        .setThumbnail(info?.image || HAYDAY_LOGO)
        .setTimestamp()
        .setURL(`https://hayday.fandom.com/wiki/${product}`)
        .addFields(fields)
    await message.reply({ embeds: [embed]})
}

async function fetchAndConvertToJson(product: string) {
    try {
        const response = await fetch(`https://hayday.fandom.com/wiki/${product}`)
        if (!response.ok) {
            throw new Error(await response.text())
        }

        const html = await response.text()
        const $ = load(html)

        const imgTag = $(`img[alt=${product}]`)
        // @ts-ignore
        const image = imgTag['0'].parent.attribs.href || HAYDAY_LOGO

        const a = $('.page-content')
            .text()
            .replaceAll(/<iframe[^>]*>[^<]*<\/iframe>/g, '')
            .replaceAll(/\t +/g, '\t')
            .replaceAll(/\t+/g, '')
            .replaceAll(/\n+/g, '\n')
            .replaceAll(/<img[^>]*>/g, '')
            .replaceAll(/<a[^>]*><\/a>/g, '')
            .trim()
        const irrelvant = a.indexOf("See also")
        const pageContent = a.slice(0, irrelvant)
        const strategy = pageContent.split("Strategy tips")
        const products = strategy[0].includes('products:') 
            ? strategy[0].split('products:')[1] 
            : strategy[0].includes('Products') 
                ? strategy[0].split('Products')[1] 
                : strategy[0]

        return {
            title: $('h1#firstHeading').text().trim(),
            introduction: $('#mw-content-text p').first().text().trim(),
            pageContent: strategy[0].trim().split('products:')[0].split('\n'),
            products: products.trim().split('\n'),
            strategy: strategy[1].trim().split('\n'),
            image
        }
    } catch (error) {
        console.error('Error fetching and converting HTML to JSON:', error)
    }
}
