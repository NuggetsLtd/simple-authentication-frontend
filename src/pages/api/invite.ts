import NodeCache from 'node-cache'
import dotEnv from 'dotenv'

// load env vars from .env file
dotEnv.config()

const cache = new NodeCache()

const communicatorProtocol = process.env.COMMUNICATOR_PROTOCOL
const communicatorHost = process.env.COMMUNICATOR_HOST
const communicatorPort = process.env.COMMUNICATOR_PORT

const reasons = {
  auth: 'auth'
}

export default async function handler(req, res) {
  // check for valid reason
  const reason = reasons[req?.query?.reason]

  if (!reason) {
    console.log(`Invalid reason: ${req?.query?.reason}`)
    return res.status(400).json({ error: 'Invalid reason' })
  }

  console.log(`${communicatorProtocol}://${communicatorHost}:${communicatorPort}/invitation/generate`)

  const response = await fetch(`${communicatorProtocol}://${communicatorHost}:${communicatorPort}/invitation/generate`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "format": "svg",
    })
  })
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  const data = await response.json()
 
  // store invite reason in cache for 5 minutes
  cache.set(`invite_${reason}_${data.ref}`, true, 60 * 5)

  return res.status(200).json(data);
}
