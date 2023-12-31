import './globals.css'
import bg from '../../public/bg.svg'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const styles = {
  html: {
    minHeight: '100%',
    backgroundColor: '#705e91',
    color: "rgb(74, 74, 74)",
    backgroundImage: `url(${bg.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  }
}

const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" style={styles.html}>
      <head>
        <meta charSet="utf-8" />
        <title>Nuggets</title>
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  )
}
