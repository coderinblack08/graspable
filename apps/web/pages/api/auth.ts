import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    supabase.auth.api.setAuthCookie(req, res);
    // const { user } = await supabase.auth.api.getUserByCookie(req);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      message: `Method ${req.method} not allowed`,
    });
  }
}
