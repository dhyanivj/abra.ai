'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Video,
  RefreshCw,
  Download,
  AlertCircle,
  Play,
  Wand2,
  Hand,
  Flame,
  Eye,
  PenLine,
  Zap,
  Snowflake,
  Orbit,
  Sprout,
  Droplet,
  Layers,
  Cpu,
  Shield,
  Wind,
  Ghost,
  Sun,
  ChevronDown,
  ChevronUp,
  Moon,
} from 'lucide-react';

/* ─── Preset Data ─── */
const PRESETS = [
  {
    id: 'butterfly',
    name: 'Glowing Butterfly',
    icon: Sparkles,
    desc: 'A 3D butterfly emerges from your palm with realistic light reflections.',
    prompt:
      'In this video, a person reaches their hand toward the camera. Generate a realistic 3D glowing butterfly that emerges from their palm, following the hand\'s motion path accurately. Ensure the light from the butterfly casts realistic reflections on the hand and fingers.',
  },
  {
    id: 'fireball',
    name: 'Fireball Conjuring',
    icon: Flame,
    desc: 'A sphere of fire hovers above your palm casting warm light.',
    prompt:
      'In this video, a person reaches their hand toward the camera. Generate a realistic crackling sphere of fire that hovers and grows above their palm, casting dynamic warm light and shadows onto the person\'s hand and face.',
  },
  {
    id: 'vanish',
    name: 'Object Vanish',
    icon: Eye,
    desc: 'Hold an item, close your hand, open it — the item is gone.',
    prompt:
      'In this video, a person holds a small object in their palm and closes their hand. When they open it, the object has completely vanished, leaving their palm empty. Maintain realistic hand texture and shadows.',
  },
  {
    id: 'lightning',
    name: 'Lightning Spark',
    icon: Zap,
    desc: 'Crackling blue electric arcs dance across your fingertips.',
    prompt:
      'In this video, a person reaches their hand toward the camera. Generate crackling blue electric arcs and lightning bolts that spark and dance between their fingers, casting dynamic blue light and highlights on their hand and forearm.',
  },
  {
    id: 'freeze',
    name: 'Glacial Freeze',
    icon: Snowflake,
    desc: 'Frost crawls up your hand, emitting cold white condensation mist.',
    prompt:
      'In this video, frost and ice crystals rapidly propagate from the fingertips down the hand, turning the skin into a translucent ice texture, accompanied by realistic wisps of cold white condensation mist.',
  },
  {
    id: 'portal',
    name: 'Cosmic Portal',
    icon: Orbit,
    desc: 'A miniature swirling spacetime portal opens above your palm.',
    prompt:
      'In this video, a miniature swirling cosmic wormhole/portal opens above the palm. It has a bright glowing ring with stars and nebula dust spinning inside, casting colorful purple and teal ambient light on the hand.',
  },
  {
    id: 'flora',
    name: 'Nature Bloom',
    icon: Sprout,
    desc: 'Vines sprout and a glowing fantasy flower blossoms on your palm.',
    prompt:
      'In this video, rapid organic growth of green leaves and twisting vines sprout from the palm, culminating in a beautiful glowing fantasy flower blooming in the center of the hand.',
  },
  {
    id: 'gold',
    name: 'Alchemist Touch',
    icon: Droplet,
    desc: 'Your skin turns into reflective, highly liquid molten gold.',
    prompt:
      'In this video, a molten gold metallic texture flows and coats the hand starting from the fingertips, turning it into highly reflective, fluid golden metal with realistic reflections and specular highlights.',
  },
  {
    id: 'cards',
    name: 'Card Levitation',
    icon: Layers,
    desc: 'A deck of miniature playing cards hovers and orbits your wrist.',
    prompt:
      'In this video, a miniature deck of glowing playing cards floats, spins, and cascades in a circular orbit around the user\'s hand and wrist, casting subtle white light reflections.',
  },
  {
    id: 'pixel',
    name: 'Cyber Glitch',
    icon: Cpu,
    desc: 'Your hand pixelates into glowing holographic digital voxels.',
    prompt:
      'In this video, the hand undergoes a digital voxel glitch effect, dissolving into small, glowing holographic cubic pixels that float upwards and fade, casting cyan light onto the hand.',
  },
  {
    id: 'bubble',
    name: 'Aura Shield',
    icon: Shield,
    desc: 'An iridescent soap-bubble shield wraps around your hand.',
    prompt:
      'In this video, a translucent, shimmering iridescent soap-bubble-like energy shield hovers around the hand, reacting with ripples of rainbow colors when the hand moves.',
  },
  {
    id: 'tornado',
    name: 'Wind Vortex',
    icon: Wind,
    desc: 'A mini wind hurricane with leaves spins on your palm.',
    prompt:
      'In this video, a miniature swirling tornado vortex forms on the user\'s palm, carrying small debris and glowing leaves that spin rapidly, casting ambient orange light.',
  },
  {
    id: 'shadow',
    name: 'Shadow Morph',
    icon: Ghost,
    desc: 'Your shadow morphs into a creature and moves independently.',
    prompt:
      'In this video, the shadow of the hand on the background detaches from the hand\'s actual movement, morphs into a glowing-eyed shadow creature shape, and moves independently.',
  },
  {
    id: 'nebula',
    name: 'Galaxy Spin',
    icon: Sun,
    desc: 'A spinning cosmic galaxy rotates slowly over your palm.',
    prompt:
      'In this video, a miniature spiral galaxy with a bright core and spinning arms of stardust and colorful nebulas hovers and rotates just above the palm.',
  },
  {
    id: 'custom',
    name: 'Custom Effect',
    icon: PenLine,
    desc: 'Describe your own magic trick to render.',
    prompt: '',
  },
] as const;

