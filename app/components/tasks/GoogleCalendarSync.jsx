"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiCalendar, FiCheck, FiRefreshCw, FiX } from "react-icons/fi";

export default function GoogleCalendarSync({ onSyncComplete }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/tasks/google-status');
      const data = await response.json();
      setConnected(data.connected);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? Your tasks will remain, but sync will stop.')) {
      return;
    }

    try {
      const response = await fetch('/api/tasks/google-status', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Google Calendar disconnected');
        setConnected(false);
      } else {
        toast.error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/tasks/sync');
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        toast.error(data.error || 'Failed to sync');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            connected ? 'bg-green-500/20' : 'bg-gray-700'
          }`}>
            <FiCalendar className={connected ? 'text-green-400' : 'text-gray-400'} size={20} />
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              Google Calendar
              {connected && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <FiCheck size={12} />
                  Connected
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400">
              {connected 
                ? 'Tasks are synced with your Google Calendar' 
                : 'Connect to sync tasks with Google Calendar'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {connected ? (
            <>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <FiRefreshCw className={syncing ? 'animate-spin' : ''} size={16} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FiX size={16} />
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-medium transition-all"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

