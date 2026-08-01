/**
 * Signature brand element: a continuously scrolling ECG / pulse line.
 * Used sparingly as a section divider to reinforce the "vital signs" theme.
 */
const PulseDivider = ({ color = '#F67C42' }) => {
  const path =
    'M0 14 H40 L48 4 L56 24 L64 14 H100 L108 6 L116 22 L124 14 H160 L168 4 L176 24 L184 14 H220 L228 6 L236 22 L244 14 H280 L288 4 L296 24 L304 14 H340 L348 6 L356 22 L364 14 H400';

  return (
    <div className="pulse-divider">
      <svg viewBox="0 0 800 28" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(400,0)"
        />
      </svg>
    </div>
  );
};

export default PulseDivider;
