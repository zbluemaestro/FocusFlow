import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckSquare, Square, Check, AlertCircle, Calendar, ChevronDown, ListTodo, X } from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'completed'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onClearCompletedTasks: () => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  themePrimaryClass: string;
  themeAccentClass: string;
  themeCardClass: string;
}

export default function TaskManager({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onClearCompletedTasks,
  selectedTaskId,
  setSelectedTaskId,
  themePrimaryClass,
  themeAccentClass,
  themeCardClass
}: TaskManagerProps) {
  // Add task Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Task['category']>('Coding');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingCategory, setEditingCategory] = useState<Task['category']>('Coding');
  const [editingPriority, setEditingPriority] = useState<Task['priority']>('Medium');
  const [editingEstPomodoros, setEditingEstPomodoros] = useState(2);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | Task['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Submit new task
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      category,
      priority,
      estimatedPomodoros
    });

    setTitle('');
    setEstimatedPomodoros(2);
    setPriority('Medium');
    setCategory('Coding');
    setShowAddForm(false);
  };

  // Launch edit mode
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingCategory(task.category);
    setEditingPriority(task.priority);
    setEditingEstPomodoros(task.estimatedPomodoros);
  };

  // Save edited task
  const saveEdit = (task: Task) => {
    if (!editingTitle.trim()) return;
    onUpdateTask({
      ...task,
      title: editingTitle.trim(),
      category: editingCategory,
      priority: editingPriority,
      estimatedPomodoros: editingEstPomodoros
    });
    setEditingTaskId(null);
  };

  // Toggle task completed
  const handleToggleComplete = (task: Task) => {
    onUpdateTask({
      ...task,
      completed: !task.completed
    });
  };

  // Category styling lookup
  const getCategoryColor = (cat: Task['category']) => {
    switch (cat) {
      case 'Math': return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
      case 'Science': return 'bg-teal-500/15 text-teal-400 border-teal-500/20';
      case 'Coding': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20';
      case 'Writing': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      case 'Exam Prep': return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Priority color lookup
  const getPriorityColor = (pri: Task['priority']) => {
    switch (pri) {
      case 'High': return 'text-red-400 bg-red-500/15 border-red-500/20 font-black';
      case 'Medium': return 'text-amber-400 bg-amber-500/15 border border-amber-500/20 font-bold';
      case 'Low': return 'text-slate-400 bg-slate-800 border border-slate-700';
    }
  };

  // Filter tasks based on search & category pill
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = activeFilter === 'all' || task.category === activeFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-sans font-black text-slate-100 uppercase tracking-widest text-lg md:text-xl leading-none">
            Study Planner & Tasks
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Organize study objectives, set Pomodoro targets, and track completions.
          </p>
        </div>

        <button
          id="btn-add-task-toggle"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
            showAddForm
              ? 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700'
              : `${themePrimaryClass}`
          }`}
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add New Task</span>
            </>
          )}
        </button>
      </div>

      {/* Add Task collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className={`p-6 rounded-3xl ${themeCardClass} border border-slate-800 shadow-xl mb-8 animate-in fade-in slide-in-from-top-4 duration-200`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Task Title / Topic
              </label>
              <input
                id="input-task-title"
                type="text"
                required
                placeholder="e.g. Read Physics Chapter 3 & complete questions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Study Category
              </label>
              <select
                id="input-task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Task['category'])}
                className="w-full p-3 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100 font-bold"
              >
                {['Math', 'Science', 'Coding', 'Writing', 'Exam Prep', 'Other'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Priority Urgency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['High', 'Medium', 'Low'] as Task['priority'][]).map((pri) => (
                  <button
                    type="button"
                    key={pri}
                    onClick={() => setPriority(pri)}
                    className={`py-2 px-1 rounded-xl text-xs font-black uppercase tracking-wider text-center border transition-all ${
                      priority === pri
                        ? pri === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/30 font-black' :
                          pri === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-black' :
                          'bg-slate-800 text-slate-100 border-slate-700 font-black'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {pri}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Tomatoes */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Estimated Pomodoros (25 mins focus blocks)
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 w-fit">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setEstimatedPomodoros(num)}
                      title={`${num} Pomodoros (${num * 25} Focus minutes)`}
                      className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all ${
                        estimatedPomodoros >= num
                          ? 'bg-indigo-600 text-white scale-105 shadow-md shadow-indigo-600/20'
                          : 'hover:bg-slate-800 text-slate-500'
                      }`}
                    >
                      🍅
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {estimatedPomodoros} session{estimatedPomodoros > 1 ? 's' : ''} ({estimatedPomodoros * 25}m total)
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-sans font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md ${themePrimaryClass}`}
            >
              Add Task to Board
            </button>
          </div>
        </form>
      )}

      {/* Task Filters and Search Box Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800/80">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'Math', 'Science', 'Coding', 'Writing', 'Exam Prep', 'Other'].map((f) => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 bg-slate-950 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {f === 'all' ? 'All Subjects' : f}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-56 p-2 px-3.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950 text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Main Task List Board */}
      <div className="space-y-6 select-none">
        {/* Active Tasks Group */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3.5 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-indigo-400" />
            <span>Active Objectives ({activeTasks.length})</span>
          </h3>

          {activeTasks.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 text-xs uppercase font-black tracking-widest bg-slate-950/20">
              No active tasks found matching filters. Time to plan some study goals!
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                const isTimerLinked = selectedTaskId === task.id;

                if (isEditing) {
                  return (
                    <div
                      key={task.id}
                      className={`p-5 rounded-2xl ${themeCardClass} border border-indigo-500/40 shadow-xl flex flex-col gap-4`}
                    >
                      {/* Edit Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="md:col-span-2 p-2.5 border border-slate-800 rounded-xl text-xs text-slate-100 bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                        />
                        <select
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value as Task['category'])}
                          className="p-2.5 border border-slate-800 rounded-xl text-xs text-slate-100 bg-slate-900 font-bold"
                        >
                          {['Math', 'Science', 'Coding', 'Writing', 'Exam Prep', 'Other'].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <select
                          value={editingPriority}
                          onChange={(e) => setEditingPriority(e.target.value as Task['priority'])}
                          className="p-2.5 border border-slate-800 rounded-xl text-xs text-slate-100 bg-slate-900 font-bold"
                        >
                          {['High', 'Medium', 'Low'].map((pri) => (
                            <option key={pri} value={pri}>{pri} Priority</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Est. Pomodoros</span>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={editingEstPomodoros}
                            onChange={(e) => setEditingEstPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 p-1.5 border border-slate-800 rounded-lg text-center text-xs font-mono bg-slate-900 text-slate-100"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(task)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white ${themePrimaryClass.split(' ')[0]}`}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    className={`p-4.5 rounded-2xl ${themeCardClass} border border-slate-800 shadow-sm flex items-center justify-between gap-3 group transition-all duration-200 hover:border-slate-700 ${
                      isTimerLinked ? 'ring-1 ring-indigo-500/60 bg-indigo-500/5' : ''
                    }`}
                  >
                    {/* Left Column: Complete Check and Title */}
                    <div className="flex items-start gap-3.5 overflow-hidden flex-1">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className="text-slate-500 hover:text-slate-300 mt-0.5"
                      >
                        <Square className="w-5 h-5 rounded hover:bg-slate-800" />
                      </button>

                      <div className="overflow-hidden flex-1">
                        <div className="text-sm font-black text-slate-100 truncate" title={task.title}>
                          {task.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            • Target Focus: {Array.from({ length: task.estimatedPomodoros }).map((_, idx) => (
                              <span key={idx} className={idx < task.completedPomodoros ? 'text-indigo-400' : 'text-slate-800'}>🍅</span>
                            ))}
                            <span className="font-mono text-[9px] text-slate-500 ml-1">
                              ({task.completedPomodoros}/{task.estimatedPomodoros})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Timer link and edit/trash controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTaskId(isTimerLinked ? null : task.id)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition-all font-sans ${
                          isTimerLinked
                            ? 'bg-indigo-600 text-white shadow shadow-indigo-600/25'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isTimerLinked ? 'Active' : 'Focus'}
                      </button>

                      <button
                        onClick={() => startEditing(task)}
                        title="Edit task parameters"
                        className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete task"
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Tasks Group */}
        {completedTasks.length > 0 && (
          <div className="pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Finished Objectives ({completedTasks.length})</span>
              </h3>
              
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear completed tasks? Completed Pomodoro stats will stay recorded in your Analytics.')) {
                    onClearCompletedTasks();
                  }
                }}
                className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-red-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Completed</span>
              </button>
            </div>

            <div className="space-y-2 opacity-75">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl ${themeCardClass} border border-slate-900 bg-slate-950/40 flex items-center justify-between gap-3 text-slate-400`}
                >
                  <div className="flex items-start gap-3 overflow-hidden flex-1">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="text-emerald-400 hover:text-slate-500 mt-0.5"
                    >
                      <CheckSquare className="w-5 h-5" />
                    </button>

                    <div className="overflow-hidden flex-1">
                      <div className="text-sm font-black text-slate-400 line-through truncate">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-800 bg-slate-950 px-1.5 py-0.5 rounded">
                          {task.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          • Completed with {task.completedPomodoros} Pomodoro{task.completedPomodoros !== 1 ? 's' : ''} 🍅
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/15 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
