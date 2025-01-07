import { Message, MessageEditOptions, MessagePayload } from "discord.js"

export default async function editOnlyIfWithinASecond(message: Message, content: string | MessageEditOptions | MessagePayload) {
    try {
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Message edit timed out")), 1000)
        )

        await Promise.race([
            message.edit(content),
            timeout
        ])

        console.log("Message edited successfully!")
    } catch (error: any) {
        console.error(`Failed to edit message: with content ${content}. Reason: ${error.message}`)
    }
}