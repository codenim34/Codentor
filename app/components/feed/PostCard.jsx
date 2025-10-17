"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, MessageCircle, Share2, MoreVertical, Edit, Trash2, Globe, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./CommentSection";
import toast from "react-hot-toast";

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${post._id}/share`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to share post');
      }

      toast.success('Post shared successfully!');
      onUpdate({ ...post, sharesCount: post.sharesCount + 1 });
    } catch (error) {
      toast.error(error.message);
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

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-6 shadow-lg hover:border-emerald-500/50 transition-all">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.image_url || '/default-avatar.png'}
            alt={post.author.firstName}
            className="w-12 h-12 rounded-full border-2 border-emerald-500/30"
          />
          <div>
            <h3 className="text-white font-semibold">
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

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
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
      <div className="flex items-center justify-between border-t border-emerald-900/30 pt-4">
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

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{post.sharesCount || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection postId={post._id} />
      )}
    </div>
  );
}

