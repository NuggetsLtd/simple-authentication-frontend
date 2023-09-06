'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())
const TIMEOUT_MS = 1000 * 60 * 4

const styles = {
  container: {
    width: "100%",
    maxWidth: "200px",
    aspectRatio: "1 / 1",
    display: "flex",
    verticalAlign: "middle",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: "3px",
    color: "rgb(74, 74, 74)",
    fontFamily: "monospace",
    padding: "1px",
  },
}

export default function QrCode (props: object) {
  const [invite, setInvite] = useState({
    isLoading: true,
    error: null,
    data: null,
  })
  const [inviteTimedOut, setInviteTimedOut] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  // const { data, error, isLoading } = useSWR('/api/invite', url => fetcher(`${url}?reason=${props?.reason}`))
  // fetch(`/api/invite?reason=${props?.reason}`, { method: 'GET' })
  //   .then(response => setInvite(response))
  //   .catch(error => setInvite({ isLoading: false, error, data: null }))
  
  useEffect(() => {
    fetch(`/api/invite?reason=${props?.reason}`)
      // handle fetch response
      .then((res) => res.status === 200 ? res.json() : null)
      // set invite state on response parse
      .then((responseData) => {
        responseData !== null
          ? setInvite({ isLoading: false, error: null, data: responseData })
          : setInvite({ isLoading: false, error: 'Invite create failed', data: null })
      })
  }, [])

  if (invite?.isLoading) return <div style={styles.container}>Loading...</div>
  if (inviteTimedOut) return <div style={styles.container}>Invite timed out</div>
  if (invite?.error) return <div style={styles.container}>{invite?.error}</div>

  console.log({ deeplink: invite?.data?.deeplink, ref: invite?.data?.ref })

  if(!isPolling) {
    // prevent further timeouts happening wen we're already polling
    setIsPolling(true)

    // set timeout running for invite
    setTimeout(() => setInviteTimedOut(true), TIMEOUT_MS)
  }

  // TODO: poll for updates to session cache

  return (
    <a href={invite?.data?.deeplink} style={styles.container} dangerouslySetInnerHTML={{ __html: invite?.data?.qrCode || "" }}></a>
  )
}
