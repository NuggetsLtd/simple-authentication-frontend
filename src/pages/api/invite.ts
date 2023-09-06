import dotEnv from 'dotenv'
import cache from '../../helpers/cache'

// load env vars from .env file
dotEnv.config()

const communicatorProtocol = process.env.COMMUNICATOR_PROTOCOL
const communicatorHost = process.env.COMMUNICATOR_HOST
const communicatorPort = process.env.COMMUNICATOR_PORT

const reasons = {
  auth: 'auth'
}

export default async function handler(req, res) {
  console.log('> generate invite')
  // check for valid reason
  const reason = reasons[req?.query?.reason]

  if (!reason) {
    return res.status(400).json({ error: 'Invalid reason' })
  }

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
  await cache.set(`invite_${data.ref}`, reason, 60 * 5)

  console.log('< generate invite')

  return res.status(200).json(data);
}
