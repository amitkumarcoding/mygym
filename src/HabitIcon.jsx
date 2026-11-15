const PATHS = {
  water: 'M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3Z',
  meal: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.2 1.2-3 3.6-3 6.5V13h3',
  fee: 'M4 7a2 2 0 0 1 2-2h12v3M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2ZM16 14h2',
  cloud: 'M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5 4 4 0 0 1 17 18Z',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15ZM10 21h4',
}

export default function HabitIcon({ k }) {
  return (
    <span className="hb-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={PATHS[k]} /></svg>
    </span>
  )
}
