"use server";

import { redirect } from "next/navigation";
import { suppressByToken } from "@/lib/basket-recovery";

export async function stopBasketReminders(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const ok = await suppressByToken(token);
  redirect(`/basket/unsubscribe?token=${encodeURIComponent(token)}&done=${ok ? "1" : "0"}`);
}
