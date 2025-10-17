import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import Post from '@/lib/models/postModel';
import User from '@/lib/models/userModel';
import { auth } from '@clerk/nextjs/server';

export async function GET(request, { params }) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get author details
    const author = await User.findOne({ clerkId: post.authorId });

    const postWithAuthor = {
      ...post.toObject(),
      author: {
        userId: post.authorId,
        userName: author?.userName || 'Unknown',
        firstName: author?.firstName || '',
        lastName: author?.lastName || '',
        image_url: author?.image_url || ''
      },
      likesCount: post.likes.length,
      sharesCount: post.shares.length,
      isLikedByUser: post.likes.includes(userId)
    };

    return NextResponse.json(postWithAuthor);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { content, media, tags, visibility } = await request.json();

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only author can edit
    if (post.authorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to edit this post' },
        { status: 403 }
      );
    }

    if (content !== undefined) post.content = content;
    if (media !== undefined) post.media = media;
    if (tags !== undefined) post.tags = tags;
    if (visibility !== undefined) post.visibility = visibility;

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only author can delete
    if (post.authorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

