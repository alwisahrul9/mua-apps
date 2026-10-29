"use client";

import { useActionState, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendReview, type ReviewFormState } from "./actions";

export default function ReviewForm({
  token,
  username,
}: {
  token: string;
  username?: string;
}) {
  const [state, action, pending] = useActionState<
    ReviewFormState | undefined,
    FormData
  >(sendReview, undefined);
  const [selectedRating, setSelectedRating] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [consent, setConsent] = useState(false);

  if (state?.success)
    return (
      <div className="rounded-3xl mt-5 border border-green-500/20 bg-green-500/10 p-8 text-center">
        <Star className="mx-auto h-10 w-10 fill-amber-400 text-amber-400" />
        <h2 className="mt-4 font-serif text-2xl">Ulasan Berhasil Dikirim</h2>
        <p className="mt-2 text-muted-foreground">{state.success}</p>
      </div>
    );

  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="username" value={username ?? ""} />
      <fieldset>
        <legend className="font-medium">Rating</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={selectedRating === String(rating)}
                onChange={(event) => setSelectedRating(event.target.value)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center gap-1 rounded-full border border-foreground/15 px-4 peer-checked:border-amber-400 peer-checked:bg-amber-400/10">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {rating}
              </span>
            </label>
          ))}
        </div>
        {state?.errors?.rating?.[0] && (
          <p className="mt-2 text-sm text-destructive">
            {state.errors.rating[0]}
          </p>
        )}
      </fieldset>
      <div>
        <Label htmlFor="reviewText">Ulasan</Label>
        <textarea
          id="reviewText"
          name="reviewText"
          rows={6}
          maxLength={2000}
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          placeholder="Ceritakan pengalaman Anda menggunakan layanan MUA ini."
          aria-invalid={Boolean(state?.errors?.reviewText)}
          className="mt-2 w-full rounded-3xl border border-input bg-transparent px-4 py-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {state?.errors?.reviewText?.[0] && (
          <p className="mt-2 text-sm text-destructive">
            {state.errors.reviewText[0]}
          </p>
        )}
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-foreground/15 p-4">
          <input
            type="checkbox"
            name="consent"
            value="true"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-primary"
            aria-invalid={Boolean(state?.errors?.consent)}
          />
          <span className="text-sm leading-6 text-muted-foreground">
            Saya menyetujui ulasan, nama, rating, dan informasi layanan ini
            ditampilkan secara publik pada halaman MUA.
          </span>
        </label>
        {state?.errors?.consent?.[0] && (
          <p className="mt-2 text-sm text-destructive">
            {state.errors.consent[0]}
          </p>
        )}
      </div>
      {state?.error && (
        <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full"
      >
        {pending ? <Loader2 className="animate-spin" /> : <Star />}{" "}
        {pending ? "Mengirim..." : "Kirim Ulasan"}
      </Button>
    </form>
  );
}
