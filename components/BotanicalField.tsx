type BotanicalFieldProps = {
  className?: string;
};

// A deliberately quiet botanical field. It gives Kaolin a recognisable living
// detail without making a WebGL scene compete with the headline or page speed.
// This is decorative only: the meaningful content stays in normal HTML above it.
export default function BotanicalField({ className = "" }: BotanicalFieldProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      viewBox="0 0 760 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="botanical-stems" stroke="currentColor" strokeLinecap="round">
        <path d="M58 420C70 306 118 218 164 128" strokeWidth="4" />
        <path d="M140 420C146 322 170 242 224 88" strokeWidth="3" />
        <path d="M214 420C228 298 284 211 328 42" strokeWidth="5" />
        <path d="M312 420C298 304 334 184 390 102" strokeWidth="3" />
        <path d="M402 420C408 322 456 224 488 66" strokeWidth="4" />
        <path d="M500 420C486 306 542 190 594 130" strokeWidth="3" />
        <path d="M602 420C614 322 656 248 694 100" strokeWidth="5" />
      </g>
      <g className="botanical-leaves" fill="currentColor">
        <path d="M157 150c-42-5-64 11-79 39 36 2 60-12 79-39Z" />
        <path d="M176 116c4-42 25-63 54-76 2 36-16 60-54 76Z" />
        <path d="M222 218c-39-5-58 11-73 36 34 2 55-11 73-36Z" />
        <path d="M254 125c8-39 31-58 58-67-2 34-21 55-58 67Z" />
        <path d="M322 98c-39-3-60 14-73 41 34 0 56-14 73-41Z" />
        <path d="M340 55c4-36 23-55 51-65 1 31-16 52-51 65Z" />
        <path d="M380 132c-35-1-56 15-67 39 30-1 51-14 67-39Z" />
        <path d="M406 240c-39-3-59 13-72 39 34 1 55-14 72-39Z" />
        <path d="M478 106c-39 2-58 21-66 49 34-4 52-22 66-49Z" />
        <path d="M496 75c4-34 21-53 48-64 1 30-16 50-48 64Z" />
        <path d="M536 224c-36-3-57 12-69 38 31 1 52-12 69-38Z" />
        <path d="M590 152c-38 4-56 23-63 50 32-5 49-23 63-50Z" />
        <path d="M696 125c-39-4-59 13-73 40 34 1 55-14 73-40Z" />
      </g>
      <g className="botanical-seeds" fill="currentColor">
        <circle cx="92" cy="238" r="5" />
        <circle cx="276" cy="182" r="4" />
        <circle cx="470" cy="186" r="5" />
        <circle cx="645" cy="252" r="4" />
      </g>
    </svg>
  );
}
