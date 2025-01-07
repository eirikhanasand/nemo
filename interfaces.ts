import { EmbedBuilder, Role } from "discord.js"

declare module 'discord.js' {
    interface Reaction {
        _emoji: {
            name: string
        }
    }
    interface Client {
        commands: string[]
    }
}

export interface Roles {
    cache: Role[]
}

declare global {
    var preppedTasks: Map<string, EmbedBuilder[]>
    var finished: Map<string, boolean>
}

export enum Reaction {
    Add,
    Remove
}
