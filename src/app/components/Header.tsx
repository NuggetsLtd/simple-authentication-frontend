import Image from 'next/image'

const styles = {
  header: {
    width: "100%",
    zIndex: 9999,
    display: "block",
    borderBottom: "solid 1px rgba(255, 255, 255, 0.1)",
  },
  container: {
    padding: "20px 30px 14px",
  },
  logo: {

  },
  headerText: {
    fontSize: "18px",
    fontWeight: 300,
    lineHeight: "37.5px",
    color: "#fff",
    float: "right" as "right",
  },
}

export default async function Header() {
  
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.headerText}>Functionality Demo Page</div>
        <div style={styles.logo}>
          <Image src="./logo.svg" width={152} height={36} alt="Nuggets Logo" />
        </div>
      </div>
    </header>
  )
}
