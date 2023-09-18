'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string, options: object) => fetch(url, options).then(res => res.json())
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
interface CommsStatus {
  readonly status: string;
  readonly VCProofNonce?: string;
  readonly VCProof?: {
    readonly type: string[];
    readonly credentialSubject: {
      readonly givenName: string;
      readonly familyName: string;
    };
  };
  readonly verified?: boolean;
  readonly adUser?: {
    readonly sAMAccountName: string;
  };
  readonly mfaCode?: string;
}

const defaultCommsStatus: CommsStatus[] = []

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
    textAlign: "center" as "center",
    textTransform: "uppercase" as "uppercase",
    padding: "14px 26px",
    outline: "none",
    border: "none",
    boxShadow: "0 1px 3px 1px rgba(0, 0, 0, 0.1)",
    transition: "color 0.3s ease, background 0.3s ease, opacity 0.3s ease",
    display: "inline-block",
    cursor: "pointer",
  },
  buttonHover: {
    opacity: 0.8,
  },
  responseList: {
    listStyle: "none",
    padding: 0,
    margin: "15px 0 0 0",
    color: "#fff",
    fontFamily: "monospace",
  },
  vcHeader: {
    marginBottom: "15px",
  },
  vcItem: {
    marginLeft: "40px",
  },
  vcItemButton: {
    marginTop: "40px",
  },
  adTable: {
    margin: "15px 0 15px 40px",
  }
}

const statusMap = {
  PENDING: '⏳ Awaiting User Connection',
  DATA_REQUESTED: '➡️ Name Proof Requested from User',
  VC_RECEIVED: '⬅️ Name Proof Received',
  COMPLETE: '✅ Proof Verified',
}

const InviteForm = (props: { handleGenerateInvite: Function }) => {
  const { handleGenerateInvite } = props
  const [isHover, setIsHover] = useState(false)

  const handleMouseEnter = () => setIsHover(true)
  const handleMouseLeave = () => setIsHover(false)

  return <button
      style={isHover ? { ...styles.button, ...styles.buttonHover } : styles.button}
      onClick={() => handleGenerateInvite('auth')}
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

const InviteContainer = (props: { invite: CommsInvite, inviteTimedOut: boolean, handleGenerateInvite: Function }) => {
  const { invite, inviteTimedOut, handleGenerateInvite } = props

  return (
    <>
      <InviteForm handleGenerateInvite={handleGenerateInvite} />
      <Invite invite={invite} inviteTimedOut={inviteTimedOut} />
    </>
  )
}

const ResponseArea = (props: { reference?: string }) => {
  const { reference } = props
  const [responses, setResponses] = useState(defaultCommsStatus)
  const [refreshInterval, setRefreshInterval] = useState(500)
  const [isHover, setIsHover] = useState(false)

  const handleMouseEnter = () => setIsHover(true)
  const handleMouseLeave = () => setIsHover(false)

  const { data, error, isLoading, isValidating } = useSWR(reference, ref => fetcher('/api/invite-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ref })
  }), { refreshInterval, revalidateOnMount: true, keepPreviousData: false, revalidateIfStale: true })

  if (data?.error) return <div>ERROR: {data.error}</div>
  if (error) return <div>ERROR: {error}</div>
  if (reference && !data) return <div>loading...</div>

  if(reference && !responses.length) {
    setResponses([{ status: 'PENDING' }])
  } else if (responses.length && data?.status !== responses[responses.length - 1]?.status) {
    setResponses([...responses, data])
  }

  // stop polling once we've got a complete response
  if (refreshInterval !== 0 &&  data?.status === 'COMPLETE') setRefreshInterval(0)

  const responseMessage: Function = (response: CommsStatus, previousStatus: string) => {
    switch (response?.status) {
      case 'DATA_REQUESTED':
        return (
          <>
            <div>🤝 Connected with User</div>
            <div>➡️ Name Proof Requested</div>
          </>
        )
      case 'COMPLETE':
        return response?.verified
          ? (
            <>
              {previousStatus !== 'VC_RECEIVED' && <div>{statusMap.VC_RECEIVED}</div>}
              <div style={styles.vcHeader}>{statusMap.COMPLETE}</div>
              <div style={styles.vcItem}>Type: <strong>{response?.VCProof?.type.join(', ')}</strong></div>
              <div style={styles.vcItem}>Name: <strong>{response?.VCProof?.credentialSubject?.givenName} {response?.VCProof?.credentialSubject?.familyName}</strong></div>
              <div style={styles.vcItem}>AD User Match: {response?.adUser ? '✅' : '❌'}</div>
              <div style={styles.vcItem}>MFA Code: <strong>{response?.mfaCode}</strong></div>
              <div style={{...styles.vcItem,...styles.vcItemButton}}>
                <a
                  style={isHover ? { ...styles.button, ...styles.buttonHover } : styles.button}
                  href={`workspaces://${response?.adUser?.sAMAccountName}@SLiad+F9RMW4?MFACode=${response?.mfaCode}`} 
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >Workspace Login</a>
              </div>
            </>
          )
          : '❌ Proof Verification Failed'
      case 'PENDING':
        return statusMap.PENDING
      case 'VC_RECEIVED':
        return statusMap.VC_RECEIVED
    }
  }

  if (data?.status === 'COMPLETE' && data?.verified) {
    window.location.assign(`workspaces://${data?.adUser?.sAMAccountName}@SLiad+F9RMW4?MFACode=${data?.mfaCode}`)
  }

  return <ul style={styles.responseList}>{responses.map((response, index) => <li key={index}>{responseMessage(response, responses[index-1]?.status)}</li>)}</ul>
}

export default function UserCommunication () {
  const [invite, setInvite] = useState(defaultInvite)
  const [inviteTimedOut, setInviteTimedOut] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [timeoutRef, setTimeoutRef] = useState<any|null>(null)
  
  const handleGenerateInvite = (reason: string) => {
    setInvite({ isLoading: true, error: null, data: null })
    setInviteTimedOut(false)
    timeoutRef && clearTimeout(timeoutRef)
    setIsPolling(false)

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

  if(!isPolling && invite?.data) {
    // log deeplink to console & ref for testing
    console.log({ deeplink: invite?.data?.deeplink, ref: invite?.data?.ref })
    
    // prevent further timeouts happening wen we're already polling
    setIsPolling(true)

    // set timeout running for invite & store ref
    
    setTimeoutRef(
      setTimeout(() => setInviteTimedOut(true), TIMEOUT_MS)
    )
  }

  return (
    <>
      <InviteContainer
        invite={invite}
        inviteTimedOut={inviteTimedOut}
        handleGenerateInvite={handleGenerateInvite}
      />
      {isPolling && <ResponseArea reference={invite?.data?.ref} />}
    </>
  )
}
