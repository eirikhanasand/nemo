// Purpose: Configures the environment variables and exports them as a single object.
import dotenv from 'dotenv'

// Configures the environment variables
dotenv.config()

// Destructures the environment variables
const { 
    DISCORD_CLIENT_ID,
    DISCORD_TOKEN,
} = process.env

// Throws an error if any of the essential environment variables are missing
if (!DISCORD_CLIENT_ID || !DISCORD_TOKEN) {
    throw new Error('Missing essential environment variables in config.')
}

// Exports the environment variables as a single object
const config = {
    clientId: DISCORD_CLIENT_ID,
    token: DISCORD_TOKEN,
}

// Exports the config object
export default config
