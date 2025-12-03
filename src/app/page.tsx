import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { PresalePreview } from '@/components/sections/PresalePreview'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <PresalePreview />
    </div>
  )
}