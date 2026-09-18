import {
  Check,
  Heart,
  MessageCircle,
  Mic,
  Music,
  Phone,
  PhoneCall,
  Play,
  Send,
  Square,
  Users,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BigButton } from "@/components/ui/BigButton";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DEMO_USER } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const FAMILY = [
  {
    name: "Priya",
    relation: "Granddaughter",
    emoji: "👧",
    color: "bg-primary/10",
  },
  { name: "Rohan", relation: "Son", emoji: "👨", color: "bg-accent/15" },
  {
    name: "Meera",
    relation: "Daughter-in-law",
    emoji: "👩",
    color: "bg-success/15",
  },
  { name: "Arjun", relation: "Grandson", emoji: "👦", color: "bg-warning/15" },
] as const;

const SHARED_TRACKS = [
  {
    title: "Bihu Beats",
    artist: "Family Favourites",
    emoji: "🥁",
    duration: "3:24",
  },
  {
    title: "Lullaby of the Brahmaputra",
    artist: "Grandma's Collection",
    emoji: "🎶",
    duration: "4:02",
  },
  {
    title: "Morning Raag",
    artist: "Shared with Priya",
    emoji: "🎻",
    duration: "5:11",
  },
] as const;

const MEMORIES = [
  {
    id: "mem-1",
    title: "Tea on the Veranda",
    image: "/assets/generated/memory-veranda.dim_800x600.png",
    alt: "Watercolor of Asha and her granddaughter Priya sharing tea on a wooden veranda overlooking green fields and the Brahmaputra river",
    story:
      "Every afternoon, Priya and I sit on the veranda with a cup of strong Assam tea. We watch the boats on the Brahmaputra and she tells me about her day. These quiet moments are my favourite part of the week.",
  },
  {
    id: "mem-2",
    title: "Bihu Celebrations",
    image: "/assets/generated/memory-bihu.dim_800x600.png",
    alt: "Watercolor of a family celebrating Bihu festival in Assam with traditional dance and marigold decorations",
    story:
      "At Bihu, the whole family gathers to dance and sing. Rohan plays the dhol and we all wear our best gamosa. The courtyard fills with laughter and the smell of fresh pitha. I always look forward to this festival.",
  },
  {
    id: "mem-3",
    title: "Cooking Pitha Together",
    image: "/assets/generated/memory-kitchen.dim_800x600.png",
    alt: "Watercolor of a grandmother and daughter-in-law making pitha rice cakes together in a warm traditional kitchen",
    story:
      "Meera and I make pitha together in the kitchen, just like my mother taught me. The steam rises and fills the house with a sweet smell. Passing these recipes to the next generation fills my heart with joy.",
  },
] as const;

type CallStatus = "idle" | "calling" | "connected" | "ended";

