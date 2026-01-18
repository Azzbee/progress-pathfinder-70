import { useState, useEffect, useRef, useCallback } from 'react';

export function useAmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const createNoiseBuffer = useCallback((ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    
    return buffer;
  }, []);

  const startAmbient = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume * 0.5;
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Create filtered noise for water ambience
    const noiseBuffer = createNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Low-pass filter for smooth water sound
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;
    lowpass.Q.value = 1;

    // High-pass to remove rumble
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 80;

    noiseSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(masterGain);
    noiseSource.start();
    noiseNodeRef.current = noiseSource;

    // Create slow oscillators for depth
    const oscillators: OscillatorNode[] = [];
    
    // Deep drone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 60;
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.08;
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start();
    oscillators.push(osc1);

    // Gentle wave modulation
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 0.1;
    const modGain = ctx.createGain();
    modGain.gain.value = 20;
    osc2.connect(modGain);
    modGain.connect(lowpass.frequency);
    osc2.start();
    oscillators.push(osc2);

    oscillatorsRef.current = oscillators;
    setIsPlaying(true);
  }, [volume, getAudioContext, createNoiseBuffer]);

  const stopAmbient = useCallback(() => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }

    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillatorsRef.current = [];

    setIsPlaying(false);
  }, []);

  const toggleAmbient = useCallback(() => {
    if (isPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  }, [isPlaying, startAmbient, stopAmbient]);

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume * 0.5;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAmbient]);

  return {
    isPlaying,
    volume,
    startAmbient,
    stopAmbient,
    toggleAmbient,
    updateVolume
  };
}
