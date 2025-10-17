"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, MessageCircle, MoreVertical, Edit, Trash2, Globe, Users, Copy, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./CommentSection";
import ProfileModal from "./ProfileModal";
import toast from "react-hot-toast";

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isOwner = user?.id === post.authorId;

  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/feed/posts/${post._id}/like`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      setLikesCount(data.likesCount);
      setIsLiked(data.isLikedByUser);
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async (shareToFeed = false) => {
    setIsSharing(true);
    
    try {
      if (shareToFeed) {
        // Share to user's feed
        const response = await fetch(`/api/feed/posts/${post._id}/share`, {
          method: 'POST'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to share post');
        }

        toast.success('Shared to your feed!');
        onUpdate({ ...post, sharesCount: post.sharesCount + 1 });
      } else {
        // Copy link to clipboard
        const postUrl = `${window.location.origin}/feed/${post._id}`;
        await navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
      }
      
      setShowShareModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/feed/posts/${post._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      onDelete(post._id);
    } catch (error) {
      toast.error('Failed to delete post');
      setIsDeleting(false);
    }
  };

  const handleCopyCode = async () => {
    if (post.codeSnippet?.code) {
      try {
        await navigator.clipboard.writeText(post.codeSnippet.code);
        setCopiedCode(true);
        toast.success('Code copied to clipboard!');
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        toast.error('Failed to copy code');
      }
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-md border border-emerald-900/30 rounded-xl p-6 shadow-lg hover:border-emerald-500/50 transition-all">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.image_url || '/default-avatar.png'}
            alt={post.author.firstName}
            className="w-12 h-12 rounded-full border-2 border-emerald-500/30 cursor-pointer hover:border-emerald-500 transition-all"
            onClick={() => setShowProfileModal(true)}
          />
          <div>
            <h3 
              className="text-white font-semibold cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => setShowProfileModal(true)}
            >
              {post.author.firstName} {post.author.lastName}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>@{post.author.userName}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>•</span>
              {post.visibility === 'public' ? (
                <Globe className="w-3 h-3" title="Public" />
              ) : (
                <Users className="w-3 h-3" title="Connections only" />
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-emerald-900/30 rounded-lg shadow-xl z-10">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-200 whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.media.map((item, index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-emerald-900/30">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt="Post media"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-48 object-cover"
                    poster={item.thumbnail}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Code Snippet */}
        {post.codeSnippet && post.codeSnippet.code && (
          <div className="mt-4 bg-gray-900 border border-emerald-900/30 rounded-lg overflow-hidden">
            {/* Code Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-emerald-900/30">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-emerald-400 uppercase">
                  {post.codeSnippet.language || 'code'}
                </span>
                {post.codeSnippet.title && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-300">{post.codeSnippet.title}</span>
                  </>
                )}
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {/* Code Content */}
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap break-words">
                <code>{post.codeSnippet.code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Legacy Tags (for backward compatibility) */}
        {post.tags && post.tags.length > 0 && !post.hashtags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-4 border-t border-emerald-900/30 pt-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isLiked
              ? 'text-red-400 bg-red-500/10'
              : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection postId={post._id} />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userId={post.author.userId || post.authorId}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

