import { Message } from "discord.js"

export default async function react(message: Message, reactions: string[]) {
    try {
        await Promise.all(reactions.map(reaction => message.react(reaction)))
    } catch (error) {
        console.error('Error adding reactions:', error)
    }
}
