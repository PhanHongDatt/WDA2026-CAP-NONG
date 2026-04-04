import { redirect } from "next/navigation";

/**
 * Root page — redirect to /home
 */
export default function RootPage() {
  redirect("/home");
}
