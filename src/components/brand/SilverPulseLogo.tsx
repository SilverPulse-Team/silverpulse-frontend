interface SilverPulseLogoProps {
  size?: 'small' | 'large'
}

export function SilverPulseLogo({ size = 'small' }: SilverPulseLogoProps) {
  const sizeClass = size === 'large' ? 'h-14 w-20 sm:h-16 sm:w-24' : 'h-11 w-16'

  return (
    <span aria-hidden="true" className={`block shrink-0 ${sizeClass}`}>
      <svg viewBox="0 0 367 255" className="size-full" fill="none">
        <defs>
          <linearGradient id="silverpulse-logo-ring" x1="72" y1="38" x2="291" y2="218" gradientUnits="userSpaceOnUse">
            <stop stopColor="#66E5FF" />
            <stop offset=".52" stopColor="#3297F5" />
            <stop offset="1" stopColor="#394FC2" />
          </linearGradient>
          <linearGradient id="silverpulse-logo-orbit" x1="62" y1="185" x2="322" y2="84" gradientUnits="userSpaceOnUse">
            <stop stopColor="#68E7FF" />
            <stop offset=".55" stopColor="#47B9FF" />
            <stop offset="1" stopColor="#2872E8" />
          </linearGradient>
          <linearGradient id="silverpulse-logo-planet" x1="272" y1="70" x2="293" y2="92" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8CF0FF" />
            <stop offset="1" stopColor="#2C91E9" />
          </linearGradient>
        </defs>
        <circle cx="182" cy="137" r="107" stroke="url(#silverpulse-logo-ring)" strokeWidth="6" />
        <ellipse
          cx="192"
          cy="145"
          rx="133"
          ry="32"
          transform="rotate(-28 192 145)"
          stroke="url(#silverpulse-logo-orbit)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M190 110C216 98 243 87 266 81" stroke="#55BFFF" strokeWidth="1.5" />
        <path
          d="M96 148H151L163 147L176 101L194 181L211 132L221 148H293"
          stroke="#F7FBFF"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M143 65L147 77L159 80L147 83L143 95L139 83L127 80L139 77L143 65Z" fill="#F7FBFF" />
        <circle cx="200" cy="65" r="1.8" fill="#69D9FF" />
        <circle cx="120" cy="121" r="1.6" fill="#69D9FF" />
        <circle cx="264" cy="115" r="1.6" fill="#69D9FF" />
        <circle cx="282" cy="82" r="12" fill="url(#silverpulse-logo-planet)" />
      </svg>
    </span>
  )
}
