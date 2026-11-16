interface SilverPulseLogoProps {
  size?: 'small' | 'large'
}

export function SilverPulseLogo({ size = 'small' }: SilverPulseLogoProps) {
  const sizeClass = size === 'large' ? 'size-14 sm:size-16' : 'size-11'

  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center rounded-full border border-white/40 bg-gradient-to-br from-sky-400 via-nasa-blue to-deep-space text-white shadow-[0_0_1.25rem_rgba(38,135,201,0.45)] ${sizeClass}`}
    >
      <svg viewBox="0 0 64 64" className="size-full" fill="none">
        <circle cx="32" cy="32" r="19" fill="#08182e" fillOpacity=".52" stroke="white" strokeOpacity=".55" />
        <ellipse
          cx="32"
          cy="32"
          rx="27"
          ry="11"
          transform="rotate(-28 32 32)"
          stroke="#9deaff"
          strokeWidth="1.5"
        />
        <path
          d="M13 33h10l4-8 7 17 5-10h12"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
        <circle cx="50" cy="17" r="2.5" fill="#fc3d21" stroke="white" strokeWidth="1" />
      </svg>
    </span>
  )
}
