"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Search, UserPlus, Check, X as XIcon, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ConnectionsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("requests"); // 'requests', 'myConnections', 'search'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      fetchMyConnections();
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/connections/pending');
      if (!response.ok) throw new Error('Failed to fetch pending requests');
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to load connection requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyConnections = async () => {
    try {
      const response = await fetch('/api/connections/my');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setMyConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/accept`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to accept request');
      
      toast.success('Connection request accepted!');
      fetchPendingRequests();
      fetchMyConnections();
    } catch (error) {
      toast.error('Failed to accept connection request');
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/reject`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to reject request');
      
      toast.success('Connection request rejected');
      fetchPendingRequests();
    } catch (error) {
      toast.error('Failed to reject connection request');
    }
  };

  const handleConnect = async (userId) => {
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send connection request');
      }

      toast.success('Connection request sent!');
      // Update search results to show pending status
      setSearchResults(prev => prev.map(u => 
        u.id === userId ? { ...u, connectionStatus: 'pending' } : u
      ));
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-2">
            Connections
          </h1>
          <p className="text-gray-400 text-sm">Manage your professional network</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-lg p-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "requests"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("myConnections")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "myConnections"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            My Connections ({myConnections.length})
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "search"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            Search Users
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-emerald-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {/* Pending Requests */}
          {activeTab === "requests" && (
            <>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 border border-emerald-900/30 rounded-xl">
                  <p className="text-gray-400">No pending connection requests</p>
                </div>
              ) : (
                pendingRequests.map(request => (
                  <div key={request._id} className="bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={request.requester.image_url || '/default-avatar.png'}
                          alt={request.requester.firstName}
                          className="w-16 h-16 rounded-full border-2 border-emerald-500/30"
                        />
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {request.requester.firstName} {request.requester.lastName}
                          </h3>
                          <p className="text-emerald-400 text-sm">@{request.requester.userName}</p>
                          {request.requester.bio && (
                            <p className="text-gray-400 text-sm mt-1">{request.requester.bio}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                          <XIcon className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* My Connections */}
          {activeTab === "myConnections" && (
            <>
              {myConnections.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 border border-emerald-900/30 rounded-xl">
                  <p className="text-gray-400">You don't have any connections yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myConnections.map(connection => (
                    <div key={connection._id} className="bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-4 hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center space-x-3">
                        <img
                          src={connection.user.image_url || '/default-avatar.png'}
                          alt={connection.user.firstName}
                          className="w-12 h-12 rounded-full border-2 border-emerald-500/30"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {connection.user.firstName} {connection.user.lastName}
                          </h3>
                          <p className="text-emerald-400 text-sm truncate">@{connection.user.userName}</p>
                        </div>
                        <UserCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Search Results */}
          {activeTab === "search" && (
            <>
              {isSearching ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 border border-emerald-900/30 rounded-xl">
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(searchUser => (
                  <div key={searchUser.id} className="bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={searchUser.image_url || '/default-avatar.png'}
                          alt={searchUser.firstName}
                          className="w-16 h-16 rounded-full border-2 border-emerald-500/30"
                        />
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {searchUser.firstName} {searchUser.lastName}
                          </h3>
                          <p className="text-emerald-400 text-sm">@{searchUser.userName}</p>
                          {searchUser.bio && (
                            <p className="text-gray-400 text-sm mt-1">{searchUser.bio}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {searchUser.id === user.id ? (
                          <div className="text-gray-500 text-sm">You</div>
                        ) : searchUser.connectionStatus === 'connected' ? (
                          <div className="flex items-center space-x-2 text-emerald-400">
                            <UserCheck className="w-5 h-5" />
                            <span className="text-sm font-medium">Connected</span>
                          </div>
                        ) : searchUser.connectionStatus === 'pending' ? (
                          <div className="text-gray-400 text-sm">Request Pending</div>
                        ) : (
                          <button
                            onClick={() => handleConnect(searchUser.id)}
                            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-800/30 border border-emerald-900/30 rounded-xl">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Search for users to connect with</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
