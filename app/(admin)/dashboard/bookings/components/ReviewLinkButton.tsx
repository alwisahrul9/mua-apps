"use client";

import { useState } from "react";
import { Copy, Loader2, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createReviewLink } from "../actions";

export default function ReviewLinkButton({ bookingId }: { bookingId: string }) {
  const [pending, setPending] = useState(false);
  const [url, setUrl] = useState("");

  async function generate() {
    setPending(true);
    const result = await createReviewLink(bookingId);
    setPending(false);
    if (result.error || !result.data?.url) {
      toast.add({
        title: "Tautan gagal dibuat",
        description: result.error,
        type: "error",
      });
      return;
    }
    setUrl(result.data.url);
    await navigator.clipboard
      ?.writeText(result.data.url)
      .catch(() => undefined);
    toast.add({
      title: "Tautan ulasan siap",
      description: "Tautan telah disalin dan dapat dikirim kepada klien.",
      type: "success",
    });
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    toast.add({ title: "Tautan disalin", type: "success" });
  }

  const whatsappUrl = url
    ? `https://wa.me/?text=${encodeURIComponent(`Terima kasih telah menggunakan layanan kami. Bagikan pengalaman Anda melalui tautan berikut: ${url}`)}`
    : "";

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row">
      {!url ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl"
          disabled={pending}
          onClick={generate}
        >
          {pending ? <Loader2 className="animate-spin" /> : <Star />}
          {pending ? "Membuat Tautan..." : "Buat Tautan Ulasan"}
        </Button>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={copy}
          >
            <Copy /> Salin Tautan
          </Button>
          <Button
            className="h-11 flex-1 rounded-xl bg-green-600 text-white hover:bg-green-700"
            render={<a href={whatsappUrl} target="_blank" rel="noreferrer" />}
          >
            <MessageCircle /> Kirim via WhatsApp
          </Button>
        </>
      )}
    </div>
  );
}
