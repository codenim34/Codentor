"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiPlus, FiList, FiCalendar, FiGrid, FiFilter } from "react-icons/fi";
import TaskForm from "../components/tasks/TaskForm";
import TaskList from "../components/tasks/TaskList";
import CalendarView from "../components/tasks/CalendarView";
import KanbanBoardWrapper from "../components/tasks/KanbanBoardWrapper";
import GoogleCalendarSync from "../components/tasks/GoogleCalendarSync";
import NotificationSettings from "../components/tasks/NotificationSettings";

export default function TasksPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'calendar', 'kanban'
  const [currentFilter, setCurrentFilter] = useState('all'); // 'all', 'today', 'remaining', 'completed'
  const [showSettings, setShowSettings] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?filter=${currentFilter}`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, currentFilter]);

  // Check for connection success/error in URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('connected') === 'true') {
        toast.success('Google Calendar connected successfully!');
        // Clean up URL
        window.history.replaceState({}, '', '/tasks');
      } else if (params.get('error')) {
        const error = params.get('error');
        if (error === 'access_denied') {
          toast.error('Google Calendar access was denied');
        } else {
          toast.error('Failed to connect Google Calendar');
        }
        window.history.replaceState({}, '', '/tasks');
      }
    }
  }, []);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Task Management</h1>
              <p className="text-gray-300">Organize your tasks and boost productivity</p>
            </div>
            <button
              onClick={handleCreateTask}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 justify-center shadow-lg shadow-emerald-500/20"
            >
              <FiPlus size={20} />
              New Task
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 border border-emerald-800/30 rounded-xl p-4 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-gray-900/50 border border-yellow-800/30 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-400">To Do</div>
            </div>
            <div className="bg-gray-900/50 border border-blue-800/30 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
            <div className="bg-gray-900/50 border border-emerald-800/30 rounded-xl p-4 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
              <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>

          {/* View Switcher and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* View Switcher */}
            <div className="flex gap-2 bg-black/40 border border-emerald-800/30 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('list')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  currentView === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiList size={18} />
                List
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  currentView === 'calendar'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiCalendar size={18} />
                Calendar
              </button>
              <button
                onClick={() => setCurrentView('kanban')}
                className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                  currentView === 'kanban'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiGrid size={18} />
                Kanban
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCurrentFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentFilter === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-black/40 text-gray-400 hover:text-emerald-400 border border-emerald-800/30 hover:border-emerald-500/50'
                }`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setCurrentFilter('today')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentFilter === 'today'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-black/40 text-gray-400 hover:text-emerald-400 border border-emerald-800/30 hover:border-emerald-500/50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setCurrentFilter('remaining')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentFilter === 'remaining'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-black/40 text-gray-400 hover:text-emerald-400 border border-emerald-800/30 hover:border-emerald-500/50'
                }`}
              >
                Remaining
              </button>
              <button
                onClick={() => setCurrentFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentFilter === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-black/40 text-gray-400 hover:text-emerald-400 border border-emerald-800/30 hover:border-emerald-500/50'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Google Calendar Sync */}
        <GoogleCalendarSync onSyncComplete={handleTaskUpdated} />

        {/* Notification Settings */}
        {showSettings && (
          <NotificationSettings />
        )}

        {/* Settings Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-black/40 hover:bg-emerald-950/50 text-gray-300 hover:text-emerald-400 rounded-lg font-medium transition-all border border-emerald-800/30 hover:border-emerald-500/50"
          >
            {showSettings ? 'Hide' : 'Show'} Notification Settings
          </button>
        </div>

        {/* Task View */}
        {loading ? (
          <div className="bg-gray-900/50 border border-emerald-800/30 rounded-xl p-6">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'list' && (
              <div className="bg-gray-900/50 border border-emerald-800/30 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
                <TaskList
                  tasks={tasks}
                  onTaskUpdated={handleTaskUpdated}
                  onEditTask={handleEditTask}
                />
              </div>
            )}

            {currentView === 'calendar' && (
              <CalendarView
                tasks={tasks}
                onTaskUpdated={handleTaskUpdated}
                onEditTask={handleEditTask}
              />
            )}

            {currentView === 'kanban' && (
              <KanbanBoardWrapper
                tasks={tasks}
                onTaskUpdated={handleTaskUpdated}
                onEditTask={handleEditTask}
              />
            )}
          </>
        )}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onClose={handleCloseForm}
          onTaskCreated={handleTaskUpdated}
          editTask={editingTask}
        />
      )}
    </div>
  );
}

