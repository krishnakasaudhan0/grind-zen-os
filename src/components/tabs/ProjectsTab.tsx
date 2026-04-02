import { useStore, type ProjectStatus } from '@/stores/useStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Pause, CheckCircle2, ChevronDown, ChevronUp, X, Circle, Check } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  NOT_STARTED: 'text-muted-foreground',
  IN_PROGRESS: 'text-info',
  DONE: 'text-primary',
  PAUSED: 'text-warning',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  PAUSED: 'Paused',
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

  // Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('');

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

  const handleAddSubtask = (projectId: string, currentSubtasks: {id: string, title: string, done: boolean}[]) => {
    if (!newTaskTitle.trim()) return;
    const newTasks = [...currentSubtasks, { id: Date.now().toString(), title: newTaskTitle.trim(), done: false }];
    
    // Auto-update progress based on tasks
    const progress = Math.round((newTasks.filter(t => t.done).length / newTasks.length) * 100);
    updateProject(projectId, { subtasks: newTasks, progress });
    setNewTaskTitle('');
  };

  const handleToggleSubtask = (projectId: string, currentSubtasks: {id: string, title: string, done: boolean}[], taskId: string) => {
    const newTasks = currentSubtasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    const progress = Math.round((newTasks.filter(t => t.done).length / newTasks.length) * 100);
    updateProject(projectId, { subtasks: newTasks, progress });
  };

  const handleDeleteSubtask = (projectId: string, currentSubtasks: {id: string, title: string, done: boolean}[], taskId: string) => {
    const newTasks = currentSubtasks.filter(t => t.id !== taskId);
    const progress = newTasks.length > 0 ? Math.round((newTasks.filter(t => t.done).length / newTasks.length) * 100) : 0;
    updateProject(projectId, { subtasks: newTasks, progress });
  };

  const renderProjectCard = (project: typeof projects[0]) => {
    const overdue = project.deadline && isPast(parseISO(project.deadline)) && project.status !== 'DONE';
    const expanded = expandedId === project.id;
    const subtasks = project.subtasks || [];

    return (
      <motion.div
        key={project.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-default"
      >
        <div className="flex items-start justify-between mb-2 gap-4">
          <h3 className="font-sans font-semibold text-lg text-foreground truncate">{project.name}</h3>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-medium uppercase tracking-wider bg-white/[0.02] border border-border/30 ${STATUS_COLORS[project.status]} flex-shrink-0`}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        {project.description && <p className="text-sm text-muted-foreground mb-4 font-sans line-clamp-2">{project.description}</p>}

        {/* Tech tags */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.techStack.map(t => (
              <span key={t} className="px-2 py-0.5 bg-secondary text-foreground rounded text-[10px] font-sans font-medium">{t}</span>
            ))}
          </div>
        )}

        {/* Progress block */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Progress</span>
            <span className="font-sans text-xs font-semibold text-foreground">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${project.status === 'DONE' ? 'bg-primary' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 flex-wrap mb-4 border-b border-border/30 pb-4">
          {project.deadline && (
            <span className={`font-sans text-xs flex items-center gap-1.5 font-medium ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              📅 {format(parseISO(project.deadline), 'MMM d, yyyy')}
            </span>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-default flex items-center gap-1 text-xs">
              <ExternalLink size={14} /> Repository
            </a>
          )}
        </div>

        {/* Actions base */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between mb-2">
          <div className="flex gap-2 flex-wrap">
            {project.status !== 'DONE' && (
              <button
                onClick={() => updateProject(project.id, { status: 'DONE', progress: 100 })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-sans font-medium text-[11px] transition-default hover:opacity-90"
              >
                <CheckCircle2 size={14} /> Mark Done
              </button>
            )}
            {project.status !== 'PAUSED' && project.status !== 'DONE' && (
              <button
                onClick={() => updateProject(project.id, { status: 'PAUSED' })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-foreground font-sans font-medium text-[11px] transition-default hover:bg-secondary/80"
              >
                <Pause size={14} /> Pause
              </button>
            )}
            {(project.status === 'PAUSED' || project.status === 'NOT_STARTED') && (
              <button
                onClick={() => updateProject(project.id, { status: 'IN_PROGRESS' })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-foreground font-sans font-medium text-[11px] transition-default hover:bg-secondary/80"
              >
                Start Project
              </button>
            )}
            <button
              onClick={() => setExpandedId(expanded ? null : project.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-sans font-medium text-[11px] transition-default ${expanded ? 'bg-secondary text-foreground' : 'bg-transparent text-muted-foreground border border-border/50 hover:text-foreground'}`}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Tasks & Notes
            </button>
          </div>
          
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
                deleteProject(project.id);
              }
            }}
            className="flex items-center justify-center p-1.5 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-default self-end sm:self-auto"
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Expanded Tasks & Notes */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border/30">
                {/* Tasks List */}
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Project Tasks</h4>
                <div className="space-y-2 mb-4">
                  {subtasks.map(task => (
                    <div key={task.id} className="group flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSubtask(project.id, subtasks, task.id)}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-default ${task.done ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40 hover:border-primary/60'}`}
                      >
                        {task.done && <Check size={10} />}
                      </button>
                      <span className={`text-sm font-sans flex-1 truncate ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.title}
                      </span>
                      <button 
                        onClick={() => handleDeleteSubtask(project.id, subtasks, task.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-default"
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Task Input */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSubtask(project.id, subtasks)}
                      placeholder="Add a new task..."
                      className="flex-1 bg-transparent border-b border-border/50 focus:border-primary px-1 py-1.5 text-sm outline-none text-foreground placeholder:text-muted-foreground/50 transition-default font-sans"
                    />
                    <button onClick={() => handleAddSubtask(project.id, subtasks)} className="text-muted-foreground hover:text-primary">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h4>
                <textarea
                  value={project.notes}
                  onChange={e => updateProject(project.id, { notes: e.target.value })}
                  placeholder="Draft project details, ideas, etc..."
                  className="w-full h-24 bg-transparent rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary outline-none resize-none font-sans"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const kanbanColumns: ProjectStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'DONE'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-sans tracking-tight">Projects</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'kanban' : 'grid')}
            className="px-4 py-2 rounded-full font-sans font-medium text-xs bg-secondary text-foreground hover:bg-secondary/80 transition-default"
          >
            {viewMode === 'grid' ? 'Board View' : 'Grid View'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-sans font-medium text-xs hover:opacity-90 transition-default"
          >
            <Plus size={14} /> New Project
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
            className="bg-card border border-border/50 rounded-xl p-6 mb-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 border-b border-border/30 pb-4">
              <span className="font-sans font-semibold text-lg">Create New Project</span>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="bg-transparent border-b border-border/50 px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans" autoFocus />
              <input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="Tech stack (comma separated)" className="bg-transparent border-b border-border/50 px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans" />
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" className="bg-transparent border-b border-border/50 px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans" />
              <input value={github} onChange={e => setGithub(e.target.value)} placeholder="GitHub URL" className="bg-transparent border-b border-border/50 px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary font-sans" />
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-transparent border-b border-border/50 px-2 py-2 text-sm text-muted-foreground outline-none focus:border-primary font-sans" />
              <div className="flex items-end justify-end">
                <button onClick={handleCreate} className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 font-sans font-medium text-sm hover:opacity-90 transition-default w-full sm:w-auto">
                  Create Project
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Views */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(renderProjectCard)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {kanbanColumns.map(status => (
            <div key={status} className="bg-white/[0.02] rounded-xl p-4 border border-border/30">
              <div className="font-sans font-semibold text-xs tracking-wider uppercase mb-4 flex items-center gap-2 text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${status === 'NOT_STARTED' ? 'bg-muted-foreground/50' : status === 'IN_PROGRESS' ? 'bg-info' : 'bg-primary'}`} />
                {STATUS_LABELS[status]}
                <span className="bg-secondary px-2 rounded-full">{projects.filter(p => p.status === status).length}</span>
              </div>
              <div className="space-y-4">
                {projects.filter(p => p.status === status).map(renderProjectCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 && (
        <div className="text-center py-24 bg-card rounded-2xl border border-border/30">
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground font-sans mb-6">Create your first project to start tracking tasks and progress.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-sans font-medium hover:opacity-90 transition-default"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      )}
    </div>
  );
}
