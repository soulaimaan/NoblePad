import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { PresalePreview } from '@/components/sections/PresalePreview'
import { SecuritySection } from '@/components/sections/SecuritySection'
import { StatsSection } from '@/components/sections/StatsSection'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SecuritySection />
      <FeaturesSection />
      <StatsSection />
      <PresalePreview />
    </div>
  )
}