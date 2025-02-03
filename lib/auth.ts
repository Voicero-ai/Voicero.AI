import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export { authOptions };
export const auth = () => getServerSession(authOptions);
