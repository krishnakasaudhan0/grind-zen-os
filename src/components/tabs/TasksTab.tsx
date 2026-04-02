import { useStore, type TaskCategory, type TaskPriority } from '@/stores/useStore';
import { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, isPast, parseISO, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Edit2, Circle, CheckCircle2, CheckSquare, Clock, X, GripVertical, ChevronRight, ChevronLeft } from 'lucide-react';
import { PomodoroTimer } from '@/components/daily/PomodoroTimer';

const CATEGORIES: TaskCategory[] = ['GYM', 'LEETCODE', 'PROJECT', 'STUDY', 'OTHER'];
const PRIORITIES: TaskPriority[] = ['HIGH', 'MED', 'LOW'];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  HIGH: 'text-destructive',
  MED: 'text-warning',
  LOW: 'text-muted-foreground',
};

// 6 AM to 11 PM
const WORKING_HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

export function TasksTab() {
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('OTHER');
  const [priority, setPriority] = useState<TaskPriority>('MED');
  const [filterCat, setFilterCat] = useState<TaskCategory | 'ALL'>('ALL');
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedDay, setSelectedDay] = useState<'TODAY' | 'TOMORROW'>('TODAY');
  
  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!title.trim()) return;
    const targetDate = selectedDay === 'TOMORROW' ? format(addDays(new Date(), 1), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    addTask({ title: title.trim(), category, priority, dueDate: targetDate });
    setTitle('');
  };

  const sortedTasks = useMemo(() => {
    let filtered = filterCat === 'ALL' ? [...tasks] : tasks.filter(t => t.category === filterCat);
    if (!showCompleted) filtered = filtered.filter(t => !t.done);

    // Hide tasks from "Up Next" if they are scheduled for today and not done,
    // but keep them visible if showCompleted is toggled or they are overdue
    filtered = filtered.filter(t => {
      // First, filter by selected day
      const isForDay = selectedDay === 'TODAY' 
          ? (!t.dueDate || isToday(parseISO(t.dueDate)) || (isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)))) 
          : (t.dueDate && isTomorrow(parseISO(t.dueDate)));

      if (!isForDay) return false;

      // Hide if already scheduled on the timeline
      if (t.startTime !== undefined && !t.done) {
         return false; 
      }
      return true;
    });

    const priorityOrder = { HIGH: 0, MED: 1, LOW: 2 };
    filtered.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const aOverdue = a.dueDate && isPast(parseISO(a.dueDate)) && !isToday(parseISO(a.dueDate));
      const bOverdue = b.dueDate && isPast(parseISO(b.dueDate)) && !isToday(parseISO(b.dueDate));
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return filtered;
  }, [tasks, filterCat, showCompleted]);

  // Determine "Today's Focus"
  const focusTask = useMemo(() => {
    const dayTasks = tasks.filter(t => {
      if (selectedDay === 'TODAY') return (!t.dueDate || isToday(parseISO(t.dueDate)) || isPast(parseISO(t.dueDate)));
      return (t.dueDate && isTomorrow(parseISO(t.dueDate)));
    });
    
    const pending = dayTasks.filter(t => !t.done);
    const highPriority = pending.filter(t => t.priority === 'HIGH');
    if (highPriority.length > 0) return highPriority[0];
    return pending.length > 0 ? pending[0] : null;
  }, [tasks, selectedDay]);

  const handleDropOnTimeline = (hour: number) => {
    if (draggedTaskId) {
      updateTask(draggedTaskId, { startTime: hour });
      setDraggedTaskId(null);
    }
  };

  const handleDropOnList = () => {
    if (draggedTaskId) {
      updateTask(draggedTaskId, { startTime: undefined });
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Header Controls: Day Toggle */}
      <div className="flex justify-center border-b border-border/30 pb-6 mb-8 pt-2">
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-border/50">
          <button
            onClick={() => setSelectedDay('TODAY')}
            className={`px-6 py-1.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-default ${selectedDay === 'TODAY' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDay('TOMORROW')}
            className={`px-6 py-1.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-default ${selectedDay === 'TOMORROW' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* Top Section: Focus Block */}
      <section>
        <h2 className="text-sm font-sans font-medium text-muted-foreground mb-4 uppercase tracking-wider">{selectedDay === 'TODAY' ? "Today's Focus" : "Tomorrow's Focus"}</h2>
        {focusTask ? (
          <div className="bg-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-border/50">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-2 h-2 rounded-full ${focusTask.priority === 'HIGH' ? 'bg-destructive' : focusTask.priority === 'MED' ? 'bg-warning' : 'bg-primary'}`} />
                <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">{focusTask.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-foreground leading-snug">{focusTask.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleTask(focusTask.id)}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium transition-default hover:opacity-90"
              >
                <Check size={18} />
                <span>Mark Done</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card p-8 rounded-2xl border border-border/50 text-center">
            <h1 className="text-xl font-medium text-foreground mb-2">You're all caught up!</h1>
            <p className="text-muted-foreground text-sm">Take a break or add something new to focus on.</p>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left Column: Task List */}
        <div 
          className="space-y-8"
          onDragOver={e => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleDropOnList(); }}
        >
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider">Up Next</h2>
              
              <div className="flex gap-2">
                <select
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value as any)}
                  className="bg-transparent text-sm text-foreground font-medium outline-none cursor-pointer hover:text-primary transition-default"
                >
                  <option value="ALL">All Tasks</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="text-border">|</span>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-default"
                >
                  {showCompleted ? 'Hide Done' : 'Show Done'}
                </button>
              </div>
            </div>

            {/* Quick Add */}
            <div className="mb-6 relative group">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="What needs to be done? (Press Enter)"
                className="w-full bg-transparent border-b border-border/50 focus:border-primary px-2 py-3 text-base outline-none text-foreground placeholder:text-muted-foreground/50 transition-default font-sans"
              />
            </div>

            {/* Tasks rows */}
            <div className="flex flex-col">
              <AnimatePresence>
                {sortedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    className="group flex items-center gap-4 py-3 border-b border-border/30 hover:bg-white/[0.02] -mx-4 px-4 transition-default rounded-md cursor-grab active:cursor-grabbing"
                  >
                    <div className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 cursor-grab">
                      <GripVertical size={14} />
                    </div>

                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-primary transition-default"
                    >
                      {task.done ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} />}
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
                          className="bg-secondary/50 rounded px-2 py-1 text-base w-full outline-none text-foreground font-sans"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`text-base font-sans block truncate ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                          onDoubleClick={() => { setEditingId(task.id); setEditTitle(task.title); }}
                        >
                          {task.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(task.id); setEditTitle(task.title); }} className="text-muted-foreground hover:text-foreground">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Priority / Meta (always visible) */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <span className={`text-[10px] font-semibold tracking-wider uppercase ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority !== 'LOW' && task.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sortedTasks.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                    <CheckSquare size={24} className="text-muted-foreground/50" />
                  </div>
                  <h3 className="text-foreground font-medium mb-1">No tasks unscheduled</h3>
                  <p className="text-muted-foreground text-sm">Add tasks or drag them to the timeline.</p>
                </motion.div>
              )}
            </div>
          </section>

          {/* Subtle Pomodoro Section */}
          <section className="pt-8 border-t border-border/30">
            <h2 className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider mb-4">Focus Timer</h2>
            <div className="w-full max-w-sm">
              <PomodoroTimer />
            </div>
          </section>
        </div>

        {/* Right Column: Timeline */}
        <div className="sticky top-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider">Time Blocking</h2>
              <Clock size={16} className="text-muted-foreground" />
            </div>

            <div className="flex flex-col relative max-h-[65vh] overflow-y-auto pr-2 no-scrollbar">
              {WORKING_HOURS.map(hour => {
                const tasksInHour = tasks.filter(t => {
                   const isForDay = selectedDay === 'TODAY' 
                      ? (!t.dueDate || isToday(parseISO(t.dueDate)) || isPast(parseISO(t.dueDate)))
                      : (t.dueDate && isTomorrow(parseISO(t.dueDate)));
                   return isForDay && t.startTime === hour;
                });
                const isCurrentHour = selectedDay === 'TODAY' && new Date().getHours() === hour;

                return (
                  <div 
                    key={hour} 
                    className={`flex min-h-[64px] group border-l-2 relative transition-default ${isCurrentHour ? 'border-primary' : 'border-border/30 hover:border-border'}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnTimeline(hour);
                    }}
                  >
                    {/* Time Label */}
                    <div className={`w-14 flex-shrink-0 text-right pr-4 py-1.5 font-sans text-xs -translate-y-2.5 transition-opacity ${isCurrentHour ? 'text-primary font-semibold opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    
                    {/* Drop Zone & Tasks */}
                    <div className="flex-1 border-t border-border/20 py-2 pr-2 relative flex flex-col gap-2">
                       {tasksInHour.map(task => (
                          <motion.div
                            key={task.id}
                            draggable
                            onDragStart={() => setDraggedTaskId(task.id)}
                            onDragEnd={() => setDraggedTaskId(null)}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`group/task cursor-grab active:cursor-grabbing font-sans text-xs p-2.5 rounded-lg border bg-secondary/30 shadow-sm transition-default hover:bg-secondary/60 flex items-start justify-between gap-2 overflow-hidden ${task.done ? 'opacity-50 line-through' : ''}`}
                          >
                             <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate text-foreground">{task.title}</span>
                                <span className={`text-[9px] uppercase tracking-wider font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.category}</span>
                             </div>
                             
                             <div className="flex items-center gap-1.5 opacity-0 group-hover/task:opacity-100 transition-opacity">
                                <button
                                  onClick={() => toggleTask(task.id)}
                                  className="text-muted-foreground hover:text-primary transition-default p-1"
                                >
                                   <CheckCircle2 size={14} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateTask(task.id, { startTime: undefined }); }} 
                                  className="text-muted-foreground hover:text-destructive transition-default p-1"
                                >
                                  <X size={14}/>
                                </button>
                             </div>
                          </motion.div>
                       ))}

                       {/* Drag Hint (only visible when dragging and hovering over this specific hour) */}
                       {tasksInHour.length === 0 && (
                          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center pl-2 text-xs text-muted-foreground/40 font-sans italic">
                             Drop task here
                          </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-[10px] text-muted-foreground/60 mt-4 uppercase tracking-widest font-sans">
               Drag tasks to schedule
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
