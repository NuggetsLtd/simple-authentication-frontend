import cache from '../../helpers/cache'

export default async function handler(req, res) {
  console.log('> invite-status', req.body)

  const ref = req?.body?.ref

  const [ inviteReason, cachedSession ] = await Promise.all([
    // check for invite status
    cache.get(`invite_${ref}`),
    // check for cached session
    cache.get(`session_${ref}`)
  ])

  if (!inviteReason) {
    return res.status(404).json({ error: 'Invite Not Found' })
  }

  console.log('< invite-status')

  if (inviteReason !== 'PROCESSED') {
    return res.status(200).json({ status: 'PENDING' }) }) 
  }

  return res.status(200).json(cachedSession)
}
