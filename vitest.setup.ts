// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Int tests use the worktree database after `npm run migrate`. Never push.
process.env.PAYLOAD_DATABASE_PUSH = 'false'
