import { Mic, MicOff, Play, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BigButton } from "@/components/ui/BigButton";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/hooks/use-i18n";
import { LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const VOICE_COMMANDS = [
  { phrase: "Start today's game", action: "Starting today's brain game…" },
  {
    phrase: "Remind me about my medicine",
    action: "Your medicine reminder is at 08:00.",
  },
  {
    phrase: "How am I doing?",
    action: "You are doing wonderfully today, Asha ji!",
  },
  { phrase: "Play memory game", action: "Opening the memory match game…" },
  {
    phrase: "Next activity",
    action: "Your next activity is a gentle walk at 09:30.",
  },
];

const SAMPLE_LINES = [
  "Namaste, Asha ji. Today is a beautiful day.",
  "It is time for your morning medicine.",
  "Your granddaughter Priya called to say hello.",
  "Let's play a gentle memory game together.",
];

type RecognitionStatus = "idle" | "listening" | "processing" | "heard";

interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoicePage() {
  const { t, language, setLanguage } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const [line, setLine] = useState(SAMPLE_LINES[0]);
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-IN" : language;
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleCommand = (phrase: string) => {
    const match = VOICE_COMMANDS.find((c) =>
      phrase
        .toLowerCase()
        .includes(c.phrase.toLowerCase().split("'")[0].trim()),
    );
    const reply = match?.action ?? "I heard you. Let me help with that.";
    setResponse(reply);
    speak(reply);
  };

  const startListening = () => {
    setTranscript("");
    setResponse("");
    setStatus("listening");

    const SR = getSpeechRecognition();

    if (SR) {
      try {
        const recognition = new SR();
        recognition.lang = language === "en" ? "en-IN" : language;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setStatus("heard");
          handleCommand(text);
        };
        recognition.onerror = () => {
          setStatus("idle");
          simulateFallback();
        };
        recognition.onend = () => {
          if (status === "listening") setStatus("idle");
        };
        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch {
        // fall through to simulation
      }
    }

    simulateFallback();
  };

  const simulateFallback = () => {
    setStatus("processing");
    window.setTimeout(() => {
      const phrase =
        VOICE_COMMANDS[Math.floor(Math.random() * VOICE_COMMANDS.length)];
      setTranscript(phrase.phrase);
      setStatus("heard");
      handleCommand(phrase.phrase);
    }, 1600);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const listening = status === "listening" || status === "processing";

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="🎙️"
        title={t("voice")}
        subtitle={t("voiceAssistHint")}
        action={<DemoBadge />}
      />

      {/* Language selector */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle">
        <h2 className="font-display text-xl font-bold">{t("language")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => {
            const selected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                data-ocid={`voice.language.${lang.code}`}
                aria-pressed={selected}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "rounded-full border-2 px-4 py-2.5 text-base font-semibold transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/50",
                )}
              >
                {lang.native}
              </button>
            );
          })}
        </div>
      </section>

      {/* Talk to SmritiCare */}
      <section className="rounded-3xl bg-gradient-primary p-8 text-center text-primary-foreground shadow-elevated md:p-10">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          Talk to SmritiCare
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-lg opacity-90">
          Press the button and speak. I will listen and help you.
        </p>

        <button
          type="button"
          data-ocid="voice.mic_button"
          aria-label={
            listening ? "Stop listening" : "Start talking to SmritiCare"
          }
          onClick={listening ? stopListening : startListening}
          className={cn(
            "mx-auto mt-8 flex size-32 items-center justify-center rounded-full bg-white/20 text-white shadow-elevated transition-all duration-300 focus-visible:ring-[3px] focus-visible:ring-white/60",
            listening && "animate-pulse scale-105",
          )}
        >
          {listening ? (
            <MicOff className="size-14" aria-hidden="true" />
          ) : (
            <Mic className="size-14" aria-hidden="true" />
          )}
        </button>

        <p className="mt-6 text-lg font-semibold">
          {status === "listening"
            ? "Listening…"
            : status === "processing"
              ? "Thinking…"
              : status === "heard"
                ? "I heard you"
                : "Tap the mic to talk"}
        </p>

        {transcript ? (
          <p className="mx-auto mt-2 max-w-xl rounded-2xl bg-white/15 px-4 py-2 text-base">
            “{transcript}”
          </p>
        ) : null}
        {response ? (
          <p className="mx-auto mt-3 max-w-xl text-lg font-medium">
            {response}
          </p>
        ) : null}
      </section>

      {/* Voice commands */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-bold">Try saying</h2>
        {VOICE_COMMANDS.map((cmd, i) => (
          <button
            key={cmd.phrase}
            type="button"
            data-ocid={`voice.command.${i}`}
            onClick={() => {
              setTranscript(cmd.phrase);
              handleCommand(cmd.phrase);
            }}
            className="flex items-center gap-4 rounded-3xl bg-card p-5 text-left shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Play className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg">“{cmd.phrase}”</span>
          </button>
        ))}
      </section>

      {/* Read-aloud preview */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-bold">{t("voice")}</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <BigButton
            type="button"
            data-ocid="voice.speak_button"
            onClick={() => speak(line)}
            disabled={speaking}
          >
            <Volume2 className="size-5" aria-hidden="true" />
            {speaking ? t("loading") : t("play")}
          </BigButton>
          <BigButton
            type="button"
            data-ocid="voice.stop_button"
            variant="outline"
            onClick={stop}
            disabled={!speaking}
          >
            <Square className="size-5" aria-hidden="true" />
            {t("back")}
          </BigButton>
        </div>
        {SAMPLE_LINES.map((text, i) => (
          <button
            key={text}
            type="button"
            data-ocid={`voice.line.${i}`}
            onClick={() => {
              setLine(text);
              speak(text);
            }}
            className="flex items-center gap-4 rounded-3xl bg-card p-5 text-left shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Play className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg">{text}</span>
          </button>
        ))}
      </section>
    </div>
  );
}
