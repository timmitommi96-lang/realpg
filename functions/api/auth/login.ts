export const onRequestPost = async (request: Request) => {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Email and password required" 
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  const userId = "user_" + Date.now();
  
  return new Response(JSON.stringify({ 
    success: true, 
    userId,
    message: "Login successful" 
  }), {
    headers: { "Content-Type": "application/json" }
  });
};
