import { useStore, type TaskCategory, type TaskPriority } from '@/stores/useStore';
import { useState, useMemo } from 'react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, GripVertical, Calendar } from 'lucide-react';

const CATEGORIES: TaskCategory[] = ['GYM', 'LEETCODE', 'PROJECT', 'STUDY', 'OTHER'];
const PRIORITIES: TaskPriority[] = ['HIGH', 'MED', 'LOW'];
const CATEGORY_COLORS: Record<TaskCategory, string> = {
  GYM: 'bg-primary/20 text-primary',
  LEETCODE: 'bg-special/20 text-special',
  PROJECT: 'bg-info/20 text-info',
  STUDY: 'bg-warning/20 text-warning',
  OTHER: 'bg-muted text-muted-foreground',
};
const PRIORITY_DOTS: Record<TaskPriority, string> = {
  HIGH: 'bg-destructive',
  MED: 'bg-warning',
  LOW: 'bg-primary',
};

export function TasksTab() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('OTHER');
  const [priority, setPriority] = useState<TaskPriority>('MED');
  const [dueDate, setDueDate] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [filterCat, setFilterCat] = useState<TaskCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'dateAdded'>('priority');
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), category, priority, dueDate: dueDate || undefined, timeEstimate: timeEstimate || undefined });
    setTitle(''); setDueDate(''); setTimeEstimate('');
  };

  const sortedTasks = useMemo(() => {
    let filtered = filterCat === 'ALL' ? [...tasks] : tasks.filter(t => t.category === filterCat);
    if (!showCompleted) filtered = filtered.filter(t => !t.done);

    const priorityOrder = { HIGH: 0, MED: 1, LOW: 2 };
    filtered.sort((a, b) => {
      // Done tasks to bottom
      if (a.done !== b.done) return a.done ? 1 : -1;
      // Overdue to top
      const aOverdue = a.dueDate && isPast(parseISO(a.dueDate)) && !isToday(parseISO(a.dueDate));
      const bOverdue = b.dueDate && isPast(parseISO(b.dueDate)) && !isToday(parseISO(b.dueDate));
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return filtered;
  }, [tasks, filterCat, showCompleted, sortBy]);

  const doneCount = tasks.filter(t => t.done).length;
  const overdueCount = tasks.filter(t => !t.done && t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))).length;

  return (
    <div>
      <h1 className="text-xl font-mono font-bold mb-4">TASKS</h1>

      {/* Quick add */}
      <div className="surface-card p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add a task... (press Enter)"
            className="flex-1 bg-secondary rounded px-3 py-2 text-sm border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground font-mono"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TaskCategory)}
              className="bg-secondary border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="bg-secondary border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground outline-none"
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p === 'HIGH' ? '🔴 HIGH' : p === 'MED' ? '🟡 MED' : '🟢 LOW'}</option>)}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="bg-secondary border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground outline-none"
            />
            <input
              value={timeEstimate}
              onChange={e => setTimeEstimate(e.target.value)}
              placeholder="Time est."
              className="w-20 bg-secondary border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['ALL', ...CATEGORIES] as const).map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded font-mono text-xs uppercase tracking-wider transition-default ${
              filterCat === c ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto flex gap-2 items-center">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-secondary border border-border rounded px-2 py-1 text-xs font-mono text-foreground outline-none"
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="dateAdded">Date Added</option>
          </select>
          <button
            onClick={() => setShowCompleted(v => !v)}
            className={`font-mono text-xs px-2 py-1 rounded transition-default ${showCompleted ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {showCompleted ? 'HIDE DONE' : 'SHOW DONE'}
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="font-mono text-xs text-muted-foreground mb-3">
        {tasks.length} tasks · {doneCount} done{overdueCount > 0 && ` · ${overdueCount} overdue`}
      </p>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence>
          {sortedTasks.map((task) => {
            const overdue = !task.done && task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
            const dueToday = !task.done && task.dueDate && isToday(parseISO(task.dueDate));

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`surface-card p-3 flex items-center gap-3 transition-default ${
                  overdue ? 'border-destructive/40 bg-destructive/5' : dueToday ? 'border-warning/40 bg-warning/5' : 'hover-glow'
                }`}
              >
                <GripVertical size={14} className="text-muted-foreground/40 cursor-grab hidden md:block" />

                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-default flex-shrink-0 ${
                    task.done ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary/50'
                  }`}
                >
                  {task.done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={12} className="text-primary-foreground" /></motion.div>}
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { updateTask(task.id, { title: editTitle }); setEditingId(null); }
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => { updateTask(task.id, { title: editTitle }); setEditingId(null); }}
                      className="bg-secondary border border-border rounded px-2 py-0.5 text-sm w-full outline-none text-foreground"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-sm cursor-pointer ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                      onClick={() => { setEditingId(task.id); setEditTitle(task.title); }}
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${CATEGORY_COLORS[task.category]}`}>
                  {task.category}
                </span>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOTS[task.priority]}`} />
                {task.dueDate && (
                  <span className={`font-mono text-[10px] flex items-center gap-1 ${overdue ? 'text-destructive' : dueToday ? 'text-warning' : 'text-muted-foreground'}`}>
                    <Calendar size={10} />{format(parseISO(task.dueDate), 'MMM d')}
                  </span>
                )}
                {task.timeEstimate && (
                  <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{task.timeEstimate}</span>
                )}
                <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-default flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="font-mono text-muted-foreground text-sm">No tasks. Go find some problems to solve 💀</p>
          </div>
        )}
      </div>
    </div>
  );
}
