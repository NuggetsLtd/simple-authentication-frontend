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
    flexGrow: 0,
    flexBasis: "300px",
    color: "#fff",
  },
  asideHeader: {
    marginBottom: "15px",
    fontWeight: 700,
  },
  orderedList: {
    listStyle: "decimal outside",
    marginLeft: "15px",
    lineHeight: "1.4em",
  },
  orderedListItem: {
    marginBottom: "15px",
  },
  contentBlock: {
    flexGrow: 1,
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
            <h1 style={styles.asideHeader}>Instructions:</h1>
            <ol style={styles.orderedList}>
              <li style={styles.orderedListItem}>Install the Nuggets app on your phone</li>
              <li style={styles.orderedListItem}>Open the app and create an account</li>
              <li style={styles.orderedListItem}>Click the &quot;Generate Invite&quot; button on this page</li>
              <li style={styles.orderedListItem}>Scan the generated QR code with the Nuggets App</li>
              <li style={styles.orderedListItem}>Review details in Nuggets App</li>
              <li style={styles.orderedListItem}>Approve share of Name proof in Nuggets App</li>
            </ol>
          </aside>
          <section style={styles.contentBlock}>
            <UserCommunication />
          </section>
        </div>
      </div>
    </main>
  )
}
