import { useStore } from '@/stores/useStore';
import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

const ACCENT_COLORS = [
  { key: 'green' as const, label: 'GREEN', color: 'bg-primary' },
  { key: 'blue' as const, label: 'BLUE', color: 'bg-info' },
  { key: 'purple' as const, label: 'PURPLE', color: 'bg-special' },
  { key: 'amber' as const, label: 'AMBER', color: 'bg-warning' },
];

const EMOJIS = ['💻', '🚀', '⚡', '🧠', '🔥', '🎯', '👾', '🦾', '💡', '🎮', '🏴‍☠️', '🐱'];

export function SettingsTab() {
  const {
    userName, avatarEmoji, university, year, setProfile,
    pomodoroSettings, setPomodoroSettings,
    habits, removeHabit,
    accentColor, setAccentColor, compactMode, setCompactMode,
    exportData, importData, resetAllData, weeklyLeetCodeGoal, setWeeklyLeetCodeGoal,
  } = useStore();
  const [name, setName] = useState(userName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'grind-os-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        importData(text);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-mono font-bold mb-6">SETTINGS</h1>

      {/* Profile */}
      <div className="surface-card p-4 mb-4">
        <span className="label-mono">PROFILE</span>
        <div className="mt-3 space-y-3">
          <div>
            <label className="font-mono text-xs text-muted-foreground block mb-1">NAME</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => setProfile(name, avatarEmoji)}
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-muted-foreground block mb-1">AVATAR</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setProfile(name, e)}
                  className={`w-9 h-9 rounded flex items-center justify-center text-lg transition-default ${
                    avatarEmoji === e ? 'bg-primary/10 ring-1 ring-primary' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{year}</p>
        </div>
      </div>

      {/* Pomodoro */}
      <div className="surface-card p-4 mb-4">
        <span className="label-mono">🍅 POMODORO</span>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="font-mono text-[10px] text-muted-foreground">WORK (MIN)</label>
            <input type="number" value={pomodoroSettings.workDuration} onChange={e => setPomodoroSettings({ workDuration: +e.target.value })}
              className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground outline-none" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-muted-foreground">SHORT BREAK</label>
            <input type="number" value={pomodoroSettings.shortBreak} onChange={e => setPomodoroSettings({ shortBreak: +e.target.value })}
              className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground outline-none" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-muted-foreground">LONG BREAK</label>
            <input type="number" value={pomodoroSettings.longBreak} onChange={e => setPomodoroSettings({ longBreak: +e.target.value })}
              className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground outline-none" />
          </div>
          <div>
            <label className="font-mono text-[10px] text-muted-foreground">SESSIONS/LONG</label>
            <input type="number" value={pomodoroSettings.sessionsBeforeLong} onChange={e => setPomodoroSettings({ sessionsBeforeLong: +e.target.value })}
              className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground outline-none" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pomodoroSettings.soundEnabled} onChange={e => setPomodoroSettings({ soundEnabled: e.target.checked })}
              className="accent-primary" />
            <span className="font-mono text-xs text-foreground">Sound notifications</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={pomodoroSettings.autoStartBreak} onChange={e => setPomodoroSettings({ autoStartBreak: e.target.checked })}
              className="accent-primary" />
            <span className="font-mono text-xs text-foreground">Auto-start break</span>
          </label>
        </div>
      </div>

      {/* Habits management */}
      <div className="surface-card p-4 mb-4">
        <span className="label-mono">HABITS</span>
        <div className="space-y-2 mt-3">
          {habits.map(h => (
            <div key={h.id} className="flex items-center gap-3 p-2 rounded bg-secondary">
              <span>{h.emoji}</span>
              <span className="text-sm text-foreground flex-1">{h.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{h.type}</span>
              <button onClick={() => removeHabit(h.id)} className="text-muted-foreground hover:text-destructive transition-default">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LeetCode goal */}
      <div className="surface-card p-4 mb-4">
        <span className="label-mono">LEETCODE</span>
        <div className="mt-3">
          <label className="font-mono text-[10px] text-muted-foreground">WEEKLY GOAL</label>
          <input type="number" value={weeklyLeetCodeGoal} onChange={e => setWeeklyLeetCodeGoal(+e.target.value)} min={1}
            className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground outline-none mt-1" />
        </div>
      </div>

      {/* Data */}
      <div className="surface-card p-4">
        <span className="label-mono">DATA</span>
        <div className="flex flex-wrap gap-3 mt-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded bg-secondary text-foreground font-mono text-xs uppercase tracking-wider hover-glow transition-default">
            <Download size={14} />EXPORT JSON
          </button>
          <button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 rounded bg-secondary text-foreground font-mono text-xs uppercase tracking-wider hover-glow transition-default">
            <Upload size={14} />IMPORT JSON
          </button>
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-destructive">Are you sure?</span>
              <button onClick={() => { resetAllData(); setShowResetConfirm(false); }} className="px-3 py-2 rounded bg-destructive/10 text-destructive font-mono text-xs uppercase tracking-wider">
                YES, RESET
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="px-3 py-2 rounded bg-secondary text-muted-foreground font-mono text-xs uppercase tracking-wider">
                CANCEL
              </button>
            </div>
          ) : (
            <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 px-3 py-2 rounded bg-destructive/10 text-destructive font-mono text-xs uppercase tracking-wider transition-default">
              <Trash2 size={14} />RESET ALL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
