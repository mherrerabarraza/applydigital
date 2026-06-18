import type { FC } from 'react'

interface NavLink {
  label: string
  href: string
}

interface NavBarProps {
  brand?: string
  links?: readonly NavLink[]
}

const DEFAULT_LINKS: readonly NavLink[] = [
  { label: 'Products', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'About', href: '#' },
]

const NavBar: FC<NavBarProps> = ({
  brand = 'ApplyDigital',
  links = DEFAULT_LINKS,
}) => {
  return (
    <nav className="nav-bar" role="navigation" aria-label="Main navigation">
      <div className="nav-bar__inner">
        <a className="nav-bar__logo" href="/">
          {brand}
        </a>
        <ul className="nav-bar__links" role="list">
          {links.map((link) => (
            <li key={link.label}>
              <a className="nav-bar__link" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default NavBar
