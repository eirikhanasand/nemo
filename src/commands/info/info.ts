import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Info regarding the bot.')
export async function execute(message: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('Info')
        .setDescription('Im here to make your Hayday experience a bit more convenient.')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Created", value: "03.01.25", inline: true},
            {name: "Updated", value: "07.01.25", inline: true},
            { name: "Source code", value: "https://github.com/eirikhanasand/nemo", inline: false },
        )

    await message.reply({ embeds: [embed]})
}
