import { useNavigate, useParams } from "@tanstack/react-router";
import { Check, Eye, Hand, Home, RefreshCw, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { BigButton } from "@/components/ui/BigButton";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { GameResultScreen } from "@/components/ui/GameResultScreen";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/hooks/use-i18n";
import { DEMO_GAMES, PACK_THEMES } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type {
  Difficulty,
  Game,
  GameResult,
  Mood,
  PackObject,
  SkillArea,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const SKILL_LABEL: Record<
  SkillArea,
  "memory" | "attention" | "recognition" | "routineRecall" | "engagement"
> = {
  Memory: "memory",
  Attention: "attention",
  Recognition: "recognition",
  RoutineRecall: "routineRecall",
  Engagement: "engagement",
};

interface GameMetrics {
  accuracy: number;
  attempts: number;
  completion: number;
  responseTimeMs: number;
  score?: number;
}

interface GameProps {
  game: Game;
  difficulty: Difficulty;
  objects: PackObject[];
  onFinish: (metrics: GameMetrics) => void;
}

const ROUTINE_QUESTIONS = [
  {
    question: "What do you do first after waking up?",
    options: ["Brush your teeth", "Go back to sleep", "Watch TV"],
    answerIndex: 0,
  },
  {
    question: "When do you take your morning medicine?",
    options: ["After breakfast", "At midnight", "Before lunch"],
    answerIndex: 0,
  },
  {
    question: "What is a good time for a gentle walk?",
    options: ["Morning or evening", "Late at night", "During a storm"],
    answerIndex: 0,
  },
  {
    question: "What should you do before taking medicine?",
    options: ["Read the label", "Skip it", "Take two"],
    answerIndex: 0,
  },
  {
    question: "Where do you keep your daily medicines?",
    options: ["A safe, easy-to-find place", "Hidden away", "In the fridge"],
    answerIndex: 0,
  },
  {
    question: "What helps you remember your routine?",
    options: ["A daily checklist", "Forgetting", "Rushing"],
    answerIndex: 0,
  },
  {
    question: "After lunch, a good habit is to…",
    options: ["Rest a little", "Skip meals", "Stay up all night"],
    answerIndex: 0,
  },
  {
    question: "Before bed, it helps to…",
    options: ["Wind down calmly", "Drink lots of tea", "Do heavy exercise"],
    answerIndex: 0,
  },
];

const MOOD_OPTIONS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: "happy", emoji: "😊", label: "Happy" },
  { mood: "okay", emoji: "😐", label: "Okay" },
  { mood: "low", emoji: "😔", label: "Sad" },
  { mood: "tired", emoji: "😟", label: "Worried" },
];

const STORY = {
  title: "Asha Devi's Day",
  text: "Every morning, Asha Devi wakes up early and makes a warm cup of tea. She waters her plants on the balcony and watches the birds. In the afternoon she rests for a while. In the evening, she calls her granddaughter Priya to hear about her day.",
};

