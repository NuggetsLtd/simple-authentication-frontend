'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())
const TIMEOUT_MS = 1000 * 60 * 4

interface CommsInvite {
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly data: {
    readonly deeplink: string;
    readonly qrCode: string;
    readonly ref: string;
  } | null;
}

const defaultInvite: CommsInvite = {
  isLoading: false,
  error: null,
  data: null,
}

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
  button: {
    backgroundColor: "#006DFF",
    marginBottom: "10px",
    width: "200px",
    color: "#fff",
    lineHeight: "20px",
    fontSize: "16px",
    fontWeight: 700,
    borderRadius: "4px",
    textAlign: "center",
    textTransform: "uppercase",
    padding: "14px 26px",
    outline: "none",
    border: "none",
    boxShadow: "0 1px 3px 1px rgba(0, 0, 0, 0.1)",
    transition: "color 0.3s ease, background 0.3s ease, opacity 0.3s ease"
  },
  buttonHover: {
    opacity: 0.8,
  },
}

const InviteForm = (props: { handleInvite: Function }) => {
  const { handleInvite } = props
  const [isHover, setIsHover] = useState(false)

  const handleMouseEnter = () => setIsHover(true)
  const handleMouseLeave = () => setIsHover(false)

  return <button
      style={isHover ? { ...styles.button, ...styles.buttonHover } : styles.button}
      onClick={() => handleInvite('auth')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >Generate Invite</button>
}

const Invite = (props: { invite: CommsInvite, inviteTimedOut: boolean}) => {
  const { invite, inviteTimedOut } = props

  if (invite?.isLoading) return <div style={styles.container}>Loading...</div>
  if (inviteTimedOut) return <div style={styles.container}>Invite timed out</div>
  if (invite?.error) return <div style={styles.container}>{invite?.error}</div>
  if (!invite?.isLoading && !invite.data) return <div style={styles.container}>Placeholder</div>

  return <a href={invite?.data?.deeplink} style={styles.container} dangerouslySetInnerHTML={{ __html: invite?.data?.qrCode || "" }}></a>
}

const InviteContainer = (props: { invite: CommsInvite, inviteTimedOut: boolean, handleInvite: Function }) => {
  const { invite, inviteTimedOut, handleInvite } = props

  return (
    <>
      <InviteForm handleInvite={handleInvite} />
      <Invite invite={invite} inviteTimedOut={inviteTimedOut} />
    </>
  )
}

const ResponseArea = (props: { ref?: string }) => {
  const { ref } = props
  const { data, error } = useSWR('/api/invite-status', url => fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ref })
  }), { refreshInterval: 1000 })

  if (data?.error) return <div>ERROR: {data.error}</div>
  if (error) return <div>ERROR: {error}</div>

  return <div>REQUEST AREA</div>
}

export default function UserCommunication () {
  const [invite, setInvite] = useState(defaultInvite)
  const [inviteTimedOut, setInviteTimedOut] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [responses, setResponses] = useState([])

  // const { data, error, isLoading } = useSWR('/api/invite', url => fetcher(`${url}?reason=${props?.reason}`))
  // fetch(`/api/invite?reason=${props?.reason}`, { method: 'GET' })
  //   .then(response => setInvite(response))
  //   .catch(error => setInvite({ isLoading: false, error, data: null }))
  
  const handleInvite = (reason: string) => {
    setInvite({ isLoading: true, error: null, data: null })

    fetch(`/api/invite?reason=${reason}`)
      // handle fetch response
      .then((res) => res.status === 200 ? res.json() : null)
      // set invite state on response parse
      .then((responseData) => {
        responseData !== null
          ? setInvite({ isLoading: false, error: null, data: responseData })
          : setInvite({ isLoading: false, error: 'Invite create failed', data: null })
      })
  }

  useEffect(() => {
    // clear response area on invite change
    setResponses([])
  }, [invite])

  if(!isPolling) {
    // log deeplink to console & ref for testing
    console.log({ deeplink: invite?.data?.deeplink, ref: invite?.data?.ref })
    
    // prevent further timeouts happening wen we're already polling
    setIsPolling(true)

    // set timeout running for invite
    setTimeout(() => setInviteTimedOut(true), TIMEOUT_MS)
  }

  // TODO: poll for updates to session cache

  return (
    <>
      <InviteContainer
        invite={invite}
        inviteTimedOut={inviteTimedOut}
        handleInvite={handleInvite}
      />
      <ResponseArea ref={invite?.data?.ref} />
    </>
  )
}
