import { Header } from "@/components/marketing/header"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Impact } from "@/components/marketing/impact"
import { Pricing } from "@/components/marketing/pricing"
import { Footer } from "@/components/marketing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Impact />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
