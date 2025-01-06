export default function getReactionsFromEmbedFields(fields: Field[]): string[] {
    const reactions: string[] = []

    for (const field of fields) {
        const match = field.name.match(/<(:\w+:\d+>)/)

        if (match) {
            reactions.push(match[1])
        }
    }

    return reactions
}
