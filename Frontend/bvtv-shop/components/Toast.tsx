"use client";

import React, { useEffect, useState } from "react";

type Props = {
  message: string;
  duration?: number; // ms
  onClose?: () => void;
};

export default function Toast({ message, duration = 2200, onClose }: Props) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // auto start exit after duration
    const t = window.setTimeout(() => setExiting(true), duration);
    return () => window.clearTimeout(t);
  }, [duration]);

  // when exit animation finishes, call onClose
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (exiting && e.animationName === "toastExit") {
      onClose?.();
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 pointer-events-auto`}
      onAnimationEnd={handleAnimationEnd}
      style={{
        // ensure will-change for smooth animation
        willChange: "transform, opacity",
      }}
    >
      <div
        className={`bg-green-600 text-white px-4 py-2 rounded shadow-lg transform origin-center ${
          exiting ? "toast-exit" : "toast-enter"
        }`}
        style={{ display: "inline-block" }}
      >
        {message}
      </div>

      <style jsx>{`
        @keyframes toastEnter {
          from { transform: translateX(120%) scaleX(1); opacity: 0; }
          to { transform: translateX(0%) scaleX(1); opacity: 1; }
        }
        /* exit: shrink horizontally from center (inside-out) and fade */
        @keyframes toastExit {
          from { transform: translateX(0%) scaleX(1); opacity: 1; }
          to { transform: translateX(0%) scaleX(0); opacity: 0; }
        }
        .toast-enter {
          animation: toastEnter 320ms cubic-bezier(.2,.9,.2,1) both;
        }
        .toast-exit {
          animation: toastExit 260ms cubic-bezier(.2,.9,.2,1) both;
        }
      `}</style>
    </div>
  );
}
