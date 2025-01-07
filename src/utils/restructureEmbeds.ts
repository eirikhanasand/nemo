import { EmbedBuilder, MessageReaction } from "discord.js";

export default async function restructureEmbeds(reaction: MessageReaction, action: Reaction) {
    const embeds = global.preppedTasks.get(reaction.message.channelId)
    
    if (!embeds) {
        console.error(`Tried going to the previous page in ${reaction.message.channelId}, but found no embeds.`)
        return
    }

    console.log("restructuring", embeds)
    const newEmbeds: EmbedBuilder[] = []

    // get all the fields
    for (const embed of embeds) {
        console.log("field", embed.data.fields)
    }
    // add the new field
    // create the new embed

    global.preppedTasks.set(reaction.message.channelId, newEmbeds)
}
