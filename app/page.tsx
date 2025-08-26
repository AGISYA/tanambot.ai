import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import YouTubeEmbed from '@/components/landing/YouTubeEmbed'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <YouTubeEmbed />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  )
}