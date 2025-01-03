export default function getID(command: string): string | undefined {
    if (!command) return undefined

    switch (command) {
        case 'remove':      return 'remove'
        case 'invite':      return 'invite'
    }

    console.error(`Command ${command} is unmapped in getID.`)
    return `${command} is unmapped in getID.`
}
