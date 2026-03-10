import Image from "next/image";
import type { DJRow } from "@/lib/supabase";

interface DJCardProps {
  dj: DJRow;
}

export function DJCard({ dj }: DJCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-nr1-grey overflow-hidden group hover:border-nr1-cyan/30 transition-colors">
      <div className="relative h-64 bg-nr1-black">
        {dj.photo_url ? (
          <Image
            src={dj.photo_url}
            alt={dj.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-nr1-cyan font-heading text-6xl opacity-20">
              {dj.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {dj.is_resident && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-nr1-crimson/80 text-white">
              Resident
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-xl font-heading text-white tracking-wide">{dj.name}</h3>
        {dj.bio && (
          <p className="text-sm text-white/60 line-clamp-3">{dj.bio}</p>
        )}

        {dj.socials && (
          <div className="flex gap-3 pt-1">
            {dj.socials.soundcloud && (
              <a
                href={dj.socials.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SoundCloud"
                className="text-nr1-muted hover:text-nr1-cyan transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.175 12.225c-.077 0-.148.03-.203.08-.056.05-.08.12-.077.198l.28 2.709-.28 2.668c-.003.078.02.148.077.199.054.05.126.078.203.078.077 0 .149-.028.203-.078.056-.05.08-.12.077-.199l-.28-2.668.28-2.709c.003-.077-.02-.148-.077-.198-.054-.05-.126-.08-.203-.08zm1.737-.87c-.09 0-.174.034-.236.097-.063.062-.097.147-.097.237l-.258 3.483.258 3.39c0 .09.034.174.097.236.062.063.147.097.236.097.09 0 .174-.034.236-.097.063-.062.097-.147.097-.236l.285-3.39L3.246 11.7c0-.09-.034-.174-.097-.237-.062-.063-.147-.097-.236-.097z"/>
                </svg>
              </a>
            )}
            {dj.socials.instagram && (
              <a
                href={dj.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-nr1-muted hover:text-nr1-cyan transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {dj.socials.mixcloud && (
              <a
                href={dj.socials.mixcloud}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mixcloud"
                className="text-nr1-muted hover:text-nr1-cyan transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.56 8.87V17h4.33v-1.5h-2.77V8.87zm-3.89 0V17h1.56V8.87zm-1.56 0H4.56V17h1.55v-2.69h1.56v-1.5H6.11v-2.44h2.55V8.87zm15.24 3.38A3.38 3.38 0 0 0 18 8.87h-.29V10.5h.29a1.75 1.75 0 1 1 0 3.5H18V15h.53l1.34 2h1.88l-1.53-2.22a3.36 3.36 0 0 0 1.13-2.53zM18 17v-1.5h-.29v-5.13H18V8.87a3.38 3.38 0 0 0 0 8.13z"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
