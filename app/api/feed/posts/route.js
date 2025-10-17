import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Post from "@/lib/models/postModel";
import Connection from "@/lib/models/connectionModel";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, media, tags, visibility, codeSnippet } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }

    const post = new Post({
      authorId: userId,
      content,
      codeSnippet: codeSnippet || null,
      media: media || [],
      tags: tags || [],
      hashtags: hashtags,
      visibility: visibility || 'public'
    });

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter') || 'all'; // 'all', 'connections', or 'my-posts'
    
    const skip = (page - 1) * limit;

    let query = {};

    if (filter === 'my-posts') {
      // Show only user's own posts
      query.authorId = userId;
    } else if (filter === 'connections') {
      // Get user's connections
      const connections = await Connection.find({
        $or: [
          { requesterId: userId, status: 'accepted' },
          { recipientId: userId, status: 'accepted' }
        ]
      });

      const connectedUserIds = connections.map(conn => 
        conn.requesterId === userId ? conn.recipientId : conn.requesterId
      );

      // Include user's own posts and posts from connections
      query.authorId = { $in: [...connectedUserIds, userId] };
    } else {
      // Show all public posts or posts visible to connections
      const connections = await Connection.find({
        $or: [
          { requesterId: userId, status: 'accepted' },
          { recipientId: userId, status: 'accepted' }
        ]
      });

      const connectedUserIds = connections.map(conn => 
        conn.requesterId === userId ? conn.recipientId : conn.requesterId
      );

      query = {
        $or: [
          { visibility: 'public' },
          { visibility: 'connections', authorId: { $in: connectedUserIds } },
          { authorId: userId }
        ]
      };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    // Get author details from Clerk
    const authorIds = [...new Set(posts.map(post => post.authorId))];
    const client = await clerkClient();
    const authorsPromises = authorIds.map(id => client.users.getUser(id).catch(() => null));
    const authors = await Promise.all(authorsPromises);
    
    const authorMap = new Map(
      authors
        .filter(author => author !== null)
        .map(author => [author.id, author])
    );

    // Combine post data with author details
    const postsWithAuthors = posts.map(post => {
      const clerkAuthor = authorMap.get(post.authorId);
      return {
        ...post.toObject(),
        author: {
          userId: post.authorId,
          userName: clerkAuthor?.username || clerkAuthor?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
          firstName: clerkAuthor?.firstName || 'User',
          lastName: clerkAuthor?.lastName || '',
          image_url: clerkAuthor?.imageUrl || ''
        },
        likesCount: post.likes.length,
        sharesCount: post.shares.length,
        isLikedByUser: post.likes.includes(userId)
      };
    });

    return NextResponse.json({
      posts: postsWithAuthors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: page * limit < totalPosts
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

