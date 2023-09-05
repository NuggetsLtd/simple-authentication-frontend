'use client'

import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

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
  const { data, error, isLoading } = useSWR('/api/invite', url => fetcher(`${url}?reason=${props?.reason}`))

  if(isLoading) return <div style={styles.container}>Loading...</div>
  if (error) return <div style={styles.container}>Error: {error}</div>

  console.log({ deeplink: data?.deeplink, ref: data?.ref })
  // TODO: timeout for invite

  return (
    <a href={data?.deeplink} style={styles.container} dangerouslySetInnerHTML={{ __html: data?.qrCode || "" }}></a>
  )
}
