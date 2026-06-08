export function PlatPattern({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 bg-ink-900 ${className}`}
      style={{
        backgroundImage: [
          'radial-gradient(ellipse at 30% 20%, rgba(217,164,55,0.10), transparent 55%)',
          'radial-gradient(ellipse at 80% 70%, rgba(120,84,32,0.10), transparent 50%)',
          'linear-gradient(rgba(217,164,55,0.05) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(217,164,55,0.05) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
        backgroundPosition: '0 0, 0 0, -1px -1px, -1px -1px',
      }}
    >
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full opacity-40"
      >
        <g stroke="rgba(217,164,55,0.30)" strokeWidth="0.25" fill="none">
          <line x1="20" y1="15" x2="80" y2="15" />
          <line x1="20" y1="30" x2="80" y2="30" />
          <line x1="20" y1="45" x2="80" y2="45" />
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={i} x1={20 + i * 6} y1="15" x2={20 + i * 6} y2="45" />
          ))}
        </g>
        <g stroke="rgba(217,164,55,0.45)" strokeWidth="0.4" fill="none">
          <line x1="6" y1="6" x2="12" y2="6" />
          <line x1="6" y1="6" x2="6" y2="12" />
          <line x1="94" y1="54" x2="88" y2="54" />
          <line x1="94" y1="54" x2="94" y2="48" />
        </g>
      </svg>
    </div>
  );
}
