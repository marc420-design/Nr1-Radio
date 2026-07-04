"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { parseBunnyVideoId } from "@/lib/bunny";

export async function createShowAction(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const lineup = String(formData.get("lineup") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const bunnyInput = String(formData.get("bunny_video") ?? "").trim();
  const youtubeInput = String(formData.get("youtube_id") ?? "").trim() || null;
  const durationRaw = String(formData.get("duration_min") ?? "").trim();
  const duration_min = durationRaw ? Number(durationRaw) : null;

  if (!title) throw new Error("title required");

  const bunny_video_id = bunnyInput ? parseBunnyVideoId(bunnyInput) : null;
  if (bunnyInput && !bunny_video_id) {
    throw new Error("Could not parse a Bunny video GUID from that input");
  }
  if (!bunny_video_id && !youtubeInput) {
    throw new Error("Either a Bunny video GUID/URL or a YouTube ID is required");
  }
  if (duration_min != null && (Number.isNaN(duration_min) || duration_min < 0)) {
    throw new Error("duration_min must be a positive number");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("shows")
    .insert({
      title,
      lineup,
      description,
      bunny_video_id,
      youtube_id: youtubeInput,
      duration_min,
      uploaded_at: new Date().toISOString(),
      tracklist_status: "missing",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const id = (data as { id: string } | null)?.id;
  revalidatePath("/shows");
  revalidatePath("/admin/shows");
  if (id) redirect(`/shows/${id}`);
  redirect("/admin/shows");
}
