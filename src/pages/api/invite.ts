import dotEnv from 'dotenv'
import cache from '../../helpers/cache'
import type {
  Request,
  Response,
  DIDCommMsg,
  CachedSession,
} from "./types"
import { string } from 'prop-types'

// load env vars from .env file
dotEnv.config()

const communicatorProtocol = process.env.COMMUNICATOR_PROTOCOL
const communicatorHost = process.env.COMMUNICATOR_HOST
const communicatorPort = process.env.COMMUNICATOR_PORT

const reasons = {
  auth: 'auth'
}

export default async function handler(req: Request, res: Response) {
  console.log('> generate invite')
  
  // check for valid reason
  const reason: string | null = reasons.auth === req?.query?.reason
    ? req?.query?.reason  
    : null

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
 
  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  const data = await response.json()
 
  // store invite reason in cache for 5 minutes
  cache.set(`invite_${data.ref}`, reason, 60 * 5)
  console.log('< generate invite')

  return res.status(200).json(data);
}
