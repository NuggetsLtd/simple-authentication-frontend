import dotEnv from 'dotenv'
import { randomBytes } from 'crypto'
import cache from '../../helpers/cache'
import type {
  Request,
  Response,
  DIDCommMsg,
  CachedSession,
} from "./types"
import ActiveDirectory from 'activedirectory2'

// load env vars from .env file
dotEnv.config()

const TIMEOUT_MS = 60 * 5
const apiToken = process.env.WEBHOOK_API_TOKEN
const communicatorProtocol = process.env.COMMUNICATOR_PROTOCOL
const communicatorHost = process.env.COMMUNICATOR_HOST
const communicatorPort = process.env.COMMUNICATOR_PORT
const INVITE_PROCESSED = 'PROCESSED'
const reasons = {
  auth: 'auth'
}
const adConfig = {
  url: process.env.AD_URL,
  baseDN: process.env.AD_BASE_DN,
  username: process.env.AD_USERNAME,
  password: process.env.AD_PASSWORD,
}

const ad = new ActiveDirectory(adConfig);

const findADUser = async (givenName?: string, familyName?: string): Promise<AdUser | undefined> => {
  if (!givenName || !familyName) {
    return Promise.reject("Given name and family name required")
  }

  return new Promise((resolve, reject) => {
    ad.findUser(`CN=${givenName} ${familyName},OU=Users,OU=ad-demo,${adConfig.baseDN}`, function(err: any, user: any) {
      if (err) {
        reject(err)
      }
      resolve(user)
    })
  })
}

export default async function handler(req: Request, res: Response) {
  const authHeader = req?.headers?.authorization
  const msg: DIDCommMsg = req?.body?.msg
  
  console.log('> didcomm', msg?.thid)

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

    case 'https://didcomm.org/basicmessage/1.0/message':
      return handleBasicMessage(res, msg)

    default:
      return res.status(404).json({ error: 'Message Type Not Found' })
  }
}

const handleConnection = async (res: Response, msg: DIDCommMsg) => {
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

  await cache.set(`session_${msg.thid}`, { status: 'CONNECTED' }, TIMEOUT_MS)

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
    cache.set(`session_${msg.thid}`, { status: 'DATA_REQUESTED', VCProofNonce }, TIMEOUT_MS),
    cache.set(`invite_${msg.thid}`, INVITE_PROCESSED, TIMEOUT_MS)
  ])

  console.log('< didcomm: handleConnection')

  return res.status(200).json("OK")
}

const handleBasicMessage = async (res: Response, msg: DIDCommMsg) => {
  console.log('> didcomm: handleBasicMessage', msg?.thid)

  const VCProof = msg?.body?.authenticationOutcome?.userData?.identityVCProof

  // retrieve nonce from session cache
  const cachedSession: CachedSession | undefined = await cache.get(`session_${msg.thid}`)

  if (!cachedSession) {
    return res.status(404).json({ error: 'Session Not Found' })
  }

  const nonce = cachedSession?.VCProofNonce

  // store session in cache
  await cache.set(`session_${msg.thid}`, {
    status: 'VC_RECEIVED',
    VCProofNonce: nonce,
    VCProof,
  }, TIMEOUT_MS)

  // verify vc proof with nonce
  const response = await fetch(`${communicatorProtocol}://${communicatorHost}:${communicatorPort}/account/verify-proof`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      VCProof,
      nonce
    })
  })

  const { verified } = await response.json()

  // check for matching user in Active Directory
  const adUser = await findADUser(VCProof?.credentialSubject?.givenName, VCProof?.credentialSubject?.familyName)
    .catch((err) => {
      console.error('>>> AD MATCH ERROR', err)
    })
  console.log('>>> AD USER', adUser)

  const username = adUser?.sAMAccountName

  // TODO: generate MFA code and send to user

  // store session in cache
  await cache.set(`session_${msg.thid}`, {
    status: 'COMPLETE',
    VCProofNonce: nonce,
    VCProof,
    verified,
    adUserFound: !!username
  }, TIMEOUT_MS)

  console.log('< didcomm: handleBasicMessage', msg?.thid)

  return res.status(200).json("OK")
}
