
import { withAuth } from "@/lib/auth/withAuth";

export const POST = (req: Request) =>
  withAuth(req, async ({ req, user }) => {
    const { title, description } = await req.json();
    
    return new Response(JSON.stringify({ 
      status: "saved", 
      user: user.email 
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });
