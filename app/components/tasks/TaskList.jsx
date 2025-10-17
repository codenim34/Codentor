"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiExternalLink, FiClock, FiCheckCircle, FiCircle, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { format, isPast, isToday, isTomorrow } from "date-fns";

export default function TaskList({ tasks, onTaskUpdated, onEditTask }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setDeletingId(taskId);

    try {
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Task deleted successfully!");
        onTaskUpdated();
      } else {
        toast.error(data.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task._id,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(newStatus === 'completed' ? "Task completed! 🎉" : "Task reopened");
        onTaskUpdated();
      } else {
        toast.error(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="text-green-400" />;
      case 'in-progress': return <FiAlertCircle className="text-yellow-400" />;
      default: return <FiCircle className="text-gray-400" />;
    }
  };

  const getDueDateLabel = (dueDate) => {
    const date = new Date(dueDate);
    if (isToday(date)) return { text: 'Today', class: 'text-emerald-400 bg-emerald-500/10' };
    if (isTomorrow(date)) return { text: 'Tomorrow', class: 'text-blue-400 bg-blue-500/10' };
    if (isPast(date)) return { text: 'Overdue', class: 'text-red-400 bg-red-500/10' };
    return { text: format(date, 'MMM dd, yyyy'), class: 'text-gray-400 bg-gray-500/10' };
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <FiClock size={64} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No tasks found</h3>
        <p className="text-gray-500">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const dueDateInfo = getDueDateLabel(task.dueDate);
        
        return (
          <div
            key={task._id}
            className={`bg-gray-800/50 border rounded-xl p-4 hover:border-emerald-500/50 transition-all ${
              task.status === 'completed' 
                ? 'border-gray-700/50 opacity-75' 
                : 'border-emerald-500/20'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Status Toggle */}
              <button
                onClick={() => handleToggleStatus(task)}
                className="mt-1 hover:scale-110 transition-transform"
              >
                {getStatusIcon(task.status)}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className={`text-lg font-semibold mb-2 ${
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-white'
                }`}>
                  {task.title}
                </h3>

                {/* Description */}
                {task.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Due Date */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${dueDateInfo.class}`}>
                    <FiClock className="inline mr-1" size={12} />
                    {dueDateInfo.text}
                  </span>

                  {/* Priority */}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <>
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </>
                  )}

                  {/* Link */}
                  {task.link && (
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors inline-flex items-center gap-1"
                    >
                      <FiExternalLink size={12} />
                      Link
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEditTask(task)}
                  className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                  title="Edit task"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  disabled={deletingId === task._id}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                  title="Delete task"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

