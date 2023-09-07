import Header from './components/Header'
import UserCommunication from './components/UserCommunication'
import InstallNuggetsBanner from './components/InstallNuggetsBanner'
import Image from 'next/image'
import Link from 'next/link'

const styles = {
  container: {
    margin: "0 30px",
  },
  background: {
    zIndex: -1,
  },
  contentContainer: {
    display: "flex",
    gap: "30px",
  },
  contentAside: {
    flexGrow: 1,
  },
  contentBlock: {
    flexGrow: 3,
    border: "solid 1px rgba(255, 255, 255, 0.46)",
    borderRadius: "12px",
    backgroundColor: "rgba(18, 3, 31, 0.1)",
    padding: "15px",
  },
}

export default async function Home() {
  
  return (
    <main>
      <Image src="/bg.svg" alt="Nuggets Logo" layout="fill" objectFit='cover' style={styles.background} />
      <Header />
      <div style={styles.container}>
        <InstallNuggetsBanner />
        <div style={styles.contentContainer}>
          <aside style={{ ...styles.contentBlock, ...styles.contentAside }}>
            {/* <h1 style={styles.newToNuggets.header}>New to Nuggets?</h1>
            <p>Download for your device</p> */}
            ASIDE
          </aside>
          <section style={styles.contentBlock}>
            <UserCommunication />
          </section>
        </div>
      </div>
    </main>
  )
}
