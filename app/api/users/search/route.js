import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connect } from "@/lib/mongodb/mongoose";
import Connection from "@/lib/models/connectionModel";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Get all users from Clerk
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({
      limit: 50,
      query: query,
    });

    // Get all connections for current user
    const connections = await Connection.find({
      $or: [{ requesterId: currentUserId }, { recipientId: currentUserId }],
    });

    // Create a map of connection statuses
    const connectionMap = new Map();
    connections.forEach((conn) => {
      const otherUserId =
        conn.requesterId === currentUserId
          ? conn.recipientId
          : conn.requesterId;

      if (conn.status === "accepted") {
        connectionMap.set(otherUserId, "connected");
      } else if (conn.status === "pending") {
        // Only show as pending if current user sent the request
        if (conn.requesterId === currentUserId) {
          connectionMap.set(otherUserId, "pending");
        }
      }
    });

    // Format and filter users
    const formattedUsers = users
      .filter((user) => user.id !== currentUserId) // Exclude current user
      .map((user) => ({
        id: user.id,
        firstName: user.firstName || "User",
        lastName: user.lastName || "",
        userName:
          user.username ||
          user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
          "user",
        email: user.emailAddresses[0]?.emailAddress,
        image_url: user.imageUrl,
        bio: user.publicMetadata?.bio || "",
        connectionStatus: connectionMap.get(user.id) || "none",
      }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
