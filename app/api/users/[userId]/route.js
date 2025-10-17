import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request, { params }) {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    
    // Get user details from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format user data
    const userData = {
      id: user.id,
      firstName: user.firstName || 'User',
      lastName: user.lastName || '',
      userName: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
      email: user.emailAddresses[0]?.emailAddress,
      image_url: user.imageUrl,
      bio: user.publicMetadata?.bio || '',
      location: user.publicMetadata?.location || '',
      skills: user.publicMetadata?.skills || [],
      createdAt: user.createdAt,
      postsCount: user.publicMetadata?.postsCount || 0,
      connectionsCount: user.publicMetadata?.connectionsCount || 0,
      questsCompleted: user.publicMetadata?.questsCompleted || 0,
    };

    // Check connection status with current user
    let connectionStatus = 'none';
    
    // You can implement connection checking from your database here
    // For now, returning 'none' as default
    
    return NextResponse.json({
      user: userData,
      connectionStatus
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
