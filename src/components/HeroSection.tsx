import type { FC } from 'react'

interface HeroSectionProps {
  headline?: string
  subtitle?: string
  primaryCta?: string
  secondaryCta?: string
  onPrimaryCtaClick?: () => void
  onSecondaryCtaClick?: () => void
}

const HeroSection: FC<HeroSectionProps> = ({
  headline = 'The Future of Digital.',
  subtitle = 'Beautifully designed experiences built for the people who use them.',
  primaryCta = 'Get Started',
  secondaryCta = 'Learn More',
  onPrimaryCtaClick,
  onSecondaryCtaClick,
}) => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__inner">
        <h1 className="display" id="hero-heading">
          {headline}
        </h1>
        <p className="hero__subtitle">{subtitle}</p>
        <div className="hero__actions">
          <button
            className="btn-primary"
            type="button"
            onClick={onPrimaryCtaClick}
          >
            {primaryCta}
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={onSecondaryCtaClick}
          >
            {secondaryCta}
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