export function SocialPage() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callTarget, setCallTarget] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const recordTimerRef = useRef<number | null>(null);

  const firstName = DEMO_USER.name.split(" ")[0];

  const startCall = (name: string) => {
    setCallTarget(name);
    setCallStatus("calling");
  };

  const endCall = () => {
    setCallStatus("ended");
  };

  const resetCall = () => {
    setCallStatus("idle");
    setCallTarget("");
  };

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setSentMessage("Your voice message was sent to Priya.");
      return;
    }
    setRecordSeconds(0);
    setSentMessage(null);
    setRecording(true);
    recordTimerRef.current = window.setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  const toggleTrack = (title: string) => {
    setPlayingTrack((current) => (current === title ? null : title));
  };

  const selectedMemoryData = MEMORIES.find((m) => m.id === selectedMemory);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="👨‍👩‍👧‍👦"
        title="Family & Memories"
        subtitle="Stay close to the people you love"
        action={<DemoBadge />}
      />

      {/* Overview stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Family"
          value={`${FAMILY.length}`}
          icon={Users}
          hint="Loved ones nearby"
          tone="primary"
        />
        <StatCard
          label="Shared music"
          value={`${SHARED_TRACKS.length}`}
          icon={Music}
          hint="Tracks from family"
          tone="warm"
        />
        <StatCard
          label="Memories"
          value={`${MEMORIES.length}`}
          icon={Heart}
          hint="Stories to revisit"
          tone="success"
        />
      </section>

      {/* Call Family */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Phone className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">Call Family</h2>
            <p className="text-base text-muted-foreground">
              Tap a loved one to start a call
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FAMILY.map((member, i) => (
            <button
              key={member.name}
              type="button"
              data-ocid={`social.call.${i}`}
              onClick={() => startCall(member.name)}
              className="flex flex-col items-center gap-3 rounded-3xl border-2 border-border bg-background p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <span
                className={cn(
                  "flex size-16 items-center justify-center rounded-full text-3xl",
                  member.color,
                )}
                aria-hidden="true"
              >
                {member.emoji}
              </span>
              <span className="font-display text-lg font-bold">
                {member.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {member.relation}
              </span>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <PhoneCall className="size-4" aria-hidden="true" />
                Call
              </span>
            </button>
          ))}
        </div>

        {/* Call status panel */}
        {callStatus !== "idle" ? (
          <div
            data-ocid="social.call_panel"
            className="mt-6 rounded-3xl bg-gradient-primary p-6 text-center text-primary-foreground shadow-elevated"
          >
            {callStatus === "calling" ? (
              <>
                <p className="text-lg opacity-90">Calling {callTarget}…</p>
                <div className="mx-auto mt-4 flex size-20 animate-pulse items-center justify-center rounded-full bg-white/20">
                  <PhoneCall className="size-9" aria-hidden="true" />
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <BigButton
                    type="button"
                    data-ocid="social.call_connect"
                    variant="secondary"
                    onClick={() => setCallStatus("connected")}
                  >
                    <Check className="size-5" aria-hidden="true" />
                    Connect
                  </BigButton>
                  <BigButton
                    type="button"
                    data-ocid="social.call_cancel"
                    variant="outline"
                    onClick={resetCall}
                  >
                    Cancel
                  </BigButton>
                </div>
              </>
            ) : callStatus === "connected" ? (
              <>
                <p className="text-lg font-semibold">
                  Connected with {callTarget} 💬
                </p>
                <p className="mx-auto mt-2 max-w-md text-base opacity-90">
                  This is a simulated call. In the full version, this would
                  connect you to {callTarget} by video or voice.
                </p>
                <div className="mt-6 flex justify-center">
                  <BigButton
                    type="button"
                    data-ocid="social.call_end"
                    variant="secondary"
                    onClick={endCall}
                  >
                    <Square className="size-5" aria-hidden="true" />
                    End call
                  </BigButton>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">Call ended</p>
                <p className="mt-2 text-base opacity-90">
                  That was a lovely chat with {callTarget}.
                </p>
                <div className="mt-6 flex justify-center">
                  <BigButton
                    type="button"
                    data-ocid="social.call_done"
                    variant="secondary"
                    onClick={resetCall}
                  >
                    Done
                  </BigButton>
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>

      {/* Voice Message */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Mic className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">Voice Message</h2>
            <p className="text-base text-muted-foreground">
              Record a message for your family
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl bg-background p-6 text-center">
          <button
            type="button"
            data-ocid="social.record_button"
            aria-label={
              recording ? "Stop recording" : "Start recording a voice message"
            }
            onClick={toggleRecording}
            className={cn(
              "flex size-24 items-center justify-center rounded-full shadow-elevated transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              recording
                ? "animate-pulse bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {recording ? (
              <Square className="size-9" aria-hidden="true" />
            ) : (
              <Mic className="size-9" aria-hidden="true" />
            )}
          </button>

          <p className="text-lg font-semibold">
            {recording
              ? `Recording… ${recordSeconds}s`
              : sentMessage
                ? "Message sent"
                : "Tap the mic to record"}
          </p>

          {recording ? (
            <p className="text-base text-muted-foreground">
              Speak gently. Tap the square when you are done.
            </p>
          ) : null}

          {sentMessage ? (
            <div
              data-ocid="social.message_sent"
              className="flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-base font-semibold text-foreground"
            >
              <Send className="size-4 text-success" aria-hidden="true" />
              {sentMessage}
            </div>
          ) : null}
        </div>
      </section>

      {/* Shared Music */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <Music className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">Shared Music</h2>
            <p className="text-base text-muted-foreground">
              Tracks your family shared with you
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {SHARED_TRACKS.map((track, i) => {
            const isPlaying = playingTrack === track.title;
            return (
              <button
                key={track.title}
                type="button"
                data-ocid={`social.track.${i}`}
                onClick={() => toggleTrack(track.title)}
                className="flex items-center gap-4 rounded-3xl bg-background p-4 text-left shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <span
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl",
                    isPlaying ? "bg-primary/15" : "bg-accent/15",
                  )}
                  aria-hidden="true"
                >
                  {isPlaying ? (
                    <Volume2 className="size-6 animate-pulse text-primary" />
                  ) : (
                    <Play className="size-6 text-accent" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg font-bold">
                    {track.title}
                  </span>
                  <span className="block truncate text-base text-muted-foreground">
                    {track.artist}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                  {isPlaying ? "Playing…" : track.duration}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          This is a simulated music player. Tapping a track toggles a playing
          state.
        </p>
      </section>

      {/* Memory Album */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success">
            <Heart className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">Memory Album</h2>
            <p className="text-base text-muted-foreground">
              Tap a memory to hear its story
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MEMORIES.map((memory, i) => (
            <button
              key={memory.id}
              type="button"
              data-ocid={`social.memory.${i}`}
              onClick={() =>
                setSelectedMemory((current) =>
                  current === memory.id ? null : memory.id,
                )
              }
              className="group overflow-hidden rounded-3xl bg-background text-left shadow-subtle transition-all hover:-translate-y-1 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <img
                src={memory.image}
                alt={memory.alt}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-2 p-4">
                <span className="font-display text-lg font-bold">
                  {memory.title}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Tell me about this
                </span>
              </div>
            </button>
          ))}
        </div>

        {selectedMemoryData ? (
          <div
            data-ocid="social.memory_story"
            className="mt-6 rounded-3xl bg-gradient-warm p-6 text-accent-foreground shadow-elevated md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/25 text-2xl">
                💬
              </span>
              <h3 className="font-display text-xl font-bold">
                {selectedMemoryData.title}
              </h3>
            </div>
            <p className="mt-4 text-lg leading-relaxed">
              “{selectedMemoryData.story}”
            </p>
            <p className="mt-4 text-base font-semibold">
              — {firstName} ji, remembering with love
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