const STORY_QUESTIONS = [
  {
    question: "What does Asha Devi make every morning?",
    options: ["A warm cup of tea", "A bowl of rice", "A glass of milk"],
    answerIndex: 0,
  },
  {
    question: "Where does she water her plants?",
    options: ["On the balcony", "In the kitchen", "At the market"],
    answerIndex: 0,
  },
  {
    question: "What does she do in the afternoon?",
    options: ["Rests for a while", "Goes shopping", "Cleans the house"],
    answerIndex: 0,
  },
  {
    question: "Who does she call in the evening?",
    options: ["Her granddaughter Priya", "Her doctor", "The postman"],
    answerIndex: 0,
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

/* ------------------------------ Memory Match ------------------------------ */

interface Card {
  id: number;
  emoji: string;
  matched: boolean;
}

function buildDeck(difficulty: Difficulty, objects: PackObject[]): Card[] {
  const pairs = 3 + difficulty; // 4 to 8 pairs
  const chosen = shuffle(objects).slice(0, pairs);
  const doubled = [...chosen, ...chosen].map((o, i) => ({
    id: i,
    emoji: o.emoji,
    matched: false,
  }));
  return shuffle(doubled);
}

function MemoryMatchGame({ difficulty, objects, onFinish }: GameProps) {
  const { t } = useI18n();
  const [deck, setDeck] = useState<Card[]>(() =>
    buildDeck(difficulty, objects),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());

  const totalPairs = deck.length / 2;

  const handleFlip = (card: Card) => {
    if (flipped.length === 2 || card.matched || flipped.includes(card.id))
      return;
    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const [a, b] = next.map((id) => deck.find((c) => c.id === id)!);
      if (a.emoji === b.emoji) {
        const newMatched = matchedCount + 1;
        setMatchedCount(newMatched);
        setDeck((d) =>
          d.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, matched: true } : c,
          ),
        );
        setFlipped([]);
        if (newMatched === totalPairs) {
          onFinish({
            accuracy: Math.min(
              100,
              Math.round((totalPairs / newAttempts) * 100),
            ),
            attempts: newAttempts,
            completion: 100,
            responseTimeMs: Date.now() - startTime,
          });
        }
      } else {
        window.setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-3">
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <button
              key={card.id}
              type="button"
              data-ocid={`game.card.${card.id}`}
              aria-label={isFlipped ? card.emoji : "Hidden card"}
              onClick={() => handleFlip(card)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                isFlipped
                  ? "border-primary bg-primary/10 shadow-subtle"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-subtle",
              )}
            >
              {isFlipped ? <span aria-hidden="true">{card.emoji}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-3xl bg-card p-4 shadow-subtle">
        <span className="text-base font-semibold text-muted-foreground">
          {t("attempts")}: {attempts}
        </span>
        <span className="text-base font-semibold text-muted-foreground">
          {matchedCount} / {totalPairs}
        </span>
        <BigButton
          type="button"
          variant="outline"
          size="sm"
          data-ocid="game.restart_button"
          onClick={() => {
            setDeck(buildDeck(difficulty, objects));
            setFlipped([]);
            setMatchedCount(0);
            setAttempts(0);
          }}
        >
          <RefreshCw className="size-5" aria-hidden="true" />
          {t("playAgain")}
        </BigButton>
      </div>
    </div>
  );
}

/* ------------------------------ Attention Game ---------------------------- */

interface Board {
  cells: { id: number; emoji: string; name: string }[];
  oddIndex: number;
}

function buildBoard(difficulty: Difficulty, objects: PackObject[]): Board {
  const gridSize = 3 + difficulty; // 4 to 8 cells
  const base = objects[Math.floor(Math.random() * objects.length)];
  let odd = objects[Math.floor(Math.random() * objects.length)];
  while (odd.emoji === base.emoji) {
    odd = objects[Math.floor(Math.random() * objects.length)];
  }
  const oddIndex = Math.floor(Math.random() * gridSize);
  const cells = Array.from({ length: gridSize }, (_, i) => ({
    id: i,
    emoji: i === oddIndex ? odd.emoji : base.emoji,
    name: i === oddIndex ? odd.name : base.name,
  }));
  return { cells, oddIndex };
}

function AttentionGame({ difficulty, objects, onFinish }: GameProps) {
  const { t } = useI18n();
  const rounds = 4 + difficulty;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [board, setBoard] = useState<Board>(() =>
    buildBoard(difficulty, objects),
  );
  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (index: number) => {
    if (picked !== null) return;
    setPicked(index);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (index === board.oddIndex) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      window.setTimeout(() => {
        if (round + 1 >= rounds) {
          onFinish({
            accuracy: Math.min(100, Math.round((rounds / newAttempts) * 100)),
            attempts: newAttempts,
            completion: 100,
            responseTimeMs: Date.now() - startTime,
          });
        } else {
          setRound((r) => r + 1);
          setBoard(buildBoard(difficulty, objects));
          setPicked(null);
        }
      }, 700);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-lg font-semibold text-muted-foreground">
        Round {round + 1} / {rounds}
      </p>
      <p className="text-center text-xl font-semibold">
        Find the one that is different
      </p>
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
        {board.cells.map((cell, index) => {
          const isPicked = picked === index;
          const isOdd = index === board.oddIndex;
          return (
            <button
              key={cell.id}
              type="button"
              data-ocid={`game.attention.${index}`}
              aria-label={isOdd ? "The different one" : "Same object"}
              onClick={() => handlePick(index)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border-2 text-4xl transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                isPicked && isOdd
                  ? "border-success bg-success/15 shadow-subtle"
                  : isPicked
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-subtle",
              )}
            >
              <span aria-hidden="true">{cell.emoji}</span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-base font-semibold text-muted-foreground">
        {t("attempts")}: {attempts}
      </p>
    </div>
  );
}

/* ---------------------------- Object Recognition -------------------------- */

interface RecognitionQuestion {
  emoji: string;
  name: string;
  options: { emoji: string; name: string }[];
  answerIndex: number;
}

function buildRecognitionQuestion(objects: PackObject[]): RecognitionQuestion {
  const target = objects[Math.floor(Math.random() * objects.length)];
  const distractors = shuffle(
    objects.filter((o) => o.emoji !== target.emoji),
  ).slice(0, 3);
  const options = shuffle([target, ...distractors]);
  return {
    emoji: target.emoji,
    name: target.name,
    options,
    answerIndex: options.findIndex((o) => o.emoji === target.emoji),
  };
}

function RecognitionGame({ difficulty, objects, onFinish }: GameProps) {
  const { t } = useI18n();
  const rounds = 4 + difficulty;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [question, setQuestion] = useState<RecognitionQuestion>(() =>
    buildRecognitionQuestion(objects),
  );
  const [selected, setSelected] = useState<number | null>(null);

  const handlePick = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (index === question.answerIndex) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      window.setTimeout(() => {
        if (round + 1 >= rounds) {
          onFinish({
            accuracy: Math.min(100, Math.round((rounds / newAttempts) * 100)),
            attempts: newAttempts,
            completion: 100,
            responseTimeMs: Date.now() - startTime,
          });
        } else {
          setRound((r) => r + 1);
          setQuestion(buildRecognitionQuestion(objects));
          setSelected(null);
        }
      }, 700);
    } else {
      window.setTimeout(() => setSelected(null), 700);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-lg font-semibold text-muted-foreground">
        Round {round + 1} / {rounds}
      </p>
      <div className="mx-auto flex flex-col items-center gap-4">
        <span
          className="flex size-32 items-center justify-center rounded-3xl bg-primary/10 text-7xl shadow-subtle"
          aria-hidden="true"
        >
          {question.emoji}
        </span>
        <BigButton
          type="button"
          variant="outline"
          size="sm"
          data-ocid="game.recognition.listen_button"
          onClick={() => speak(`What is this? ${question.name}`)}
        >
          <Volume2 className="size-5" aria-hidden="true" />
          Listen
        </BigButton>
      </div>
      <p className="text-center text-xl font-semibold">What is this?</p>
      <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === question.answerIndex;
          return (
            <button
              key={option.name}
              type="button"
              data-ocid={`game.recognition.option.${index}`}
              onClick={() => handlePick(index)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-lg font-semibold transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                isSelected && isCorrect
                  ? "border-success bg-success/15"
                  : isSelected
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-subtle",
              )}
            >
              <span aria-hidden="true">{option.emoji}</span>
              {option.name}
            </button>
          );
        })}
      </div>
      <p className="text-center text-base font-semibold text-muted-foreground">
        {t("attempts")}: {attempts}
      </p>
    </div>
  );
}

