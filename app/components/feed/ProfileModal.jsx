"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Check, Mail, MapPin, Calendar, Code2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function ProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('none'); // 'none', 'pending', 'connected'
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setProfile(data.user);
      setConnectionStatus(data.connectionStatus || 'none');
    } catch (error) {
      toast.error('Failed to load profile');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      const response = await fetch(`/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send connection request');
      }

      const data = await response.json();
      setConnectionStatus('pending');
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={onClose}>
        <div className="bg-gray-800 border border-emerald-900/30 rounded-xl shadow-2xl w-full max-w-md mx-4 p-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-gray-800 border border-emerald-900/30 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header with Cover */}
        <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-green-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-gray-900/50 hover:bg-gray-900/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-12 mb-4">
            <img
              src={profile.image_url || '/default-avatar.png'}
              alt={profile.firstName}
              className="w-24 h-24 rounded-full border-4 border-gray-800 shadow-xl"
            />
          </div>

          {/* User Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-emerald-400 mb-2">@{profile.userName}</p>
            
            {profile.bio && (
              <p className="text-gray-300 text-sm mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex justify-center space-x-6 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{profile.postsCount || 0}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{profile.connectionsCount || 0}</div>
                <div className="text-xs text-gray-400">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{profile.questsCompleted || 0}</div>
                <div className="text-xs text-gray-400">Quests</div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 mb-6">
            {profile.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>{profile.email}</span>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 5).map((skill, index) => (
                    <span key={index} className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Action Button */}
          {connectionStatus === 'none' && (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-5 h-5" />
              <span>{isConnecting ? 'Sending...' : 'Connect'}</span>
            </button>
          )}

          {connectionStatus === 'pending' && (
            <div className="w-full flex items-center justify-center space-x-2 bg-gray-700 text-gray-400 py-3 rounded-lg font-medium">
              <Check className="w-5 h-5" />
              <span>Request Pending</span>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div className="w-full flex items-center justify-center space-x-2 bg-emerald-500/20 text-emerald-400 py-3 rounded-lg font-medium">
              <Check className="w-5 h-5" />
              <span>Connected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
