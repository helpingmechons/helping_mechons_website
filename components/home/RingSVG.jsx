import { RING_COLORS, N, STEP, R_HEAD, R_HEAD_SIZE, R_BODY_IN, R_BODY_OUT, R_ARMS, R_FEET, LEG_SPLAY, VIEW } from "./ringGeometry";

const pt = (r, a) => [r * Math.cos(a), r * Math.sin(a)];

/** 2D version of the ring of hands. Rendered by the server; spins slowly via CSS. */
export function RingFigures({ className = "" }) {
  return (
    <svg viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`} className={className} aria-hidden>
      {RING_COLORS.map((c, i) => {
        const a = -Math.PI / 2 + i * STEP;
        const [hx, hy] = pt(R_HEAD, a);
        const [b1x, b1y] = pt(R_BODY_IN, a);
        const [b2x, b2y] = pt(R_BODY_OUT, a);
        const [l1x, l1y] = pt(R_FEET, a - LEG_SPLAY);
        const [l2x, l2y] = pt(R_FEET, a + LEG_SPLAY);
        const [s1x, s1y] = pt(R_ARMS, a - STEP / 2);
        const [s2x, s2y] = pt(R_ARMS, a + STEP / 2);
        return (
          <g key={c} stroke={c} fill="none" strokeLinecap="round">
            <path d={`M ${s1x} ${s1y} A ${R_ARMS} ${R_ARMS} 0 0 1 ${s2x} ${s2y}`} strokeWidth="0.06" />
            <line x1={b1x} y1={b1y} x2={b2x} y2={b2y} strokeWidth="0.11" />
            <line x1={b2x} y1={b2y} x2={l1x} y2={l1y} strokeWidth="0.07" />
            <line x1={b2x} y1={b2y} x2={l2x} y2={l2y} strokeWidth="0.07" />
            <circle cx={hx} cy={hy} r={R_HEAD_SIZE} fill={c} stroke="none" />
          </g>
        );
      })}
    </svg>
  );
}

/** The navy/orange gear from the logo, drawn behind the photo. */
export function Gear({ className = "" }) {
  const teeth = 18;
  const rIn = 0.69, rOut = 0.76;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / teeth * 0.22;
    const a2 = a0 + (Math.PI * 2) / teeth * 0.5;
    const a3 = a0 + (Math.PI * 2) / teeth * 0.72;
    const p = (r, a) => `${(r * Math.cos(a)).toFixed(4)} ${(r * Math.sin(a)).toFixed(4)}`;
    d += `${i === 0 ? "M" : "L"} ${p(rIn, a0)} L ${p(rOut, a1)} L ${p(rOut, a2)} L ${p(rIn, a3)} `;
  }
  d += "Z";
  return (
    <svg viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`} className={className} aria-hidden>
      <defs>
        <linearGradient id="gearFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.5" stopColor="#0f2b46" />
          <stop offset="0.5" stopColor="#f57c00" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#gearFill)" />
    </svg>
  );
}
