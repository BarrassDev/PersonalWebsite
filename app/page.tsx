"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ROUND_SECONDS = 30;

// Card types from Listography: The Game — each question gets one at random.
const CARD_TYPES = [
  {
    name: "One-on-One",
    rule: "match with exactly one other player — score for each answer that only one other person also wrote",
  },
  {
    name: "Threefold",
    rule: "write up to 3 answers — score a point every time an answer matches another player's",
  },
  {
    name: "Forgotten Four",
    rule: "write 4 answers — score for each answer nobody else wrote down",
  },
] as const;

type CardType = (typeof CARD_TYPES)[number];

export default function Home() {
  const [question, setQuestion] = useState<string | null>(null);
  const [cardType, setCardType] = useState<CardType>(CARD_TYPES[0]);
  const [loading, setLoading] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const recentRef = useRef<string[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Browsers only allow sound after a user gesture — call this from Start.
  const unlockAudio = () => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    audioCtxRef.current.resume().catch(() => {});
  };

  const playTick = useCallback((urgent: boolean) => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(urgent ? 1500 : 1000, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(urgent ? 0.25 : 0.12, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }, []);

  const playAlarm = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== "running") return;
    const start = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = start + i * 0.35;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    }
  }, []);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setRunning(false);
    setSecondsLeft(ROUND_SECONDS);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recent: recentRef.current }),
      });
      const data = await res.json();
      setQuestion(data.question);
      recentRef.current = [...recentRef.current, data.question].slice(-20);
    } catch {
      setQuestion("List your favorite movies of all time");
    }
    setCardType(CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    if (!running || !timerEnabled) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      playAlarm();
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next > 0) {
          playTick(next <= 10);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, timerEnabled, secondsLeft, playAlarm, playTick]);

  const timeUp = timerEnabled && secondsLeft <= 0;

  const startPauseReset = () => {
    if (timeUp) {
      setSecondsLeft(ROUND_SECONDS);
      setRunning(false);
    } else {
      unlockAudio();
      setRunning((r) => !r);
    }
  };

  const resetTimer = () => {
    setRunning(false);
    setSecondsLeft(ROUND_SECONDS);
  };

  return (
    <main className="page">
      <h1 className="title">
        List<span>ography</span>
      </h1>

      <div className="card">
        <p className={`question${loading ? " loading" : ""}`}>
          {loading ? "Thinking of a good one…" : question}
        </p>

        {!loading && (
          <p className="card-type">
            <span className="card-type-name">{cardType.name}</span>
            For this question, {cardType.rule}.
          </p>
        )}

        {timerEnabled && (
          <>
            <div
              className={`timer${timeUp ? " done" : secondsLeft <= 10 ? " warning" : ""}`}
              aria-live="polite"
            >
              {timeUp ? "Time!" : `0:${String(secondsLeft).padStart(2, "0")}`}
            </div>
            <div className="controls">
              <button onClick={startPauseReset} disabled={loading}>
                {timeUp ? "Reset" : running ? "Pause" : "Start"}
              </button>
              <button onClick={resetTimer} disabled={loading || (!running && secondsLeft === ROUND_SECONDS)}>
                Reset
              </button>
            </div>
          </>
        )}

        <div className="controls">
          <button className="primary" onClick={fetchQuestion} disabled={loading}>
            New Question
          </button>
        </div>

        <label className="toggle-row">
          <span className="switch">
            <input
              type="checkbox"
              checked={timerEnabled}
              onChange={(e) => {
                setTimerEnabled(e.target.checked);
                setRunning(false);
                setSecondsLeft(ROUND_SECONDS);
              }}
            />
            <span className="slider" />
          </span>
          30-second timer
        </label>
      </div>

      <p className="hint">
        Grab a pen. When the timer starts, everyone writes their list — then
        compare lists and score by the rule on the card.
      </p>
    </main>
  );
}
