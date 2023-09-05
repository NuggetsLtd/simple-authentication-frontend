import NodeCache from 'node-cache'
import dotEnv from 'dotenv'

// load env vars from .env file
dotEnv.config()

const cache = new NodeCache()

const apiToken = process.env.WEBHOOK_API_TOKEN

const reasons = {
  auth: 'auth'
}

export default async function handler(req, res) {
  const authHeader = req?.headers?.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token required' })
  }

  const tokenRegExArray = /^Token token=([0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.exec(authHeader || "")

  // check token against expected
  if(tokenRegExArray === null || tokenRegExArray[1] !== apiToken) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // TODO: check DIDComm message format
  // TODO: check for matching cached invite
  // TODO: check invite type matches DIDComm message type
 
  // get invite reason in cache for 5 minutes
  // const x = cache.get(`invite_${reason}_${data.ref}`)

  return res.status(200).json("hello");
}
