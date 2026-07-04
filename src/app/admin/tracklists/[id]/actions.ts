"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { parseTracklist } from "@/lib/tracklist-parser";

export async function saveTracklistAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("tracklist") ?? "");
  const statusRaw = String(formData.get("status") ?? "partial");
  const status = ["missing", "partial", "complete"].includes(statusRaw) ? statusRaw : "partial";

  if (!id) throw new Error("show id required");

  const tracklist = parseTracklist(raw);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("shows")
    .update({ tracklist, tracklist_status: tracklist.length === 0 ? "missing" : status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/tracklists");
  revalidatePath(`/admin/tracklists/${id}`);
  redirect("/admin/tracklists");
}
