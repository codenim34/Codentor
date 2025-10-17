"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FiEdit2, FiTrash2, FiExternalLink, FiClock } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { format, isPast, isToday, isTomorrow } from "date-fns";

export default function KanbanBoard({ tasks, onTaskUpdated, onEditTask }) {
  const [deletingId, setDeletingId] = useState(null);

  // Organize tasks by status
  const columns = {
    pending: tasks.filter(t => t.status === 'pending'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const columnTitles = {
    pending: 'To Do',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  const columnColors = {
    pending: 'border-yellow-500/30 bg-yellow-500/5',
    'in-progress': 'border-blue-500/30 bg-blue-500/5',
    completed: 'border-green-500/30 bg-green-500/5',
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: draggableId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Task moved to ${columnTitles[newStatus]}!`);
        onTaskUpdated();
      } else {
        toast.error(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (taskId, e) => {
    e.stopPropagation();
    
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-gray-500';
    }
  };

  const getDueDateLabel = (dueDate) => {
    const date = new Date(dueDate);
    if (isToday(date)) return { text: 'Today', class: 'text-emerald-400' };
    if (isTomorrow(date)) return { text: 'Tomorrow', class: 'text-blue-400' };
    if (isPast(date)) return { text: 'Overdue', class: 'text-red-400' };
    return { text: format(date, 'MMM dd'), class: 'text-gray-400' };
  };

  const TaskCard = ({ task, index }) => {
    const dueDateInfo = getDueDateLabel(task.dueDate);

    return (
      <Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-gray-800 rounded-lg p-4 mb-3 ${getPriorityColor(task.priority)} ${
              snapshot.isDragging ? 'shadow-2xl ring-2 ring-emerald-500' : ''
            } hover:shadow-lg transition-all cursor-move`}
          >
            {/* Title */}
            <h4 className="text-white font-semibold mb-2 line-clamp-2">
              {task.title}
            </h4>

            {/* Description */}
            {task.description && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Due Date */}
            <div className={`flex items-center gap-1 text-sm mb-3 ${dueDateInfo.class}`}>
              <FiClock size={14} />
              <span>{dueDateInfo.text}</span>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 items-center justify-between pt-2 border-t border-gray-700">
              <div className="flex gap-1">
                {task.link && (
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-all"
                    title="Open link"
                  >
                    <FiExternalLink size={14} />
                  </a>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                  className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-all"
                  title="Edit task"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(task._id, e)}
                  disabled={deletingId === task._id}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all disabled:opacity-50"
                  title="Delete task"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([columnId, columnTasks]) => (
          <div key={columnId} className="flex flex-col">
            {/* Column Header */}
            <div className={`rounded-t-xl border-t border-x p-4 ${columnColors[columnId]}`}>
              <h3 className="text-white font-bold text-lg flex items-center justify-between">
                <span>{columnTitles[columnId]}</span>
                <span className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </h3>
            </div>

            {/* Column Content */}
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 rounded-b-xl border-b border-x p-4 min-h-[500px] transition-colors ${
                    columnColors[columnId]
                  } ${
                    snapshot.isDraggingOver ? 'bg-emerald-500/10 border-emerald-500/50' : ''
                  }`}
                >
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-sm">No tasks</p>
                    </div>
                  ) : (
                    columnTasks.map((task, index) => (
                      <TaskCard key={task._id} task={task} index={index} />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-400">
        Drag and drop tasks between columns to change their status
      </div>
    </DragDropContext>
  );
}

