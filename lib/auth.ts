import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export { authOptions };
export const auth = () => getServerSession(authOptions);
