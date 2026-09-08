import { redirect } from "next/navigation";
import { getCurrentAdmin } from "./auth";

/* Page-level guard. Kept out of the "use server" actions file because a module
   with that directive may only export async server actions.

   Every admin page calls this. The layout renders the chrome but does not
   enforce access on its own - a layout is the wrong place for the only lock on
   a door, because a future refactor can move it without anyone noticing. */

export async function requireAdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/sign-in");
  return admin;
}
