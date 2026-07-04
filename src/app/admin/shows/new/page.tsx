import Link from "next/link";
import { createShowAction } from "./actions";

export const dynamic = "force-dynamic";

export default function NewShowPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/shows" className="text-xs font-mono text-nr1-muted hover:text-nr1-cyan">
          ← all shows
        </Link>
        <h1 className="font-heading text-3xl text-nr1-cyan tracking-widest mt-2">NEW SHOW</h1>
        <p className="text-sm text-nr1-muted mt-1">
          Upload the video to Bunny.net Stream first, then paste the video GUID or embed URL below.
        </p>
      </div>

      <form action={createShowAction} className="space-y-5">
        <Field label="Title" name="title" required placeholder="NR1 LIVE — FRIDAY SESSION 04" />

        <Field label="Lineup" name="lineup" placeholder="DJ TUFF KUTS, MC CONTAGIOUS" />

        <div>
          <label htmlFor="bunny_video" className="block text-xs uppercase tracking-widest text-nr1-muted mb-2">
            Bunny video (GUID or embed URL)
          </label>
          <input
            id="bunny_video"
            name="bunny_video"
            type="text"
            spellCheck={false}
            placeholder="abc12345-6789-0abc-def0-1234567890ab   or   https://iframe.mediadelivery.net/embed/…/…"
            className="w-full bg-nr1-black border border-nr1-cyan/20 rounded p-3 font-mono text-sm text-white focus:border-nr1-cyan focus:outline-none"
          />
          <p className="text-[10px] font-mono text-nr1-muted mt-1">
            The GUID is auto-extracted from any Bunny URL. Leave blank if using legacy YouTube instead.
          </p>
        </div>

        <Field
          label="YouTube ID (legacy, optional)"
          name="youtube_id"
          placeholder="dQw4w9WgXcQ"
        />

        <Field
          label="Duration (minutes)"
          name="duration_min"
          type="number"
          inputMode="numeric"
          placeholder="60"
        />

        <div>
          <label htmlFor="description" className="block text-xs uppercase tracking-widest text-nr1-muted mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            spellCheck={false}
            placeholder="Short paragraph shown on the detail page and used for social share previews."
            className="w-full bg-nr1-black border border-nr1-cyan/20 rounded p-3 text-sm text-white focus:border-nr1-cyan focus:outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-nr1-cyan text-nr1-black font-heading tracking-widest px-6 py-2 rounded hover:bg-nr1-cyan/90"
          >
            CREATE
          </button>
          <Link
            href="/admin/shows"
            className="border border-nr1-cyan/30 text-nr1-cyan font-heading tracking-widest px-6 py-2 rounded hover:bg-nr1-cyan/10"
          >
            CANCEL
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs uppercase tracking-widest text-nr1-muted mb-2">
        {label}
        {required && <span className="text-nr1-crimson"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full bg-nr1-black border border-nr1-cyan/20 rounded p-3 font-mono text-sm text-white focus:border-nr1-cyan focus:outline-none"
      />
    </div>
  );
}
