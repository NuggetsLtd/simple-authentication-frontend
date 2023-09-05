import Header from './components/Header'
import QrCode from './components/QrCode'
import InstallNuggetsBanner from './components/InstallNuggetsBanner'
import Image from 'next/image'
import Link from 'next/link'

const styles = {
  container: {
    margin: "0 30px",
  },
  heroBlock: {

  },
  background: {
    zIndex: -1,
  },
  contentContainer: {
    display: "flex",
    gap: "30px",
  },
  contentBlock: {
    flexGrow: 1,
  },
}

export default async function Home() {
  
  return (
    <main>
      <Image src="/bg.svg" alt="Nuggets Logo" layout="fill" objectFit='cover' style={styles.background} />
      <Header />
      <div style={styles.container}>
        <InstallNuggetsBanner />
        <div style={styles.heroBlock}>
          <div style={styles.contentContainer}>
            <aside style={styles.contentBlock}>
              {/* <h1 style={styles.newToNuggets.header}>New to Nuggets?</h1>
              <p>Download for your device</p> */}
              ASIDE
            </aside>
            <section style={styles.contentBlock}>
              <QrCode reason="auth" />
              CONTENT
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
