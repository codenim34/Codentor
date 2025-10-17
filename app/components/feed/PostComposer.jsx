"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Image, Video, X, Loader2, Globe, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function PostComposer({ onPostCreated }) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await fetch('/api/feed/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        return await response.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setMedia(prev => [...prev, ...uploadedFiles]);
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setIsPosting(true);

    try {
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          media,
          visibility
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      
      // Add author info to new post
      newPost.author = {
        userId: user.id,
        userName: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        image_url: user.imageUrl
      };
      newPost.likesCount = 0;
      newPost.sharesCount = 0;
      newPost.isLikedByUser = false;

      onPostCreated(newPost);
      
      // Reset form
      setContent("");
      setMedia([]);
      setVisibility("public");
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-emerald-900/30 rounded-xl p-6 shadow-lg">
      {/* User Avatar and Input */}
      <div className="flex items-start space-x-4">
        <img
          src={user?.imageUrl || '/default-avatar.png'}
          alt={user?.firstName}
          className="w-12 h-12 rounded-full border-2 border-emerald-500/30"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-gray-900/50 border border-emerald-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
            maxLength={5000}
          />
        </div>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {media.map((item, index) => (
            <div key={index} className="relative group">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt="Upload"
                  className="w-full h-32 object-cover rounded-lg border border-emerald-900/30"
                />
              ) : (
                <div className="w-full h-32 bg-gray-900/50 border border-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Video className="w-8 h-8 text-emerald-400" />
                </div>
              )}
              <button
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-emerald-900/30 pt-4">
        <div className="flex items-center space-x-2">
          {/* Image Upload */}
          <label className="cursor-pointer p-2 hover:bg-emerald-500/10 rounded-lg transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'image')}
              disabled={isUploading || isPosting}
            />
            <Image className="w-5 h-5 text-emerald-400" />
          </label>

          {/* Video Upload */}
          <label className="cursor-pointer p-2 hover:bg-emerald-500/10 rounded-lg transition-colors">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'video')}
              disabled={isUploading || isPosting}
            />
            <Video className="w-5 h-5 text-emerald-400" />
          </label>

          {/* Visibility Selector */}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="bg-gray-900/50 border border-emerald-900/30 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            disabled={isPosting}
          >
            <option value="public">🌐 Public</option>
            <option value="connections">👥 Connections Only</option>
          </select>
        </div>

        {/* Post Button */}
        <button
          onClick={handlePost}
          disabled={(!content.trim() && media.length === 0) || isPosting || isUploading}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Post</span>
            </>
          )}
        </button>
      </div>

      {isUploading && (
        <div className="mt-2 text-sm text-emerald-400 flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading media...</span>
        </div>
      )}
    </div>
  );
}

