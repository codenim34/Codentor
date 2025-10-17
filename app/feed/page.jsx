"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PostComposer from "../components/feed/PostComposer";
import PostCard from "../components/feed/PostCard";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function FeedPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'my-posts', or 'connections'
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const observerTarget = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const fetchPosts = useCallback(async (pageNum = 1, currentTab = activeTab) => {
    if (currentTab === 'connections') {
      // Don't fetch posts for connections tab
      return;
    }

    try {
      setIsLoading(true);
      const filterParam = currentTab === 'my-posts' ? 'my-posts' : 'all';
      const response = await fetch(`/api/feed/posts?page=${pageNum}&limit=10&filter=${filterParam}`);
      
      if (response.status === 401) {
        // Unauthorized - redirect to sign-in
        router.push('/sign-in');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
      setHasMore(false); // Stop infinite scroll on error
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, router]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'connections') {
        fetchConnections();
      } else {
        setPage(1);
        fetchPosts(1, activeTab);
      }
    }
  }, [user, activeTab, fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1 && activeTab !== 'connections') {
      fetchPosts(page, activeTab);
    }
  }, [page, activeTab, fetchPosts]);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      
      // Fetch accepted connections
      const connectionsRes = await fetch('/api/connections/my');
      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData.connections || []);
      }
      
      // Fetch pending requests
      const pendingRes = await fetch('/api/connections/pending');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingRequests(pendingData.requests || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptConnection = async (requestId) => {
    try {
      const response = await fetch(`/api/connections/${requestId}/accept`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Connection request accepted');
        fetchConnections(); // Refresh the data
      } else {
        throw new Error('Failed to accept connection');
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection request');
    }
  };

  const handleRejectConnection = async (requestId) => {
    try {
      const response = await fetch(`/api/connections/${requestId}/reject`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Connection request rejected');
        fetchConnections(); // Refresh the data
      } else {
        throw new Error('Failed to reject connection');
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast.error('Failed to reject connection request');
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    toast.success('Post created successfully!');
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
    toast.success('Post deleted successfully');
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post._id === updatedPost._id ? { ...post, ...updatedPost } : post
    ));
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-2">
            Feed
          </h1>
          <p className="text-gray-400 text-sm">Connect and share with the community</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-lg p-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveTab("my-posts")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "my-posts"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "connections"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            Connections
          </button>
        </div>

        {/* Post Composer - Only show for All Posts and My Posts tabs */}
        {activeTab !== "connections" && (
          <PostComposer onPostCreated={handlePostCreated} />
        )}

        {/* Content based on active tab */}
        {activeTab === "connections" ? (
          <div className="mt-6 space-y-6">
            {/* Pending Connection Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                  Pending Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={request.requester?.image_url || '/default-avatar.png'}
                          alt={request.requester?.userName || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">
                            {request.requester?.firstName} {request.requester?.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">@{request.requester?.userName}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptConnection(request._id)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectConnection(request._id)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Connections */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                My Connections ({connections.length})
              </h2>
              {connections.length === 0 && !isLoading && (
                <p className="text-gray-400 text-center py-8">No connections yet</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((connection) => (
                  <div
                    key={connection._id}
                    className="flex items-center space-x-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-emerald-500/30 transition-colors"
                  >
                    <img
                      src={connection.user?.image_url || '/default-avatar.png'}
                      alt={connection.user?.userName || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {connection.user?.firstName} {connection.user?.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">@{connection.user?.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {posts.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-gray-800/30 border border-emerald-900/30 rounded-xl">
                <p className="text-gray-400">
                  {activeTab === "my-posts"
                    ? "You haven't created any posts yet. Share something with the community!"
                    : "No posts yet. Be the first to share something!"}
                </p>
              </div>
            )}

            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
              />
            ))}

            {isLoading && posts.length > 0 && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}

