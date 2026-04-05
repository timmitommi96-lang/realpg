export const onRequestPost = async (request: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  const { email, password } = await request.json();
  
  if (!email || !password) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Email and password required" 
    }), {
      status: 400,
      headers
    });
  }
  
  const userId = "user_" + Date.now();
  
  return new Response(JSON.stringify({ 
    success: true, 
    userId,
    message: "Login successful" 
  }), {
    headers
  });
};