/* ---------------------------- Routine Recall ------------------------------ */

function RoutineRecallGame({ difficulty, onFinish }: GameProps) {
  const { t } = useI18n();
  const rounds = 4 + difficulty;
  const [questions] = useState(() =>
    shuffle(ROUTINE_QUESTIONS).slice(0, rounds),
  );
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [selected, setSelected] = useState<number | null>(null);

  const question = questions[round];

  const handlePick = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (index === question.answerIndex) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      window.setTimeout(() => {
        if (round + 1 >= rounds) {
          onFinish({
            accuracy: Math.min(100, Math.round((rounds / newAttempts) * 100)),
            attempts: newAttempts,
            completion: 100,
            responseTimeMs: Date.now() - startTime,
          });
        } else {
          setRound((r) => r + 1);
          setSelected(null);
        }
      }, 700);
    } else {
      window.setTimeout(() => setSelected(null), 700);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-lg font-semibold text-muted-foreground">
        Round {round + 1} / {rounds}
      </p>
      <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-6 text-center shadow-subtle">
        <p className="text-2xl font-bold">{question.question}</p>
      </div>
      <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-3">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === question.answerIndex;
          return (
            <button
              key={option}
              type="button"
              data-ocid={`game.routine.option.${index}`}
              onClick={() => handlePick(index)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-lg font-semibold transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                isSelected && isCorrect
                  ? "border-success bg-success/15"
                  : isSelected
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-subtle",
              )}
            >
              {isSelected && isCorrect ? (
                <Check className="size-5" aria-hidden="true" />
              ) : null}
              {option}
            </button>
          );
        })}
      </div>
      <p className="text-center text-base font-semibold text-muted-foreground">
        {t("attempts")}: {attempts}
      </p>
    </div>
  );
}

