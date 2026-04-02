import { useStore, type ProjectStatus } from '@/stores/useStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Pause, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-info/20 text-info',
  DONE: 'bg-primary/20 text-primary',
  PAUSED: 'bg-warning/20 text-warning',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  NOT_STARTED: 'NOT STARTED',
  IN_PROGRESS: 'IN PROGRESS',
  DONE: 'DONE',
  PAUSED: 'PAUSED',
};

export function ProjectsTab() {
  const { projects, addProject, updateProject, deleteProject } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [techInput, setTechInput] = useState('');
  const [github, setGithub] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    addProject({
      name: name.trim(),
      description: desc,
      techStack: techInput.split(',').map(s => s.trim()).filter(Boolean),
      status: 'NOT_STARTED',
      githubUrl: github,
      deadline: deadline || undefined,
      progress: 0,
      notes: '',
      subtasks: [],
    });
    setName(''); setDesc(''); setTechInput(''); setGithub(''); setDeadline('');
    setShowForm(false);
  };

  const renderProjectCard = (project: typeof projects[0]) => {
    const overdue = project.deadline && isPast(parseISO(project.deadline)) && project.status !== 'DONE';
    const expanded = expandedId === project.id;

    return (
      <motion.div
        key={project.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-4 hover-glow"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-mono font-bold text-foreground">{project.name}</h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${STATUS_COLORS[project.status]}`}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        {project.description && <p className="text-sm text-muted-foreground mb-3">{project.description}</p>}

        {/* Tech tags */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.techStack.map(t => (
              <span key={t} className="px-2 py-0.5 bg-special/10 text-special rounded text-[10px] font-mono">{t}</span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="label-mono">PROGRESS</span>
            <span className="font-mono text-xs text-primary">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={project.progress}
            onChange={e => updateProject(project.id, { progress: Number(e.target.value) })}
            className="w-full mt-1 accent-primary h-1 cursor-pointer"
          />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          {project.deadline && (
            <span className={`font-mono text-xs ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              📅 {format(parseISO(project.deadline), 'MMM d, yyyy')}
            </span>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-info hover:text-info/80 transition-default">
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {project.status !== 'DONE' && (
            <button
              onClick={() => updateProject(project.id, { status: 'DONE', progress: 100 })}
              className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-wider hover-glow transition-default"
            >
              <CheckCircle2 size={12} />DONE
            </button>
          )}
          {project.status !== 'PAUSED' && project.status !== 'DONE' && (
            <button
              onClick={() => updateProject(project.id, { status: 'PAUSED' })}
              className="flex items-center gap-1 px-2 py-1 rounded bg-warning/10 text-warning font-mono text-[10px] uppercase tracking-wider transition-default"
            >
              <Pause size={12} />PAUSE
            </button>
          )}
          {(project.status === 'PAUSED' || project.status === 'NOT_STARTED') && (
            <button
              onClick={() => updateProject(project.id, { status: 'IN_PROGRESS' })}
              className="flex items-center gap-1 px-2 py-1 rounded bg-info/10 text-info font-mono text-[10px] uppercase tracking-wider transition-default"
            >
              START
            </button>
          )}
          <button
            onClick={() => setExpandedId(expanded ? null : project.id)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-secondary text-muted-foreground font-mono text-[10px] uppercase tracking-wider hover:text-foreground transition-default"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}NOTES
          </button>
          <button
            onClick={() => deleteProject(project.id)}
            className="flex items-center gap-1 px-2 py-1 rounded text-muted-foreground hover:text-destructive font-mono text-[10px] uppercase tracking-wider transition-default ml-auto"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Expanded notes */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <textarea
                value={project.notes}
                onChange={e => updateProject(project.id, { notes: e.target.value })}
                placeholder="Project notes..."
                className="w-full mt-3 h-24 bg-secondary rounded p-3 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary outline-none resize-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const kanbanColumns: ProjectStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'DONE'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-mono font-bold">PROJECTS</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'kanban' : 'grid')}
            className="px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider bg-secondary text-muted-foreground hover:text-foreground transition-default"
          >
            {viewMode === 'grid' ? 'KANBAN' : 'GRID'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider hover-glow transition-default"
          >
            <Plus size={14} />NEW
          </button>
        </div>
      </div>

      {/* New project form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="surface-card p-4 mb-4 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="label-mono">NEW PROJECT</span>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
              <input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="Tech stack (comma separated)" className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
              <input value={github} onChange={e => setGithub(e.target.value)} placeholder="GitHub URL" className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" />
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              <button onClick={handleCreate} className="bg-primary text-primary-foreground rounded px-4 py-2 font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-default">
                CREATE PROJECT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map(renderProjectCard)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {kanbanColumns.map(status => (
            <div key={status}>
              <div className="label-mono mb-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'NOT_STARTED' ? 'bg-muted-foreground' : status === 'IN_PROGRESS' ? 'bg-info' : 'bg-primary'}`} />
                {STATUS_LABELS[status]} ({projects.filter(p => p.status === status).length})
              </div>
              <div className="space-y-3">
                {projects.filter(p => p.status === status).map(renderProjectCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="font-mono text-muted-foreground text-sm">No projects yet. Time to build something epic 🚀</p>
        </div>
      )}
    </div>
  );
}
