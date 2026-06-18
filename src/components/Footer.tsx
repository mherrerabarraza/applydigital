import type { FC } from 'react'

interface FooterProps {
  copyrightYear?: number
  companyName?: string
}

const Footer: FC<FooterProps> = ({
  copyrightYear = new Date().getFullYear(),
  companyName = 'ApplyDigital',
}) => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__text">
          Copyright &copy; {copyrightYear} {companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
