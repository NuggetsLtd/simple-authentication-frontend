import dotEnv from 'dotenv'
import { randomBytes } from 'crypto'
import cache from '../../helpers/cache'

// load env vars from .env file
dotEnv.config()

const apiToken = process.env.WEBHOOK_API_TOKEN
const communicatorProtocol = process.env.COMMUNICATOR_PROTOCOL
const communicatorHost = process.env.COMMUNICATOR_HOST
const communicatorPort = process.env.COMMUNICATOR_PORT
const INVITE_PROCESSED = 'PROCESSED'
const reasons = {
  auth: 'auth'
}

export default async function handler(req, res) {
  console.log('> didcomm', req.body)

  const authHeader = req?.headers?.authorization
  const msg = req?.body?.msg


  if (!authHeader) {
    return res.status(401).json({ error: 'Token required' })
  }

  const tokenRegExArray = /^Token token=([0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.exec(authHeader || "")

  // check token against expected
  if(tokenRegExArray === null || tokenRegExArray[1] !== apiToken) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // TODO: check DIDComm message format

  switch (msg.type) {
    case 'https://didcomm.org/connections/1.0/invitation':
      return handleConnection(res, msg)

    default:
      return res.status(404).json({ error: 'Message Type Not Found' })
  }
}

const handleConnection = async (res, msg) => {
  console.log('> didcomm: handleConnection', `invite_${msg.thid}`)

  // check for matching cached invite
  const inviteReason = await cache.get(`invite_${msg.thid}`)

  if (!inviteReason) {
    return res.status(404).json({ error: 'Invite Not Found' })
  }

  if (inviteReason === INVITE_PROCESSED) {
    return res.status(200).json('OK')
  }

  // check invite type matches DIDComm message type
  if (inviteReason !== 'auth') {
    return res.status(404).json({ error: 'Invite Type Not Found' })
  }

  // convert reference string to 32 byte padded hex
  const paddedReference = `0x${Buffer.from(msg.thid, 'ascii').toString('hex').padEnd(64, '0')}`

  const signatureResponse = await fetch(`${communicatorProtocol}://${communicatorHost}:${communicatorPort}/account/signature`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [paddedReference]
    })
  })

  const { signature } = await signatureResponse.json()
  const VCProofNonce = randomBytes(50).toString('base64')

  // send message to user for auth
  const response = await fetch(`${communicatorProtocol}://${communicatorHost}:${communicatorPort}/message/send`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: [msg.from],
      payload: {
        msg: {
          requestDataShareAuthentication: {
            reference: paddedReference,
            signature,
            VCProofNonce
          },
          requestType: 'dataShareAuthentication'
        },
        threadId: msg.thid
      }
    })
  })


  // store session reason in cache for 5 minutes
  await Promise.all([
    cache.set(`session_${msg.thid}`, { VCProofNonce }, 60 * 5),
    cache.set(`invite_${msg.thid}`, INVITE_PROCESSED, 60 * 5)
  ])

  console.log('< didcomm: handleConnection')

  return res.status(200).json("OK")
}
