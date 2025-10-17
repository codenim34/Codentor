"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, Reply, MoreVertical, Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function CommentItem({ comment, onDelete, onUpdate, onReplyAdded, isReply = false }) {
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(comment.isLikedByUser);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const isOwner = user?.id === comment.authorId;

  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/feed/comments/${comment._id}/like`, {
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/feed/comments/${comment._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      onDelete(comment._id);
    } catch (error) {
      toast.error('Failed to delete comment');
      setIsDeleting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsReplying(true);

    try {
      const response = await fetch('/api/feed/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: comment.postId,
          content: replyContent.trim(),
          parentCommentId: comment._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post reply');
      }

      const reply = await response.json();
      
      // Add author info
      const replyWithAuthor = {
        ...reply,
        author: {
          userId: user.id,
          userName: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          image_url: user.imageUrl
        },
        likesCount: 0,
        isLikedByUser: false
      };

      onReplyAdded(comment._id, replyWithAuthor);
      setReplyContent("");
      setShowReplyInput(false);
      toast.success('Reply posted!');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.author.image_url || '/default-avatar.png'}
          alt={comment.author.firstName}
          className="w-8 h-8 rounded-full border-2 border-emerald-500/30"
        />
        
        <div className="flex-1">
          <div className="bg-gray-900/50 border border-emerald-900/30 rounded-lg px-4 py-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-semibold text-sm">
                  {comment.author.firstName} {comment.author.lastName}
                </h4>
                <p className="text-xs text-gray-400">
                  @{comment.author.userName} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-emerald-900/30 rounded-lg shadow-xl z-10">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-gray-200 text-sm mt-2 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-2 ml-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs ${
                isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              } transition-colors`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount > 0 && likesCount}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="flex items-start space-x-2 mt-3 ml-4">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
                placeholder={`Reply to ${comment.author.firstName}...`}
                className="flex-1 bg-gray-900/50 border border-emerald-900/30 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-xs"
                disabled={isReplying}
              />
              <button
                onClick={handleReply}
                disabled={!replyContent.trim() || isReplying}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white p-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReplying ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onReplyAdded={onReplyAdded}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

