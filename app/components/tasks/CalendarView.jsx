"use client";

import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from "react-hot-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { FiClock, FiEdit2 } from "react-icons/fi";

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default function CalendarView({ tasks, onTaskUpdated, onEditTask }) {
  const [view, setView] = useState('month'); // 'month', 'week', 'day'

  // Convert tasks to calendar events
  const events = useMemo(() => {
    return tasks.map(task => ({
      id: task._id,
      title: task.title,
      start: new Date(task.dueDate),
      end: new Date(task.dueDate),
      resource: task,
      allDay: false,
    }));
  }, [tasks]);

  // Handle event click
  const handleSelectEvent = useCallback((event) => {
    onEditTask(event.resource);
  }, [onEditTask]);

  // Handle event drag and drop (reschedule)
  const handleEventDrop = async ({ event, start, end }) => {
    if (event.resource.status === 'completed') {
      toast.error("Cannot reschedule completed tasks");
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: event.id,
          dueDate: start.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Task rescheduled successfully!");
        onTaskUpdated();
      } else {
        toast.error(data.error || "Failed to reschedule task");
      }
    } catch (error) {
      console.error("Error rescheduling task:", error);
      toast.error("Failed to reschedule task");
    }
  };

  // Handle event resize (not used but required by DnD)
  const handleEventResize = async ({ event, start, end }) => {
    // We don't allow resizing, just moving
    return;
  };

  // Custom event style getter
  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#10b981'; // emerald-500
    
    if (task.status === 'completed') {
      backgroundColor = '#6b7280'; // gray-500
    } else if (task.priority === 'high') {
      backgroundColor = '#ef4444'; // red-500
    } else if (task.priority === 'medium') {
      backgroundColor = '#f59e0b'; // amber-500
    } else if (task.priority === 'low') {
      backgroundColor = '#3b82f6'; // blue-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: task.status === 'completed' ? 0.6 : 1,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.875rem',
        padding: '4px 8px',
      }
    };
  };

  // Custom event component
  const EventComponent = ({ event }) => (
    <div className="flex items-center gap-1">
      {event.resource.status === 'completed' && <FiClock size={12} />}
      <span className="truncate">{event.title}</span>
    </div>
  );

  return (
    <div className="bg-gray-900/50 border border-emerald-500/20 rounded-xl p-6">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
          background: transparent;
        }
        .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .rbc-today {
          background-color: rgba(16, 185, 129, 0.1);
        }
        .rbc-off-range-bg {
          background: rgba(31, 41, 55, 0.3);
        }
        .rbc-month-view, .rbc-time-view {
          background: transparent;
          border-color: rgba(16, 185, 129, 0.2);
        }
        .rbc-month-row, .rbc-day-bg, .rbc-time-content {
          border-color: rgba(16, 185, 129, 0.1);
        }
        .rbc-date-cell {
          padding: 8px;
          color: #d1d5db;
        }
        .rbc-now {
          color: #10b981;
          font-weight: 700;
        }
        .rbc-event {
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 0.9;
        }
        .rbc-toolbar {
          padding: 16px 0;
          margin-bottom: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: space-between;
          align-items: center;
        }
        .rbc-toolbar button {
          color: #d1d5db;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        .rbc-toolbar button.rbc-active {
          background: linear-gradient(to right, #10b981, #059669);
          color: white;
          border-color: #10b981;
        }
        .rbc-time-slot {
          color: #9ca3af;
          border-color: rgba(16, 185, 129, 0.1);
        }
        .rbc-current-time-indicator {
          background-color: #10b981;
        }
        .rbc-time-header-content {
          border-color: rgba(16, 185, 129, 0.2);
        }
        .rbc-time-content > * + * > * {
          border-color: rgba(16, 185, 129, 0.1);
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid rgba(16, 185, 129, 0.05);
        }
        .rbc-timeslot-group {
          border-color: rgba(16, 185, 129, 0.1);
        }
        .rbc-label {
          color: #9ca3af;
          font-size: 0.75rem;
        }
        .rbc-toolbar-label {
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
        }
        @media (max-width: 640px) {
          .rbc-toolbar {
            flex-direction: column;
          }
          .rbc-toolbar-label {
            font-size: 1rem;
            order: -1;
          }
        }
      `}</style>

      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        view={view}
        onView={setView}
        views={['month', 'week', 'day']}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        draggableAccessor={(event) => event.resource.status !== 'completed'}
        resizable={false}
        popup
        selectable
      />

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 items-center justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-gray-300">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span className="text-gray-300">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-gray-300">Low Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500 opacity-60"></div>
          <span className="text-gray-300">Completed</span>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-400">
        <FiEdit2 className="inline mr-2" size={14} />
        Drag and drop tasks to reschedule them
      </div>
    </div>
  );
}