/* ----------------------------- Pattern Memory ----------------------------- */

interface PatternTile {
  id: number;
  colorClass: string;
  label: string;
}

const PATTERN_TILE_COLORS: { colorClass: string; label: string }[] = [
  { colorClass: "bg-primary", label: "Teal" },
  { colorClass: "bg-accent", label: "Amber" },
  { colorClass: "bg-success", label: "Green" },
  { colorClass: "bg-warning", label: "Yellow" },
  { colorClass: "bg-destructive", label: "Red" },
  { colorClass: "bg-chart-4", label: "Violet" },
];

function buildPatternTiles(gridSize: number): PatternTile[] {
  return Array.from({ length: gridSize * gridSize }, (_, i) => {
    const c = PATTERN_TILE_COLORS[i % PATTERN_TILE_COLORS.length];
    return { id: i, colorClass: c.colorClass, label: c.label };
  });
}

function buildSequence(tiles: PatternTile[], length: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    seq.push(tiles[Math.floor(Math.random() * tiles.length)].id);
  }
  return seq;
}

function PatternMemoryGame({ difficulty, onFinish }: GameProps) {
  const { t } = useI18n();
  const gridSize = difficulty <= 2 ? 3 : difficulty <= 4 ? 4 : 5;
  const rounds = 4 + difficulty;
  const [tiles] = useState<PatternTile[]>(() => buildPatternTiles(gridSize));
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState<number[]>(() =>
    buildSequence(buildPatternTiles(gridSize), 3 + difficulty),
  );
  const [phase, setPhase] = useState<"watch" | "input" | "feedback">("watch");
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());

  const sequenceLengthFor = (r: number) =>
    Math.min(gridSize * gridSize, 3 + difficulty + r);

  useEffect(() => {
    if (phase !== "watch") return;
    let cancelled = false;
    const timers: number[] = [];
    const stepMs = Math.max(450, 900 - difficulty * 80);
    sequence.forEach((tileId, index) => {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setActiveTile(tileId);
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              setActiveTile(null);
            }, stepMs * 0.6),
          );
        }, index * stepMs),
      );
    });
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        setActiveTile(null);
        setPhase("input");
      }, sequence.length * stepMs),
    );
    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [phase, sequence, difficulty]);

  const advanceRound = (newAttempts: number) => {
    if (round + 1 >= rounds) {
      onFinish({
        accuracy: Math.min(100, Math.round((rounds / newAttempts) * 100)),
        attempts: newAttempts,
        completion: 100,
        responseTimeMs: Date.now() - startTime,
      });
    } else {
      setRound((r) => r + 1);
      setSequence(buildSequence(tiles, sequenceLengthFor(round + 1)));
      setInputIndex(0);
      setWrongTile(null);
      setPhase("watch");
    }
  };

  const handleTileTap = (tileId: number) => {
    if (phase !== "input") return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (tileId === sequence[inputIndex]) {
      const nextIndex = inputIndex + 1;
      setInputIndex(nextIndex);
      if (nextIndex >= sequence.length) {
        setCorrectRounds((c) => c + 1);
        setPhase("feedback");
        window.setTimeout(() => advanceRound(newAttempts), 700);
      }
    } else {
      setWrongTile(tileId);
      setPhase("feedback");
      window.setTimeout(() => advanceRound(newAttempts), 900);
    }
  };

  const restart = () => {
    setRound(0);
    setSequence(buildSequence(tiles, 3 + difficulty));
    setPhase("watch");
    setActiveTile(null);
    setInputIndex(0);
    setWrongTile(null);
    setCorrectRounds(0);
    setAttempts(0);
  };

  const isWatching = phase === "watch";

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-3xl bg-card p-4 shadow-subtle">
        <span className="text-base font-semibold text-muted-foreground">
          Round {round + 1} / {rounds}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {isWatching ? (
            <>
              <Eye className="size-4" aria-hidden="true" />
              Watch
            </>
          ) : (
            <>
              <Hand className="size-4" aria-hidden="true" />
              Your turn
            </>
          )}
        </span>
      </div>

      <div
        className={cn(
          "mx-auto grid w-full max-w-md gap-3",
          gridSize === 3
            ? "grid-cols-3"
            : gridSize === 4
              ? "grid-cols-4"
              : "grid-cols-5",
        )}
      >
        {tiles.map((tile) => {
          const isActive = activeTile === tile.id;
          const isWrong = wrongTile === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              data-ocid={`game.pattern.tile.${tile.id}`}
              aria-label={tile.label}
              disabled={phase !== "input"}
              onClick={() => handleTileTap(tile.id)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border-2 transition-all duration-200 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                tile.colorClass,
                isActive
                  ? "scale-105 border-foreground shadow-elevated brightness-110"
                  : isWrong
                    ? "border-destructive ring-2 ring-destructive/60"
                    : "border-border hover:border-primary/50 hover:shadow-subtle",
                phase === "input" && "cursor-pointer",
              )}
            >
              <span className="sr-only">{tile.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-base font-semibold text-muted-foreground">
        {t("attempts")}: {attempts}
      </p>

      <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-3xl bg-card p-4 shadow-subtle">
        <span className="text-base font-semibold text-muted-foreground">
          {correctRounds} / {rounds} correct
        </span>
        <BigButton
          type="button"
          variant="outline"
          size="sm"
          data-ocid="game.pattern.restart_button"
          onClick={restart}
        >
          <RefreshCw className="size-5" aria-hidden="true" />
          {t("playAgain")}
        </BigButton>
      </div>
    </div>
  );
}

/* ------------------------------- Mood Check ------------------------------- */

function MoodCheckGame({ onFinish }: GameProps) {
  const { t } = useI18n();
  const setMood = useAppStore((s) => s.setMood);
  const [startTime] = useState(() => Date.now());

  const handlePick = (mood: Mood) => {
    setMood(mood);
    onFinish({
      accuracy: 100,
      attempts: 1,
      completion: 100,
      responseTimeMs: Date.now() - startTime,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-2xl font-bold">{t("howAreYouFeeling")}</p>
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.mood}
            type="button"
            data-ocid={`game.mood.${option.mood}`}
            onClick={() => handlePick(option.mood)}
            className="flex flex-col items-center gap-2 rounded-3xl border-2 border-border bg-card p-6 text-lg font-semibold transition-all duration-300 hover:border-primary/50 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <span className="text-5xl" aria-hidden="true">
              {option.emoji}
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- Story Time ------------------------------- */

function StoryTimeGame({ difficulty, onFinish }: GameProps) {
  const { t } = useI18n();
  const rounds = 3 + difficulty;
  const [questions] = useState(() => shuffle(STORY_QUESTIONS).slice(0, rounds));
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [selected, setSelected] = useState<number | null>(null);

  const question = questions[round];

  const handlePick = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (index === question.answerIndex) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      window.setTimeout(() => {
        if (round + 1 >= rounds) {
          onFinish({
            accuracy: Math.min(100, Math.round((rounds / newAttempts) * 100)),
            attempts: newAttempts,
            completion: 100,
            responseTimeMs: Date.now() - startTime,
          });
        } else {
          setRound((r) => r + 1);
          setSelected(null);
        }
      }, 700);
    } else {
      window.setTimeout(() => setSelected(null), 700);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-6 shadow-subtle">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-bold">{STORY.title}</h3>
          <BigButton
            type="button"
            variant="outline"
            size="sm"
            data-ocid="game.story.listen_button"
            onClick={() => speak(`${STORY.title}. ${STORY.text}`)}
          >
            <Volume2 className="size-5" aria-hidden="true" />
            Listen
          </BigButton>
        </div>
        <p className="mt-3 text-lg leading-relaxed text-foreground">
          {STORY.text}
        </p>
      </div>

      <p className="text-center text-lg font-semibold text-muted-foreground">
        Question {round + 1} / {rounds}
      </p>
      <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-6 text-center shadow-subtle">
        <p className="text-2xl font-bold">{question.question}</p>
      </div>
      <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-3">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === question.answerIndex;
          return (
            <button
              key={option}
              type="button"
              data-ocid={`game.story.option.${index}`}
              onClick={() => handlePick(index)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-lg font-semibold transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                isSelected && isCorrect
                  ? "border-success bg-success/15"
                  : isSelected
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-subtle",
              )}
            >
              {isSelected && isCorrect ? (
                <Check className="size-5" aria-hidden="true" />
              ) : null}
              {option}
            </button>
          );
        })}
      </div>
      <p className="text-center text-base font-semibold text-muted-foreground">
        {t("attempts")}: {attempts}
      </p>
    </div>
  );
}

