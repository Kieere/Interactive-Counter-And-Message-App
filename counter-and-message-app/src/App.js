import { useState, useRef, useCallback } from "react";

const PURPLE = {
  bg: "#120D1E",
  bgGoal: "#1A0A2E",
  card: "#1E1135",
  border: "#2E1F5E",
  borderGoal: "#7F77DD",
  accent: "#7F77DD",
  accentLight: "#AFA9EC",
  accentPale: "#CECBF6",
  deep: "#3C3489",
  deeper: "#26215C",
  deepest: "#534AB7",
};

function useParticles() {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);

  const burst = useCallback((cx, cy) => {
    const newParticles = Array.from({ length: 10 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 10;
      const dist = 40 + Math.random() * 30;
      return {
        id: idRef.current++,
        cx,
        cy,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        color: i % 2 === 0 ? PURPLE.accent : PURPLE.accentLight,
      };
    });
    setParticles((p) => [...p, ...newParticles]);
    setTimeout(
      () =>
        setParticles((p) =>
          p.filter((x) => !newParticles.find((n) => n.id === x.id))
        ),
      600
    );
  }, []);

  return { particles, burst };
}

export default function CounterApp() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [bump, setBump] = useState(false);
  const numRef = useRef(null);
  const containerRef = useRef(null);
  const { particles, burst } = useParticles();

  const isGoal = count >= 5;

  const triggerBump = () => {
    setBump(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setBump(true));
      setTimeout(() => setBump(false), 200);
    });
  };

  const triggerBurst = () => {
    if (!numRef.current || !containerRef.current) return;
    const numRect = numRef.current.getBoundingClientRect();
    const contRect = containerRef.current.getBoundingClientRect();
    const cx = numRect.left - contRect.left + numRect.width / 2;
    const cy = numRect.top - contRect.top + numRect.height / 2;
    burst(cx, cy);
  };

  const change = (delta) => {
    setCount((c) => c + delta);
    triggerBump();
    triggerBurst();
  };

  const reset = () => {
    setCount(0);
    triggerBump();
  };

  return (
    <div style={{ padding: "1.5rem 1rem", fontFamily: "'Georgia', serif" }}>
      <style>{`
        @keyframes burst {
          0%   { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
        }
        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bannerOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(6px) scale(0.98); }
        }
        .counter-btn {
          background: #ffffff;
          color: #26215C;
          border: none;
          border-radius: 10px;
          padding: 13px 0;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-family: inherit;
          transition: background 0.15s, transform 0.08s;
          flex: 1;
        }
        .counter-btn:hover { background: #e8e4ff; }
        .counter-btn:active { transform: scale(0.96); }
        .msg-input {
          width: 100%;
          background: #1E1135;
          border: 1px solid #3C3489;
          border-radius: 10px;
          padding: 10px 14px;
          color: #CECBF6;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .msg-input::placeholder { color: #534AB7; }
        .msg-input:focus { border-color: #7F77DD; }
      `}</style>

      <div
        style={{
          background: isGoal ? PURPLE.bgGoal : PURPLE.bg,
          borderRadius: 16,
          padding: "2rem 1.5rem",
          maxWidth: 440,
          margin: "0 auto",
          border: `1px solid ${isGoal ? PURPLE.borderGoal : PURPLE.border}`,
          transition: "background 0.5s, border-color 0.5s",
        }}
      >
        {/* Section label */}
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: PURPLE.accent, textTransform: "uppercase", marginBottom: 10 }}>
          Counter
        </p>

        {/* Counter display with particles */}
        <div
          ref={containerRef}
          style={{ textAlign: "center", padding: "1.2rem 0 1.4rem", position: "relative", overflow: "visible" }}
        >
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: p.color,
                left: p.cx,
                top: p.cy,
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
                animation: "burst 0.55s ease-out forwards",
                pointerEvents: "none",
              }}
            />
          ))}
          <span
            ref={numRef}
            style={{
              fontSize: 80,
              fontWeight: 500,
              lineHeight: 1,
              color: isGoal ? PURPLE.accentLight : PURPLE.accentPale,
              display: "inline-block",
              transition: "color 0.3s",
              transform: bump ? "scale(1.18)" : "scale(1)",
              transitionProperty: "color, transform",
              transitionDuration: "0.3s, 0.15s",
              textShadow: isGoal ? `0 0 32px ${PURPLE.deepest}` : "none",
            }}
          >
            {count}
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
          <button className="counter-btn" onClick={() => change(-1)}>
            − Decrease
          </button>
          <button className="counter-btn" onClick={() => change(1)}>
            + Increase
          </button>
          <button className="counter-btn" onClick={reset}>
            ↺ Reset
          </button>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: `1px solid ${PURPLE.border}`, margin: "1.5rem 0" }} />

        {/* Message section */}
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", color: PURPLE.accent, textTransform: "uppercase", marginBottom: 10 }}>
          Custom message
        </p>
        <input
          className="msg-input"
          type="text"
          placeholder="Type your message here…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Custom message"
        />
        <div style={{ marginTop: 10, minHeight: 26, fontSize: 15, color: PURPLE.accentLight }}>
          {message
            ? <span style={{ color: PURPLE.accentPale }}>{message}</span>
            : <span style={{ color: PURPLE.deep, fontStyle: "italic" }}>Your message will appear here</span>
          }
        </div>

        {/* Goal banner */}
        {isGoal && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: PURPLE.deeper,
              border: `1px solid ${PURPLE.accent}`,
              borderRadius: 10,
              padding: "12px 16px",
              marginTop: "1.5rem",
              color: PURPLE.accentPale,
              fontSize: 14,
              fontWeight: 500,
              animation: "bannerIn 0.3s ease-out forwards",
            }}
          >
            🏆 Goal Reached! Counter is 5 or higher.
          </div>
        )}
      </div>
    </div>
  );
}