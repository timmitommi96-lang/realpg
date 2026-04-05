// Simple Auth API for RealPG
// Deploy this to Vercel as an API route: /api/auth/login and /api/auth/register

// In-memory storage (for demo - use a database in production)
const users: Map<string, { id: string; email: string; password: string }> = new Map();

export default async function handler(req: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  if (path === '/api/auth/register' && req.method === 'POST') {
    return handleRegister(req, headers);
  }

  if (path === '/api/auth/login' && req.method === 'POST') {
    return handleLogin(req, headers);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
}

async function handleRegister(req: Request, headers: any) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password required' }), { status: 400, headers });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }), { status: 400, headers });
    }

    // Check if user exists
    if (users.has(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Email already registered' }), { status: 400, headers });
    }

    // Create user
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    users.set(email, { id: userId, email, password });

    return new Response(JSON.stringify({ success: true, userId, message: 'Account created successfully' }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500, headers });
  }
}

async function handleLogin(req: Request, headers: any) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email and password required' }), { status: 400, headers });
    }

    // Find user
    const user = users.get(email);
    if (!user || user.password !== password) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email or password' }), { status: 401, headers });
    }

    return new Response(JSON.stringify({ success: true, userId: user.id, message: 'Login successful' }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500, headers });
  }
}
