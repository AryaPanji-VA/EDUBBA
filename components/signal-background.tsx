type SignalBackgroundProps = {
  intensity?: "calm" | "active" | "quiet" | "error";
  pulse?: boolean;
};

export function SignalBackground({ intensity = "calm", pulse = false }: SignalBackgroundProps) {
  return (
    <div className={`signal-field signal-${intensity} ${pulse ? "signal-pulse" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 520" preserveAspectRatio="none">
        <path className="signal-line signal-line-one" d="M-80 268 C 40 268, 80 236, 160 268 S 280 300, 360 268 S 480 222, 560 268 S 680 310, 760 268 S 880 238, 960 268 S 1080 316, 1160 268 S 1280 232, 1520 268" />
        <path className="signal-line signal-line-two" d="M-80 284 C 70 284, 110 260, 190 284 S 330 306, 410 284 S 540 244, 620 284 S 750 320, 830 284 S 980 252, 1060 284 S 1200 304, 1520 284" />
        <path className="signal-line signal-line-three" d="M-80 246 C 90 246, 140 224, 220 246 S 360 276, 440 246 S 580 216, 660 246 S 800 280, 880 246 S 1030 220, 1110 246 S 1240 270, 1520 246" />
      </svg>
    </div>
  );
}