type RecordingState = 'idle' | 'countdown' | 'recording' | 'processing' | 'result';

/* ─── Smoke Text Effect ─── */
const HEADING = 'abra.ai';
const CYCLE_DURATION = 6; // seconds per full loop

function SmokeText({ isDark }: { isDark: boolean }) {
  const chars = HEADING.split('');

  return (
    <h1 className={`text-4xl font-bold tracking-tight md:text-5xl transition-colors duration-300 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
      {/* Accessible fallback */}
      <span className="sr-only">{HEADING}</span>

      {/* Visible animated characters */}
      <span aria-hidden="true" className="relative">
        {chars.map((char, i) => {
          const total = chars.length;
          const stagger = (i / total) * 0.4;

          return (
            <motion.span
              key={i}
              className="inline-block"
              style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
              animate={{
                opacity: [0, 1, 1, 0],
                filter: [
                  'blur(8px)',
                  'blur(0px)',
                  'blur(0px)',
                  'blur(8px)',
                ],
                y: [6, 0, 0, -6],
              }}
              transition={{
                duration: CYCLE_DURATION,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: stagger,
                times: [0, 0.15, 0.8, 1],
              }}
            >
              {char}
            </motion.span>
          );
        })}
      </span>
    </h1>
  );
}

/* ─── Component ─── */
export default function Home() {
  const [cameraOn, setCameraOn] = useState(false);
  const [state, setState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recSeconds, setRecSeconds] = useState(5);
  const [preset, setPreset] = useState('butterfly');
  const [showAllEffects, setShowAllEffects] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rawUrl, setRawUrl] = useState<string | null>(null);
  const [magicUrl, setMagicUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isDark, setIsDark] = useState(true);

  const toggleTheme = (e: React.MouseEvent) => {
    if (!document.startViewTransition) {
      setIsDark((prev) => !prev);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setIsDark((prev) => !prev);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: isDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: isDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        }
      );
    });
  };

  /* ─── Status rotation ─── */
  useEffect(() => {
    if (state !== 'processing') return;
    const msgs = [
      'Uploading video…',
      'Analyzing gesture…',
      'Generating effects…',
      'Rendering output…',
      'Almost there…',
    ];
    let i = 0;
    setStatus(msgs[0]);
    const id = setInterval(() => {
      i = (i + 1) % msgs.length;
      setStatus(msgs[i]);
    }, 3000);
    return () => clearInterval(id);
  }, [state]);

  /* ─── Cleanup on unmount ─── */
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const prompt = useCallback(() => {
    const p = PRESETS.find((x) => x.id === preset);
    if (p?.id === 'custom') return customPrompt || 'Apply a magic spark effect to the hand.';
    return p?.prompt ?? '';
  }, [preset, customPrompt]);

  /* ─── Camera ─── */
  const startCamera = async () => {
    try {
      setError(null);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setCameraOn(true);
      setState('idle');
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  /* ─── Recording flow ─── */
  const beginCountdown = () => {
    if (!streamRef.current) return;
    setState('countdown');
    setCountdown(3);
    let n = 3;
    const id = setInterval(() => {
      n--;
      if (n > 0) setCountdown(n);
      else {
        clearInterval(id);
        beginRecording();
      }
    }, 1000);
  };

  const beginRecording = () => {
    if (!streamRef.current) return;
    setState('recording');
    setRecSeconds(5);
    chunksRef.current = [];

    const mime = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find((m) =>
      MediaRecorder.isTypeSupported(m),
    );
    if (!mime) {
      setError('No supported recording format found.');
      setState('idle');
      return;
    }

    const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
    recorderRef.current = rec;

    rec.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data);
    };

    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType });
      setRawUrl(URL.createObjectURL(blob));
      stopCamera();
      processMagic(blob);
    };

    rec.start();

    let left = 5;
    const id = setInterval(() => {
      left--;
      setRecSeconds(left);
      if (left <= 0) {
        clearInterval(id);
        if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
      }
    }, 1000);
  };

  /* ─── API call ─── */
  const processMagic = async (blob: Blob) => {
    setState('processing');
    setError(null);

    const fd = new FormData();
    fd.append('video', blob, 'setup.webm');
    fd.append('prompt', prompt());

    try {
      const res = await fetch('/api/magic', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Processing failed.');
      if (!data.success || !data.video) throw new Error('Invalid response.');

      const bytes = atob(data.video);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      setMagicUrl(URL.createObjectURL(new Blob([arr], { type: 'video/mp4' })));
      setState('result');
    } catch (e: any) {
      setError(e.message);
      setState('idle');
      startCamera();
    }
  };

  const reset = () => {
    setRawUrl(null);
    setMagicUrl(null);
    setState('idle');
    startCamera();
  };

  const download = () => {
    if (!magicUrl) return;
    const a = document.createElement('a');
    a.href = magicUrl;
    a.download = `magic-${preset}-${Date.now()}.mp4`;
    a.click();
  };

  const renderPresetBtn = (p: typeof PRESETS[number]) => {
    const Icon = p.icon;
    const active = preset === p.id;
    return (
      <motion.button
        key={p.id}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setPreset(p.id)}
        disabled={state !== 'idle'}
        className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
          active
            ? isDark
              ? 'border-zinc-650 bg-zinc-800/40 shadow-sm'
              : 'border-zinc-300 bg-zinc-100/70 shadow-sm'
            : isDark
              ? 'border-zinc-800/30 bg-transparent hover:border-zinc-700/40 hover:bg-zinc-900/20'
              : 'border-zinc-200 bg-transparent hover:border-zinc-300/60 hover:bg-zinc-50/40'
        }`}
      >
        <div
          className={`mt-0.5 rounded-lg border p-2 transition-colors ${
            active
              ? isDark
                ? 'border-zinc-600 bg-zinc-700/40 text-white'
                : 'border-zinc-300 bg-zinc-200/50 text-zinc-900'
              : isDark
                ? 'border-zinc-800 bg-zinc-900 text-zinc-500'
                : 'border-zinc-200 bg-zinc-100 text-zinc-400'
          }`}
        >
          <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium transition-colors ${
                active
                  ? isDark ? 'text-white' : 'text-zinc-900'
                  : isDark ? 'text-zinc-300' : 'text-zinc-700'
              }`}
            >
              {p.name}
            </span>
            {active && <span className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-zinc-900'}`} />}
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{p.desc}</p>
        </div>
      </motion.button>
    );
  };

  /* ─── Shared card classes ─── */
  const card = isDark
    ? 'rounded-2xl border border-zinc-700/40 bg-[#111113] p-6 transition-all duration-300'
    : 'rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300';

  /* ─── Render ─── */
  return (
    <div className={`min-h-screen relative transition-colors duration-500 ${isDark ? 'bg-[#09090B] text-zinc-100 bg-grid' : 'bg-[#FAFAFA] text-zinc-900 bg-grid-light'}`}>
      {/* Floating Theme Toggle */}
      <div className="absolute right-6 top-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`rounded-full border p-2.5 transition-all duration-300 ${
            isDark
              ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'border-zinc-200 bg-white text-zinc-600 hover:text-black hover:bg-zinc-50 shadow-sm'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>
      </div>

      {/* Top spotlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.03), transparent)'
            : 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,0,0,0.015), transparent)',
        }}
      />

      <div className={`relative mx-auto px-6 py-16 md:py-24 transition-all duration-500 ease-in-out ${showAllEffects ? 'max-w-7xl' : 'max-w-5xl'}`}>
        {/* ─── Header ─── */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          <SmokeText isDark={isDark} />
          <p className={`mx-auto mt-3 max-w-lg text-sm leading-relaxed transition-colors duration-300 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
            Record a 5-second gesture and watch AI generate realistic video effects with accurate
            physics, lighting, and reflections.
          </p>
        </motion.header>

        {/* ─── Error ─── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto mb-8 flex max-w-2xl items-start gap-3 rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Main Content ─── */}
        <AnimatePresence mode="wait">
          {state !== 'result' ? (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 lg:grid-cols-12"
            >
              {/* ─ Camera Panel ─ */}
              <div className={`${showAllEffects ? 'lg:col-span-4' : 'lg:col-span-7'} ${card} transition-all duration-500`}>
                <h2 className={`mb-5 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <Video size={16} className={isDark ? 'text-zinc-500' : 'text-zinc-400'} />
                  Camera
                </h2>

                <div className={`relative aspect-video w-full overflow-hidden rounded-xl border transition-all duration-300 ${isDark ? 'border-zinc-850 bg-black' : 'border-zinc-200 bg-zinc-50'}`}>
                  {!cameraOn ? (
                    /* ─ Empty state ─ */
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className={`rounded-full border p-4 transition-colors ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-100'}`}>
                        <Video size={24} className={isDark ? 'text-zinc-600' : 'text-zinc-400'} />
                      </div>
                      <p className={`text-xs transition-colors ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>No camera connected</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startCamera}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${
                          isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-850'
                        }`}
                      >
                        <Play size={12} fill={isDark ? 'black' : 'white'} />
                        Enable Camera
                      </motion.button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={setVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover [transform:scaleX(-1)]"
                      />

                      {/* Idle target */}
                      {state === 'idle' && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="animate-pulse-ring flex h-44 w-44 items-center justify-center rounded-full border border-dashed border-zinc-700/50">
                            <Hand size={20} className="text-zinc-600" />
                          </div>
                        </div>
                      )}

                      {/* Countdown */}
                      <AnimatePresence>
                        {state === 'countdown' && (
                          <motion.div
                            key="countdown"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/80"
                          >
                            <motion.span
                              key={countdown}
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.4 }}
                              transition={{ duration: 0.3 }}
                              className="text-7xl font-bold tabular-nums text-white"
                            >
                              {countdown}
                            </motion.span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Recording pill */}
                      {state === 'recording' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-red-800/40 bg-red-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-red-400"
                        >
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                          REC {recSeconds}s
                        </motion.div>
                      )}

                      {/* Processing */}
                      {state === 'processing' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/90"
                        >
                          {/* Spinner */}
                          <div className="relative h-10 w-10">
                            <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-zinc-300" />
                          </div>

                          {/* Progress bar */}
                          <div className="h-0.5 w-40 overflow-hidden rounded-full bg-zinc-800">
                            <motion.div
                              className="h-full bg-zinc-400"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 30, ease: 'linear' }}
                            />
                          </div>

                          <div className="text-center">
                            <p className="text-xs font-medium text-zinc-300">{status}</p>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-5">
                  {cameraOn && state === 'idle' && (
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={beginCountdown}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-sm transition-colors ${
                        isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      <Sparkles size={14} />
                      Record Gesture
                    </motion.button>
                  )}
                  {state === 'recording' && (
                    <div className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm transition-colors ${
                      isDark ? 'border-zinc-800 bg-zinc-900/60 text-zinc-500' : 'border-zinc-200 bg-zinc-100/60 text-zinc-600'
                    }`}>
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                      Capturing…
                    </div>
                  )}
                  {state === 'countdown' && (
                    <div className={`flex w-full items-center justify-center rounded-xl border py-3 text-sm transition-colors ${
                      isDark ? 'border-zinc-800 bg-zinc-900/60 text-zinc-600' : 'border-zinc-200 bg-zinc-100/60 text-zinc-500'
                    }`}>
                      Get ready…
                    </div>
                  )}
                </div>
              </div>

              {/* ─ Controls Panel ─ */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className={`${showAllEffects ? 'lg:col-span-4' : 'lg:col-span-5'} ${card} transition-all duration-500`}
              >
                <h2 className={`mb-5 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <Wand2 size={16} className={isDark ? 'text-zinc-500' : 'text-zinc-400'} />
                  Effect
                </h2>

                <div className="space-y-2">
                  {PRESETS.filter((p) => ['butterfly', 'fireball', 'vanish'].includes(p.id)).map(renderPresetBtn)}

                  {/* See more toggle button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowAllEffects(!showAllEffects)}
                    className={`flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200 border rounded-xl ${
                      isDark 
                        ? 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/40 hover:bg-zinc-900/60 border-zinc-800/60' 
                        : 'text-zinc-600 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border-zinc-200 shadow-sm'
                    }`}
                  >
                    {showAllEffects ? (
                      <>
                        Hide extra effects <ChevronUp size={13} />
                      </>
                    ) : (
                      <>
                        See more sample effects (+11) <ChevronDown size={13} />
                      </>
                    )}
                  </motion.button>

                  {PRESETS.filter((p) => p.id === 'custom').map(renderPresetBtn)}
                </div>

                {/* Custom prompt */}
                <AnimatePresence>
                  {preset === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <label className={`mb-2 block text-[10px] font-semibold uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          Describe effect
                        </label>
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          disabled={state !== 'idle'}
                          rows={3}
                          placeholder="e.g. A tiny thunderstorm cloud hovering over my hand with lightning bolts…"
                          className={`w-full resize-none rounded-xl border p-3 text-sm transition-all focus:outline-none focus:ring-1 ${
                            isDark
                              ? 'border-zinc-800 bg-zinc-950 text-zinc-200 placeholder:text-zinc-700 focus:border-zinc-600 focus:ring-zinc-700'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-zinc-300'
                          }`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ─ Extra Effects Panel (3rd Column) ─ */}
              <AnimatePresence>
                {showAllEffects && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`lg:col-span-4 ${card} flex flex-col`}
                  >
                    <h2 className={`mb-5 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      <Sparkles size={16} className={isDark ? 'text-zinc-500' : 'text-zinc-400'} />
                      More Effects
                    </h2>
                    <div className={`space-y-2 overflow-y-auto max-h-[480px] pr-1 scrollbar-thin ${isDark ? 'scrollbar-thumb-zinc-800' : 'scrollbar-thumb-zinc-300'} scrollbar-track-transparent`}>
                      {PRESETS.filter((p) => !['butterfly', 'fireball', 'vanish', 'custom'].includes(p.id)).map(renderPresetBtn)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ─── Results ─── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`mx-auto max-w-4xl ${card} p-8`}
            >
              <h2 className={`mb-6 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <Sparkles size={16} className={isDark ? 'text-zinc-500' : 'text-zinc-400'} />
                Result
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Original
                  </p>
                  <div className={`aspect-video overflow-hidden rounded-xl border bg-black transition-colors ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    {rawUrl && (
                      <video src={rawUrl} controls className="h-full w-full object-cover" />
                    )}
                  </div>
                </div>
                <div>
                  <p className={`mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <Sparkles size={10} /> Generated
                  </p>
                  <div className={`aspect-video overflow-hidden rounded-xl border shadow-sm transition-colors ${isDark ? 'border-zinc-700 bg-black' : 'border-zinc-200 bg-zinc-50'}`}>
                    {magicUrl && (
                      <video src={magicUrl} controls autoPlay loop className="h-full w-full object-cover" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={download}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm transition-colors ${
                    isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  <Download size={14} />
                  Download
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isDark ? 'border-zinc-800 text-zinc-450 hover:bg-zinc-900' : 'border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:border-zinc-300 shadow-sm'
                  }`}
                >
                  <RefreshCw size={14} />
                  New Trick
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Footer ─── */}
        <footer className={`mt-24 border-t pt-6 text-center text-[11px] transition-colors duration-300 ${isDark ? 'border-zinc-900 text-zinc-700' : 'border-zinc-200 text-zinc-500'}`}>
          Built with ❤️ by <a href="https://github.com/dhyanivj">Vijay Dhyani</a>
        </footer>
      </div>
    </div>
  );
}