/* -------------------------------- Game Page ------------------------------- */

export function GamePage() {
  const { gameId } = useParams({ from: "/games/$gameId" });
  const navigate = useNavigate();
  const { t } = useI18n();
  const addGameResult = useAppStore((s) => s.addGameResult);
  const journey = useAppStore((s) => s.journey);
  const selectedPackId = useAppStore((s) => s.selectedPackId);

  const game = DEMO_GAMES.find((g) => g.id === gameId) ?? DEMO_GAMES[0];
  const difficulty = journey.recommendedDifficulty[game.skillArea];
  const objects = PACK_THEMES[selectedPackId ?? "nature"] ?? PACK_THEMES.nature;

  const [result, setResult] = useState<GameResult | null>(null);

  const finishGame = (metrics: GameMetrics) => {
    const score =
      metrics.score ??
      Math.round(
        metrics.accuracy * 0.6 +
          Math.max(0, 100 - (metrics.attempts / 10) * 100) * 0.2 +
          metrics.completion * 0.2,
      );
    const res: GameResult = {
      id: `game-${Date.now()}`,
      gameId: game.id,
      gameName: game.name,
      skillArea: game.skillArea,
      difficulty,
      accuracy: metrics.accuracy,
      responseTimeMs: metrics.responseTimeMs,
      attempts: metrics.attempts,
      completion: metrics.completion,
      score,
      timestamp: Date.now(),
      synced: false,
    };
    addGameResult(res);
    setResult(res);
  };

  const playAgain = () => setResult(null);
  const goHome = () => navigate({ to: "/elderly" });

  if (result) {
    return (
      <div className="animate-fade-in-up">
        <GameResultScreen
          result={result}
          onPlayAgain={playAgain}
          onHome={goHome}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji={game.icon}
        title={game.name}
        subtitle={`${t("skillArea")}: ${t(SKILL_LABEL[game.skillArea])} · ${t("level")} ${difficulty}`}
        action={<DemoBadge />}
      />

      {game.id === "memory-match" ? (
        <MemoryMatchGame
          game={game}
          difficulty={difficulty}
          objects={objects}
          onFinish={finishGame}
        />
      ) : game.id === "pattern-memory" ? (
        <PatternMemoryGame
          game={game}
          difficulty={difficulty}
          objects={objects}
          onFinish={finishGame}
        />
      ) : game.id === "attention-focus" ? (
        <AttentionGame
          game={game}
          difficulty={difficulty}
          objects={objects}
          onFinish={finishGame}
        />
      ) : game.id === "recognition" ? (
        <RecognitionGame
          game={game}
          difficulty={difficulty}
          objects={objects}
          onFinish={finishGame}
        />
      ) : game.id === "routine-recall" ? (
        <RoutineRecallGame
          game={game}
          difficulty={difficulty}
          objects={objects}
          onFinish={finishGame}
        />
      ) : game.id === "engagement" ? (
        <StoryTimeGame
          game={game}
          difficulty={difficulty}
          objects={objects}
          onFinish={finishGame}
        />
      ) : (
        <MoodCheckGame
          game={game}
          difficulty={difficulty}
          objects={objects}
          onFinish={finishGame}
        />
      )}

      <div className="flex justify-center">
        <BigButton
          type="button"
          variant="outline"
          data-ocid="game.home_button"
          onClick={goHome}
        >
          <Home className="size-5" aria-hidden="true" />
          {t("home")}
        </BigButton>
      </div>
    </div>
  );
}
