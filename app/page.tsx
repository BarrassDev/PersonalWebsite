"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ROUND_SECONDS = 30;

export default function Home() {
  const [question, setQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const recentRef = useRef<string[]>([]);

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    if (!running || !timerEnabled) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running, timerEnabled, secondsLeft]);

  const timeUp = timerEnabled && secondsLeft <= 0;

  const startPauseReset = () => {
    if (timeUp) {
      setSecondsLeft(ROUND_SECONDS);
      setRunning(false);
    } else {
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

      <div className="hint">
        <p>Grab a pen. When the timer starts, everyone writes their list.</p>
        <p>
          When time&apos;s up, compare lists and pick a way to score: a point for
          every answer that <em>matches</em> another player&apos;s, or a point for
          every answer <em>nobody else</em> wrote down.
        </p>
      </div>
    </main>
  );
}
