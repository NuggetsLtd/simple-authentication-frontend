import Image from 'next/image'
import Link from 'next/link'

const styles = {
  bannerHolder: {
    fontSize: "16px",
    fontWeight: 700,
    textAlign: "center" as "center",
    color: "#4a4a4a",
    padding: "24px 20px 22px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    margin: "40px 0",
  },
  bannerHolderButton: {
    display: "inline-block",
    verticalAlign: "middle",
    padding: "0 0 0 15px",

  },
}

export default async function InstallNuggetsBanner() {
  
  return (
    <div style={styles.bannerHolder}>
      <p>New to Nuggets? Install the app for your device: 
        <Link style={styles.bannerHolderButton} href="https://apps.apple.com/gb/app/nuggets-pay-id/id1216139887">
          <Image src="/btn-appstore.svg" width={100} height={29} alt="Download on the App Store" />
        </Link>
        <Link style={styles.bannerHolderButton} href="https://play.google.com/store/apps/details?id=life.nuggets.app">
          <Image src="/btn-gplay.svg" width={100} height={29} alt="Download on Google Play Store" />
        </Link>
      </p>
    </div>
  )
}
