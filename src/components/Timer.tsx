import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Sparkles, AlertCircle, Headphones, Check } from 'lucide-react';
import { Task, UserProfile } from '../types';

interface TimerProps {
  profile: UserProfile;
  tasks: Task[];
  onCompleteSession: (type: 'pomodoro' | 'short_break' | 'long_break', durationMinutes: number, taskId?: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  themePrimaryClass: string;
  themeAccentClass: string;
  themeCardClass: string;
}

export default function Timer({
  profile,
  tasks,
  onCompleteSession,
  selectedTaskId,
  setSelectedTaskId,
  themePrimaryClass,
  themeAccentClass,
  themeCardClass
}: TimerProps) {
  // Configurable Durations (in minutes)
  const [pomodoroDur, setPomodoroDur] = useState(25);
  const [shortBreakDur, setShortBreakDur] = useState(5);
  const [longBreakDur, setLongBreakDur] = useState(15);

  const [activeTab, setActiveTab] = useState<'pomodoro' | 'short_break' | 'long_break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Custom durations settings panel
  const [showSettings, setShowSettings] = useState(false);

  // Audio synthesis state
  const [soundType, setSoundType] = useState<'none' | 'rain' | 'focus_drone' | 'white_noise'>('none');
  const [audioVolume, setAudioVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);

  // Refs for Web Audio API synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainGainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const lowOscRef = useRef<OscillatorNode | null>(null);
  const lowOscGainRef = useRef<GainNode | null>(null);

  // Synchronize timer duration with active tab
  useEffect(() => {
    let dur = pomodoroDur;
    if (activeTab === 'short_break') dur = shortBreakDur;
    if (activeTab === 'long_break') dur = longBreakDur;
    setTimeLeft(dur * 60);
    setIsRunning(false);
  }, [activeTab, pomodoroDur, shortBreakDur, longBreakDur]);

  // Main timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Handle synthesized sound start/stop when type or volume changes
  useEffect(() => {
    if (soundType !== 'none' && !isMuted && isRunning) {
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [soundType, isMuted, isRunning]);

  // Adjust volume in real time
  useEffect(() => {
    const vol = isMuted ? 0 : audioVolume;
    if (rainGainNodeRef.current) {
      rainGainNodeRef.current.gain.setValueAtTime(vol * 0.15, audioCtxRef.current?.currentTime || 0);
    }
    if (lowOscGainRef.current) {
      lowOscGainRef.current.gain.setValueAtTime(vol * 0.25, audioCtxRef.current?.currentTime || 0);
    }
  }, [audioVolume, isMuted]);

  // Helper: Stop audio synthesis safely
  const stopAmbientSound = () => {
    try {
      if (noiseSourceNodeRef.current) {
        noiseSourceNodeRef.current.disconnect();
        noiseSourceNodeRef.current = null;
      }
      if (lowOscRef.current) {
        lowOscRef.current.stop();
        lowOscRef.current.disconnect();
        lowOscRef.current = null;
      }
      if (lowOscGainRef.current) {
        lowOscGainRef.current.disconnect();
        lowOscGainRef.current = null;
      }
      if (rainGainNodeRef.current) {
        rainGainNodeRef.current.disconnect();
        rainGainNodeRef.current = null;
      }
    } catch (e) {
      console.warn('Audio cleanup exception:', e);
    }
  };

  // Helper: Start ambient noise synthesis using Web Audio API
  const startAmbientSound = () => {
    stopAmbientSound();
    
    try {
      // Create audio context if it doesn't exist
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const activeVolume = isMuted ? 0 : audioVolume;

      if (soundType === 'rain') {
        // Synthesize dynamic rain
        // 1. White Noise source
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // 2. Highpass filter to simulate rain hiss
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.Q.setValueAtTime(0.6, ctx.currentTime);
        filter.gain.setValueAtTime(-10, ctx.currentTime);

        const filter2 = ctx.createBiquadFilter();
        filter2.type = 'lowpass';
        filter2.frequency.setValueAtTime(2800, ctx.currentTime);

        // Gain node
        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(activeVolume * 0.12, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(filter2);
        filter2.connect(rainGain);
        rainGain.connect(ctx.destination);

        whiteNoise.start();
        noiseSourceNodeRef.current = whiteNoise as any;
        rainGainNodeRef.current = rainGain;

        // Add a low rumbling ocean breeze oscillator (LFO)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow cycle

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.04, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(rainGain.gain); // modulate rain volume for gusts
        lfo.start();
        lowOscRef.current = lfo;

      } else if (soundType === 'focus_drone') {
        // Synthesize spacey focus drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const droneGain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // Low A

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110.5, ctx.currentTime); // Detuned for warmth

        // Lowpass filter to make it cozy
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        droneGain.gain.setValueAtTime(activeVolume * 0.25, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        lowOscRef.current = osc1;
        lowOscGainRef.current = droneGain;
        noiseSourceNodeRef.current = osc2 as any; // hold reference to stop

      } else if (soundType === 'white_noise') {
        // Standard cozy White Noise
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime); // Low pass filtered makes it brown/soft

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(activeVolume * 0.16, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        whiteNoise.start();
        noiseSourceNodeRef.current = whiteNoise as any;
        rainGainNodeRef.current = noiseGain;
      }
    } catch (err) {
      console.warn('Could not launch procedural synthesizer:', err);
    }
  };

  // Play celebratory audio chime at completion
  const playFocusCompleteChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Triangular arpeggio rise
      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, duration: number, type: 'triangle' | 'sine' = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // Play success chime chord (C maj arpeggio + sparkle)
      playTone(261.63, now, 0.4, 'triangle');       // C4
      playTone(329.63, now + 0.12, 0.4, 'triangle'); // E4
      playTone(392.00, now + 0.24, 0.4, 'triangle'); // G4
      playTone(523.25, now + 0.36, 0.6, 'sine');     // C5
      playTone(659.25, now + 0.48, 0.8, 'sine');     // E5
    } catch (err) {
      console.warn('Sound chime failed', err);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    stopAmbientSound();
    playFocusCompleteChime();

    const duration = activeTab === 'pomodoro' ? pomodoroDur : activeTab === 'short_break' ? shortBreakDur : longBreakDur;
    onCompleteSession(activeTab, duration, selectedTaskId || undefined);

    // Auto advancement alert / state
    if (activeTab === 'pomodoro') {
      // Suggest moving to break
      alert(`🎉 Focus Session Finished! Amazing work. Time to rest your eyes.`);
      setActiveTab('short_break');
    } else {
      alert(`💪 Break is over! Let's lock back in.`);
      setActiveTab('pomodoro');
    }
  };

  const toggleTimer = () => {
    // Unlock AudioContext on first user interaction if needed
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    stopAmbientSound();
    let dur = pomodoroDur;
    if (activeTab === 'short_break') dur = shortBreakDur;
    if (activeTab === 'long_break') dur = longBreakDur;
    setTimeLeft(dur * 60);
  };

  const skipTimer = () => {
    if (confirm('Are you sure you want to skip this session? No streak or XP will be saved.')) {
      setIsRunning(false);
      stopAmbientSound();
      if (activeTab === 'pomodoro') {
        setActiveTab('short_break');
      } else if (activeTab === 'short_break') {
        setActiveTab('pomodoro');
      } else {
        setActiveTab('pomodoro');
      }
    }
  };

  // Math helper for circular progress
  const totalSeconds = (activeTab === 'pomodoro' ? pomodoroDur : activeTab === 'short_break' ? shortBreakDur : longBreakDur) * 60;
  const percentage = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 100;
  
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Find currently linked task
  const currentTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center animate-in fade-in duration-300">
      
      {/* Banner / Tab Headers */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900 mb-8 border border-slate-800/80">
        <button
          id="timer-tab-pomodoro"
          onClick={() => setActiveTab('pomodoro')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'pomodoro'
              ? `${themePrimaryClass} shadow-lg`
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          🍅 Study Pomodoro
        </button>
        <button
          id="timer-tab-short"
          onClick={() => setActiveTab('short_break')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'short_break'
              ? `${themePrimaryClass} shadow-lg`
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          ☕ Short Break
        </button>
        <button
          id="timer-tab-long"
          onClick={() => setActiveTab('long_break')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'long_break'
              ? `${themePrimaryClass} shadow-lg`
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          🌴 Long Break
        </button>
      </div>

      {/* Main Focus Stage Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main circular Timer Card */}
        <div id="pomodoro-timer-card" className={`lg:col-span-7 p-8 rounded-3xl ${themeCardClass} flex flex-col items-center justify-center relative select-none`}>
          
          {/* Quick task-linked context display */}
          <div className="text-center mb-6 h-10 flex flex-col justify-center">
            {currentTask ? (
              <div className="flex items-center gap-2 justify-center">
                <span className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400`}>
                  {currentTask.category}
                </span>
                <span className="text-xs font-sans text-slate-300 truncate max-w-xs">
                  Focusing: <strong className="font-bold text-slate-100">{currentTask.title}</strong>
                </span>
              </div>
            ) : activeTab === 'pomodoro' ? (
              <span className="text-xs text-slate-500 font-sans font-bold uppercase tracking-wider">
                No focus task active. Choose or create a task!
              </span>
            ) : (
              <span className="text-xs text-indigo-400 font-black uppercase tracking-widest">
                Take a deep breath and stretch! 🧘‍♀️
              </span>
            )}
          </div>

          {/* SVG Circular Timer Progress representation */}
          <div className="relative w-72 h-72 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back track ring */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                className="stroke-slate-800 fill-transparent"
                strokeWidth="10"
              />
              {/* Front progress track */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                className={`fill-transparent transition-all duration-200 ease-linear ${themeAccentClass.split(' ')[0]}`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ stroke: 'currentColor' }}
              />
            </svg>

            {/* In-circle Typography timer readings */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span id="timer-numbers" className="font-display font-black text-[72px] tracking-tighter text-slate-50 leading-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase font-black text-indigo-400 mt-2.5">
                {isRunning ? 'KEEP CONCENTRATING' : 'TIMER PAUSED'}
              </span>
            </div>
          </div>

          {/* Timer controls strip */}
          <div className="flex gap-4 items-center justify-center">
            {/* Reset */}
            <button
              id="btn-timer-reset"
              onClick={resetTimer}
              title="Reset timer"
              className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              id="btn-timer-toggle"
              onClick={toggleTimer}
              className={`px-10 py-4 rounded-2xl font-sans font-black text-xs uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-xl active:scale-95 ${
                isRunning
                  ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 shadow-black/20'
                  : `${themePrimaryClass}`
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            {/* Skip */}
            <button
              id="btn-timer-skip"
              onClick={skipTimer}
              title="Skip this interval"
              className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Settings gear toggle link */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mt-6 text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer font-bold tracking-wider uppercase text-[10px]"
          >
            {showSettings ? 'Hide Timer Durations' : 'Customize Durations'}
          </button>

          {/* Quick inline Durations editor panel */}
          {showSettings && (
            <div className="mt-4 p-5 border border-slate-800 rounded-3xl bg-slate-950/80 w-full max-w-sm">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                Configure Study Plan (Minutes)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Study</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={pomodoroDur}
                    onChange={(e) => setPomodoroDur(Math.max(1, parseInt(e.target.value) || 25))}
                    className="w-full p-2.5 border border-slate-800 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={shortBreakDur}
                    onChange={(e) => setShortBreakDur(Math.max(1, parseInt(e.target.value) || 5))}
                    className="w-full p-2.5 border border-slate-800 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Long Break</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={longBreakDur}
                    onChange={(e) => setLongBreakDur(Math.max(1, parseInt(e.target.value) || 15))}
                    className="w-full p-2.5 border border-slate-800 rounded-xl text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar panels for Timer View: Task Picker & Audio backdrops */}
        <div className="lg:col-span-5 space-y-6">

          {/* Quick Task Connector */}
          <div className={`p-6 rounded-3xl ${themeCardClass}`}>
            <h3 className="font-display font-black text-slate-100 text-xs uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <span className="p-1 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
                <Check className="w-4 h-4" />
              </span>
              Link Study Task
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              Select an item from your study planner list. Completed Pomodoro counts will be synced directly to it.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tasks.filter(t => !t.completed).length === 0 ? (
                <div className="p-4 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs uppercase font-bold tracking-wider">
                  No active tasks found in your planner. Create some in the Planner tab!
                </div>
              ) : (
                tasks.filter(t => !t.completed).map((task) => {
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? `${themeAccentClass} border-current font-bold`
                          : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/60 text-slate-300'
                      }`}
                    >
                      <div className="overflow-hidden mr-2">
                        <div className="text-xs font-black text-slate-100 truncate">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            {task.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
                          </span>
                        </div>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-white transition-all ${
                        isSelected
                          ? `${themePrimaryClass.split(' ')[0]} border-transparent`
                          : 'border-slate-700 bg-slate-950'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Sound Synthesizer Backdrops */}
          <div className={`p-6 rounded-3xl ${themeCardClass}`}>
            <h3 className="font-display font-black text-slate-100 text-xs uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <span className="p-1 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
                <Headphones className="w-4 h-4" />
              </span>
              Ambient Background Sounds
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              Block out distractions with procedurally synthesized audio loops. Plays only while the focus timer is active.
            </p>

            {/* Sound presets selector */}
            <div className="space-y-2 mb-4">
              {[
                { id: 'none', label: '🔇 Silent Study Mode', desc: 'No background backing audio' },
                { id: 'rain', label: '🌧️ Cozy Autumn Rain', desc: 'Synthesized raindrops & distant breeze' },
                { id: 'focus_drone', label: '🪐 Deep Focus Drone', desc: 'Detuned triangular oscillators warm drone' },
                { id: 'white_noise', label: '💤 Natural Brown Noise', desc: 'Steady ocean rumble masking distraction' },
              ].map((sound) => {
                const isActive = soundType === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => {
                      setSoundType(sound.id as any);
                      // Start playing immediately if timer is already running
                      if (isRunning && sound.id !== 'none') {
                        // briefly timeout to allow react state to update
                        setTimeout(() => startAmbientSound(), 50);
                      }
                    }}
                    className={`w-full flex flex-col p-3 rounded-2xl text-left border transition-all ${
                      isActive
                        ? `${themeAccentClass} border-current font-bold`
                        : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/60 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black text-slate-100">{sound.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{sound.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Sound controls slider */}
            {soundType !== 'none' && (
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-500">Vol</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] font-mono text-slate-300">{Math.round(audioVolume * 100)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick study guidelines tip */}
          <div className="p-4 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Pomodoro Study Club Tip</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Study in deep focus for 25 minutes, then take a short 5-minute break to stretch, drink water, and let your brain integrate what you just learned. Repeat!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
