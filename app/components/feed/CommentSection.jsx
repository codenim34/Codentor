"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import toast from "react-hot-toast";

export default function CommentSection({ postId }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/feed/posts/${postId}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsPosting(true);

    try {
      const response = await fetch('/api/feed/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: newComment.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const comment = await response.json();
      
      // Add author info
      const commentWithAuthor = {
        ...comment,
        author: {
          userId: user.id,
          userName: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          image_url: user.imageUrl
        },
        likesCount: 0,
        isLikedByUser: false,
        replies: []
      };

      setComments(prev => [commentWithAuthor, ...prev]);
      setNewComment("");
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
    toast.success('Comment deleted');
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(prev => prev.map(comment =>
      comment._id === updatedComment._id ? { ...comment, ...updatedComment } : comment
    ));
  };

  const handleReplyAdded = (parentCommentId, reply) => {
    setComments(prev => prev.map(comment => {
      if (comment._id === parentCommentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));
  };

  return (
    <div className="mt-4 border-t border-emerald-900/30 pt-4">
      {/* Comment Input */}
      <div className="flex items-start space-x-3 mb-4">
        <img
          src={user?.imageUrl || '/default-avatar.png'}
          alt={user?.firstName}
          className="w-10 h-10 rounded-full border-2 border-emerald-500/30"
        />
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePostComment();
              }
            }}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-900/50 border border-emerald-900/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
            disabled={isPosting}
          />
          <button
            onClick={handlePostComment}
            disabled={!newComment.trim() || isPosting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onDelete={handleCommentDeleted}
              onUpdate={handleCommentUpdated}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

