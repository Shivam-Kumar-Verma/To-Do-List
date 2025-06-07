import React, { useState, useEffect } from 'react';

const FILTERS = ['All', 'Active', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

function App() {
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('task-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('task-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().split('T')[0];
      tasks.forEach(task => {
        if (task.deadline === now && !task.completed) {
          alert(`⏰ Reminder: Task "${task.text}" is due today!`);
        }
      });
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const updateHistory = (entry) => {
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem('task-history', JSON.stringify(updated));
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'All' ? true :
    filter === 'Active' ? !task.completed :
    task.completed
  );

  const addTask = () => {
    if (task.trim()) {
      setTasks([
        { id: Date.now(), text: task, completed: false, deadline, priority },
        ...tasks
      ]);
      setTask('');
      setDeadline('');
      setPriority('Medium');
    }
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const updatedTask = { ...t, completed: !t.completed };
        if (updatedTask.completed) {
          updateHistory({ ...updatedTask, completedAt: new Date().toISOString() });
        }
        return updatedTask;
      }
      return t;
    });
    setTasks(updated);
  };

  const deleteTask = (id) => {
    const toDelete = tasks.find(t => t.id === id);
    if (toDelete) updateHistory({ ...toDelete, deletedAt: new Date().toISOString() });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  const toggleDark = () => setDarkMode(!darkMode);

  const exportPDF = () => {
    const content = document.getElementById('todo-list');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Todo List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .task { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .completed { text-decoration: line-through; color: #888; }
          </style>
        </head>
        <body>
          <h1>📝 Todo List</h1>
          ${tasks.map(t => `
            <div class="task ${t.completed ? 'completed' : ''}">
              <strong>${t.text}</strong>
              ${t.deadline ? ` - Due: ${t.deadline}` : ''}
              <span style="background: ${t.priority === 'High' ? '#ef4444' : t.priority === 'Medium' ? '#eab308' : '#22c55e'}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px; margin-left: 10px;">${t.priority}</span>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white';
      case 'Medium': return darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-400 text-gray-900';
      case 'Low': return darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white';
      default: return darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-800';
    }
  };

  const isOverdue = (t) => t.deadline && !t.completed && new Date(t.deadline) < new Date();

  // Theme styles
  const themeStyles = {
    container: darkMode 
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 text-gray-900',
    card: darkMode 
      ? 'bg-gray-800/90 backdrop-blur-xl shadow-2xl border border-gray-700/50' 
      : 'bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20',
    input: darkMode 
      ? 'border-gray-600/50 bg-gray-700/80 text-gray-100 placeholder-gray-400 backdrop-blur-sm' 
      : 'border-gray-300/50 bg-white/70 text-gray-900 placeholder-gray-500 backdrop-blur-sm',
    taskItem: darkMode 
      ? 'bg-gray-700/60 hover:bg-gray-600/70 border-gray-600/30 backdrop-blur-sm' 
      : 'bg-white/60 hover:bg-white/80 border-gray-200/30 backdrop-blur-sm',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    mutedText: darkMode ? 'text-gray-400' : 'text-gray-600',
    historyBg: darkMode ? 'bg-gray-700/60 backdrop-blur-sm' : 'bg-gray-100/60 backdrop-blur-sm'
  };

  return (
    <div className={`min-h-screen flex justify-center items-center p-4 ${themeStyles.container} transition-all duration-500 relative overflow-hidden`}>
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: darkMode 
            ? `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
               radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
               linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)`
            : `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), 
               radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.4) 0%, transparent 50%),
               linear-gradient(45deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)`
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 98px,
            ${darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'} 100px
          )`
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className={`w-full max-w-2xl ${themeStyles.card} rounded-3xl p-8 transition-all duration-500 relative z-10`}>
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${themeStyles.text}`}>
                TaskMaster Pro
              </h1>
              <p className={`text-sm ${themeStyles.mutedText}`}>Professional Task Management</p>
            </div>
          </div>
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              darkMode 
                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                : 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
            <span className="font-medium">{darkMode ? "Light" : "Dark"}</span>
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-8">
          <input
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="What needs to be accomplished today?"
            className={`md:col-span-5 p-4 rounded-xl ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-base font-medium border-2`}
            aria-label="Task input"
            onKeyPress={e => e.key === 'Enter' && addTask()}
          />
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className={`md:col-span-3 p-4 rounded-xl ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-base border-2`}
            aria-label="Deadline"
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className={`md:col-span-2 p-4 rounded-xl ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-base border-2`}
            aria-label="Priority"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button
            onClick={addTask}
            className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base flex items-center justify-center gap-2"
            disabled={!task.trim()}
            aria-disabled={!task.trim()}
          >
            <span className="text-lg">➕</span>
            Add Task
          </button>
        </section>

        <div className={`flex justify-between items-center mb-4 p-4 rounded-xl ${themeStyles.historyBg} border`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-medium ${themeStyles.text}`}>
                Active: {tasks.filter(t => !t.completed).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className={`text-sm font-medium ${themeStyles.text}`}>
                Completed: {tasks.filter(t => t.completed).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-medium ${themeStyles.text}`}>
                Overdue: {tasks.filter(t => isOverdue(t)).length}
              </span>
            </div>
          </div>
          <button
            onClick={exportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 text-sm flex items-center gap-2"
          >
            <span>📄</span> Export PDF
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 border-2 ${
                filter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-transparent'
                  : darkMode 
                    ? 'text-indigo-400 hover:bg-indigo-800/30 border-indigo-400/50'
                    : 'text-indigo-600 hover:bg-indigo-100/50 border-indigo-200'
              }`}
            >
              {f} {f === 'Active' && tasks.filter(t => !t.completed).length > 0 && `(${tasks.filter(t => !t.completed).length})`}
              {f === 'Completed' && tasks.filter(t => t.completed).length > 0 && `(${tasks.filter(t => t.completed).length})`}
            </button>
          ))}
        </div>

        <div id="todo-list" className="max-h-96 overflow-y-auto space-y-3 pr-2 mb-6">
          {filteredTasks.map(t => (
            <div
              key={t.id}
              className={`group flex justify-between items-center ${themeStyles.taskItem} rounded-xl p-4 shadow-md transition-all duration-200 hover:shadow-lg border-l-4 ${
                isOverdue(t) ? 'border-red-500 animate-pulse' : t.completed ? 'border-green-400' : 'border-indigo-400'
              } hover:scale-[1.02]`}
            >
              <div
                onClick={() => toggleTask(t.id)}
                className={`flex-1 flex items-center gap-4 cursor-pointer ${
                  t.completed ? `line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}` : themeStyles.text
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') toggleTask(t.id); }}
              >
                <div className={`w-6 h-6 flex justify-center items-center rounded-full border-2 transition-all duration-200 ${
                  t.completed 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent text-white shadow-md' 
                    : darkMode 
                      ? 'border-gray-500 hover:border-indigo-400 group-hover:bg-indigo-400/10' 
                      : 'border-gray-400 hover:border-indigo-600 group-hover:bg-indigo-50'
                }`}>
                  {t.completed && '✓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg truncate">{t.text}</div>
                  {t.deadline && (
                    <div className={`text-sm mt-1 flex items-center gap-1 ${
                      isOverdue(t) ? 'text-red-500 font-bold' : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>📅</span>
                      Due: {new Date(t.deadline).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {isOverdue(t) && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">OVERDUE</span>}
                    </div>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(t.priority)} shadow-sm`}>
                  {t.priority}
                </div>
              </div>
              <button
                onClick={() => deleteTask(t.id)}
                aria-label={`Delete task ${t.text}`}
                className="ml-4 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-lg p-2 transition-all duration-200 transform hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <span className="text-lg">🗑️</span>
              </button>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className={`text-center ${themeStyles.mutedText} py-12`}>
              <div className="text-6xl mb-4 opacity-50">📋</div>
              <div className="text-xl font-medium mb-2">No tasks found</div>
              <div className="text-sm">
                {filter === 'All' ? 'Start by adding your first task above!' : 
                 filter === 'Active' ? 'All tasks are completed! Great job!' : 
                 'No completed tasks yet.'}
              </div>
            </div>
          )}
        </div>

        <footer className="flex justify-between items-center border-t pt-6" style={{ borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)' }}>
          <button
            onClick={clearCompleted}
            disabled={tasks.every(t => !t.completed)}
            className={`flex items-center gap-2 text-red-500 font-semibold rounded-xl px-4 py-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 border-2 border-red-200 ${
              tasks.some(t => t.completed) 
                ? darkMode ? 'hover:bg-red-900/20 hover:border-red-400' : 'hover:bg-red-50 hover:border-red-300' 
                : 'opacity-50 cursor-not-allowed border-gray-300'
            }`}
          >
            <span>🧹</span>
            Clear Completed ({tasks.filter(t => t.completed).length})
          </button>
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 font-semibold rounded-xl px-4 py-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 border-2 ${
              darkMode 
                ? 'text-indigo-400 hover:bg-indigo-900/20 border-indigo-400/50 hover:border-indigo-400' 
                : 'text-indigo-600 hover:bg-indigo-50 border-indigo-200 hover:border-indigo-300'
            }`}
          >
            <span>{showHistory ? '👁️' : '📚'}</span>
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </footer>

        {showHistory && (
          <section className={`mt-4 max-h-32 sm:max-h-48 overflow-y-auto text-xs sm:text-sm ${themeStyles.historyBg} rounded-lg p-3 shadow-inner transition-all duration-300`}>
            <h2 className={`font-semibold mb-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'} pb-1 select-none ${themeStyles.text} flex items-center gap-2`}>
              📜 Task History
            </h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className={`break-words p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'} border-l-2 ${h.completedAt ? 'border-green-400' : 'border-red-400'}`}>
                  <div className="font-medium">{h.text}</div>
                  <div className={`text-xs ${themeStyles.mutedText} mt-1`}>
                    {h.completedAt && `✅ Completed: ${new Date(h.completedAt).toLocaleString()}`}
                    {h.deletedAt && `🗑️ Deleted: ${new Date(h.deletedAt).toLocaleString()}`}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className={`italic ${themeStyles.mutedText} select-none text-center py-4`}>
                  📭 No history yet.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;