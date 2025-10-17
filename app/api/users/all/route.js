import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb/mongoose';
import User from '@/lib/models/userModel';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    await connect();

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch users except current user
    const users = await User.find({}, { clerkId: 1, firstName: 1, lastName: 1, userName: 1, image_url: 1, email: 1 })
      .limit(50);

    const sanitized = users
      .filter(u => u.clerkId !== userId)
      .map(u => ({
        id: u.clerkId,
        firstName: u.firstName,
        lastName: u.lastName,
        userName: u.userName,
        image_url: u.image_url || '',
      }));

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}


