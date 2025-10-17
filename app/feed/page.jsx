"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PostComposer from "../components/feed/PostComposer";
import PostCard from "../components/feed/PostCard";
import { Loader2, Filter, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function FeedPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' or 'connections'
  const observerTarget = useRef(null);
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const fetchPosts = useCallback(async (pageNum = 1, currentFilter = filter) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/feed/posts?page=${pageNum}&limit=10&filter=${currentFilter}`);
      
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
  }, [filter, router]);

  useEffect(() => {
    if (user) {
      fetchPosts(1, filter);
      fetchPeople();
    }
  }, [user, filter, fetchPosts]);

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
    if (page > 1) {
      fetchPosts(page, filter);
    }
  }, [page, filter, fetchPosts]);

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

  const fetchPeople = async () => {
    try {
      setLoadingPeople(true);
      const res = await fetch('/api/users/all');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setPeople(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPeople(false);
    }
  };

  const handleConnect = async (recipientId) => {
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send request');
      }
      toast.success('Connection request sent');
    } catch (e) {
      toast.error(e.message);
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-2">
            Feed
          </h1>
          <p className="text-gray-400 text-sm">Connect and share with the community</p>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6 flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-lg p-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter("connections")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "connections"
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:text-emerald-400"
            }`}
          >
            My Connections
          </button>
        </div>

        {/* People You May Know */}
        <div className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">People you may know</h2>
            <button
              onClick={fetchPeople}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              Refresh
            </button>
          </div>
          {loadingPeople ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : people.length === 0 ? (
            <div className="text-gray-500 text-sm">No suggestions right now.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {people.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center space-x-3 bg-gray-900/40 border border-emerald-900/30 rounded-lg p-3">
                  <img src={p.image_url || '/default-avatar.png'} alt={p.firstName} className="w-8 h-8 rounded-full border border-emerald-500/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-gray-500 text-xs truncate">@{p.userName}</p>
                  </div>
                  <button
                    onClick={() => handleConnect(p.id)}
                    className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Connect</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Composer */}
        <PostComposer onPostCreated={handlePostCreated} />

        {/* Posts Feed */}
        <div className="mt-6 space-y-6">
          {posts.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-gray-800/30 border border-emerald-900/30 rounded-xl">
              <p className="text-gray-400">No posts yet. Be the first to share something!</p>
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
      </div>
    </div>
  );
}

