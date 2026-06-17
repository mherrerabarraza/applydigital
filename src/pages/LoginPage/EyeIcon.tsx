import React from 'react';

/**
 * Props for the EyeIcon component.
 * @param isVisible - A boolean indicating whether the eye icon should represent 'visible' (open eye) or 'hidden' (crossed-out eye).
 */
interface EyeIconProps {
  isVisible: boolean;
}

/**
 * EyeIcon component for toggling password visibility.
 * Renders an SVG icon that changes based on the `isVisible` prop.
 *
 * This component uses standard SVG path data. The specific icon choice (open eye vs. crossed eye)
 * is determined by the `isVisible` prop.
 */
const EyeIcon: React.FC<EyeIconProps> = ({ isVisible }) => {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {isVisible ? (
        // Open eye icon
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      ) : (
        // Crossed-out eye icon (eye-off)
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.26 18.26 0 0 1 4.38-5.85"></path>
          <path d="M1 1l22 22"></path>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.08 3.56"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      )}
    </svg>
  );
};

export default EyeIcon;
