// Vercel API Route for Auth
import { NextRequest, NextResponse } from 'next/server';

const users: Map<string, { id: string; email: string; password: string }> = new Map();

export async function POST(request: NextRequest) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const url = new URL(request.url);
  const path = url.pathname;

  if (path.endsWith('/api/auth/register')) {
    return handleRegister(request, headers);
  }

  if (path.endsWith('/api/auth/login')) {
    return handleLogin(request, headers);
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404, headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleRegister(request: NextRequest, headers: any) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400, headers });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400, headers });
    }

    if (users.has(email)) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400, headers });
    }

    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    users.set(email, { id: userId, email, password });

    return NextResponse.json({ success: true, userId, message: 'Account created successfully' }, { headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500, headers });
  }
}

async function handleLogin(request: NextRequest, headers: any) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400, headers });
    }

    const user = users.get(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401, headers });
    }

    return NextResponse.json({ success: true, userId: user.id, message: 'Login successful' }, { headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500, headers });
  }
}
