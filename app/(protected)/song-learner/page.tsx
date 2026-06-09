"use client";

import { useState, type FormEvent } from "react";
import { AppButton, getButtonClassName } from "@/app/components/ui/app-button";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { apiPost } from "@/lib/client/api-client";
import type { SongLearnerRequest, SongLearnerResponse } from "@/lib/client/types";

function ResultLink({
  href,
  isFallback,
  label,
}: {
  href: string;
  isFallback: boolean;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-[#171326]">{label}</p>
          <p className="mt-1 max-w-full break-all text-xs leading-5 text-slate-500">{href}</p>
          {isFallback ? (
            <p className="mt-2 text-xs font-medium text-amber-700">Google search fallback</p>
          ) : null}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`${getButtonClassName({
            variant: isFallback ? "secondary" : "primary",
          })} w-fit shrink-0 whitespace-nowrap sm:w-[7.25rem]`}
        >
          Open link
        </a>
      </div>
    </div>
  );
}

export default function SongLearnerPage() {
  const [artist, setArtist] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SongLearnerResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [title, setTitle] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    if (!cleanTitle || searching) {
      setError("Song title is required.");
      return;
    }

    const payload: SongLearnerRequest = {
      title: cleanTitle,
      ...(cleanArtist ? { artist: cleanArtist } : {}),
    };

    setError(null);
    setSearching(true);

    const response = await apiPost<SongLearnerResponse>("/api/song-learner", payload);
    setSearching(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    setResult(response.data);
  }

  return (
    <PageShell width="7xl" className="page-section-reveal space-y-8">
      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <section className="space-y-5">
          <PageHeading
            title="Song Learner"
            description="Find the first close tab match and a listening link, then break the song into practice-sized pieces."
          />

          <SurfaceCard>
            <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
              <FormField label="Song title" helperText="Use the title as it appears on streaming platforms.">
                <input
                  className={fieldControlClassName}
                  disabled={searching}
                  maxLength={160}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="How Much Is Weed"
                  value={title}
                />
              </FormField>

              <FormField label="Artist" helperText="Optional, but it usually improves the first match.">
                <input
                  className={fieldControlClassName}
                  disabled={searching}
                  maxLength={160}
                  onChange={(event) => setArtist(event.target.value)}
                  placeholder="Dominic Fike"
                  value={artist}
                />
              </FormField>

              {error ? <InlineStatus message={error} variant="error" /> : null}
              {searching ? <InlineStatus message="Finding first matches..." variant="muted" /> : null}

              <AppButton type="submit" disabled={searching} fullWidth>
                {searching ? "Searching..." : "Find song links"}
              </AppButton>
            </form>
          </SurfaceCard>
        </section>

        <section className="space-y-5">
          <SurfaceCard className="space-y-5">
            <div>
              <p className="text-sm font-semibold tracking-tight text-[#171326]">Matched links</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Song Learner uses Google results through SerpApi and chooses the closest matching music domains.
              </p>
            </div>

            {result ? (
              <div className="space-y-3">
                <ResultLink
                  href={result.ultimateGuitarUrl}
                  isFallback={result.ultimateGuitarIsFallback}
                  label="Ultimate Guitar"
                />
                <ResultLink href={result.youtubeUrl} isFallback={result.youtubeIsFallback} label="YouTube" />
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
                <p className="text-sm font-semibold tracking-tight text-[#171326]">No song searched yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Enter a song and artist to get the first tab-style result and a listening link.
                </p>
              </div>
            )}
          </SurfaceCard>

          <SurfaceCard className="space-y-3">
            <p className="text-sm font-semibold tracking-tight text-[#171326]">How to learn any song</p>
            <p className="text-sm leading-6 text-slate-600">
              {result?.learningGuide ??
                "Start by listening to the song a few times and marking the main sections. Learn the easiest recognizable part first, slow it down, and loop short phrases until your timing feels steady. Add the next section only when the current one feels comfortable, then practice the transitions and finish by playing along with the original track."}
            </p>
          </SurfaceCard>
        </section>
      </div>
    </PageShell>
  );
}
