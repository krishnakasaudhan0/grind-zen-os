import { useStore } from '@/stores/useStore';
import { useState } from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['💻', '🚀', '⚡', '🧠', '🔥', '🎯', '👾', '🦾', '💡', '🎮'];

export function Onboarding() {
  const { setProfile, setOnboarded } = useStore();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💻');

  const handleStart = () => {
    setProfile(name || 'dev', emoji);
    setOnboarded(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface-card p-8 max-w-md w-full text-center"
      >
        <div className="text-4xl mb-4">⚡</div>
        <h1 className="font-mono text-2xl font-bold text-foreground mb-2">GRIND OS</h1>
        <p className="text-sm text-muted-foreground mb-6">Your personal productivity operating system</p>

        <div className="space-y-4">
          <div>
            <label className="label-mono block mb-2 text-left">WHAT'S YOUR NAME?</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-secondary border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              autoFocus
            />
          </div>

          <div>
            <label className="label-mono block mb-2 text-left">PICK YOUR AVATAR</label>
            <div className="flex gap-2 flex-wrap justify-center">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded flex items-center justify-center text-xl transition-default ${
                    emoji === e ? 'bg-primary/10 ring-1 ring-primary scale-110' : 'bg-secondary hover:scale-105'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-default mt-4"
          >
            INITIALIZE GRIND OS →
          </button>
        </div>

        <p className="font-mono text-[10px] text-muted-foreground mt-4">v1.0 · Built for the grind</p>
      </motion.div>
    </div>
  );
}
