"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ROUND_SECONDS = 30;
const SWIPE_MS = 380;

// Card types from Listography: The Game — each question gets one at random.
const CARD_TYPES = [
  {
    name: "One-on-One",
    write: "Write up to 10 answers",
    score: "1 point for each answer that exactly 1 other player also wrote",
  },
  {
    name: "Threefold",
    write: "Write up to 3 answers",
    score: "1 point for every player who wrote the same answer as you",
  },
  {
    name: "Forgotten Four",
    write: "Write exactly 4 answers",
    score: "1 point for each answer that nobody else wrote",
  },
] as const;

type CardType = (typeof CARD_TYPES)[number];

export default function Home() {
  const [question, setQuestion] = useState<string | null>(null);
  const [cardType, setCardType] = useState<CardType>(CARD_TYPES[0]);
  const [cardVersion, setCardVersion] = useState(0);
  const [dealing, setDealing] = useState(false);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [flyX, setFlyX] = useState<number | null>(null);
  const dragStartXRef = useRef(0);
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

  const nextQuestionRef = useRef<Promise<string> | null>(null);

  // Fetch a single question from the API, retrying once if the server
  // hands back something we've already seen.
  const fetchOne = useCallback(async (): Promise<string> => {
    const request = async (): Promise<string> => {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recent: recentRef.current }),
      });
      const data = await res.json();
      return data.question as string;
    };
    try {
      let q = await request();
      if (recentRef.current.includes(q)) {
        q = await request();
      }
      recentRef.current = [...recentRef.current, q].slice(-40);
      return q;
    } catch {
      return "List your favorite movies of all time";
    }
  }, []);

  // Generate the next question ahead of time, so dealing a new card is
  // instant when the swipe animation finishes.
  const prefetchNext = useCallback(() => {
    nextQuestionRef.current = fetchOne();
  }, [fetchOne]);

  const showQuestion = useCallback((q: string) => {
    setQuestion(q);
    setCardType(CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)]);
    setCardVersion((v) => v + 1);
    setFlyX(null);
    setDrag({ x: 0, active: false });
  }, []);

  // Initial deal, then start prefetching the next card.
  useEffect(() => {
    (async () => {
      showQuestion(await fetchOne());
      prefetchNext();
    })();
  }, [fetchOne, prefetchNext, showQuestion]);

  // Swipe the current card away and deal in the prefetched one. When
  // triggered by a drag gesture, flyDirection sends it out that side.
  const newQuestion = useCallback(
    async (flyDirection?: number) => {
      setDealing(true);
      setRunning(false);
      setSecondsLeft(ROUND_SECONDS);
      if (flyDirection) {
        setFlyX(flyDirection * Math.max(window.innerWidth, 700));
      }
      const pending = nextQuestionRef.current ?? fetchOne();
      nextQuestionRef.current = null;
      const swipeDone = new Promise((r) => setTimeout(r, SWIPE_MS));
      const [q] = await Promise.all([pending, swipeDone]);
      showQuestion(q);
      setDealing(false);
      prefetchNext();
    },
    [fetchOne, prefetchNext, showQuestion],
  );

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

  const busy = dealing || question === null;
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

  // Drag-to-swipe: past the threshold the card flies off and deals the next.
  const SWIPE_THRESHOLD = 90;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy) return;
    dragStartXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, active: true });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.active) return;
    setDrag({ x: e.clientX - dragStartXRef.current, active: true });
  };

  const onPointerEnd = () => {
    if (!drag.active) return;
    if (Math.abs(drag.x) > SWIPE_THRESHOLD) {
      newQuestion(Math.sign(drag.x));
    } else {
      setDrag({ x: 0, active: false });
    }
  };

  const cardStyle: React.CSSProperties =
    flyX !== null
      ? {
          transform: `translateX(${flyX}px) rotate(${flyX > 0 ? 18 : -18}deg)`,
          opacity: 0,
          transition: `transform ${SWIPE_MS}ms ease-in, opacity ${SWIPE_MS}ms ease-in`,
        }
      : drag.active
        ? {
            transform: `translateX(${drag.x}px) rotate(${drag.x / 24}deg)`,
            transition: "none",
          }
        : {
            transform: "translateX(0) rotate(0)",
            transition: "transform 0.25s ease",
          };

  return (
    <main className="page">
      <h1 className="title">
        List<span>ography</span>
      </h1>

      <div className="deck">
        <div
          key={cardVersion}
          className={`qcard${dealing && flyX === null ? " swipe-out" : ""}${!dealing ? " deal-in" : ""}`}
          style={cardStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <p className={`question${question === null ? " loading" : ""}`}>
            {question ?? "Shuffling the deck…"}
          </p>

          {question !== null && (
            <div className="card-type">
              <span className="card-type-name">{cardType.name}</span>
              <div className="rule-row">
                <span className="rule-label">Write</span>
                <span className="rule-text">{cardType.write}</span>
              </div>
              <div className="rule-row">
                <span className="rule-label">Score</span>
                <span className="rule-text">{cardType.score}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        {timerEnabled && (
          <>
            <div
              className={`timer${timeUp ? " done" : secondsLeft <= 10 ? " warning" : ""}`}
              aria-live="polite"
            >
              {timeUp ? "Time!" : `0:${String(secondsLeft).padStart(2, "0")}`}
            </div>
            <div className="controls">
              <button
                className={!running && !timeUp ? "start" : ""}
                onClick={startPauseReset}
                disabled={busy}
              >
                {timeUp ? "Reset" : running ? "Pause" : "Start"}
              </button>
              <button
                onClick={resetTimer}
                disabled={busy || (!running && secondsLeft === ROUND_SECONDS)}
              >
                Reset
              </button>
            </div>
          </>
        )}

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

        <div className="controls new-question">
          <button className="primary" onClick={() => newQuestion()} disabled={busy}>
            New Question
          </button>
        </div>
      </div>

      <p className="hint">
        Grab a pen. When the timer starts, everyone writes their list — then
        compare lists and score by the rule on the card. Swipe the card away
        for a new one.
      </p>
    </main>
  );
}
