"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Uppy, { type UppyFile } from "@uppy/core";
import GoldenRetriever from "@uppy/golden-retriever";
import {
  ImageIcon,
  Loader2,
  RotateCcw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  signUploadParts,
  type CompletedUploadPart,
  type UploadPurpose,
} from "@/app/(admin)/dashboard/uploads/actions";
import { imageMaxBytes, imageMaxMegabytes } from "@/lib/upload-limits";
import { RetryingHtmlImage } from "@/components/RetryingImage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type UploadMeta = { purpose?: UploadPurpose };
type UploadBody = { url?: string };
type SignedPart = { partNumber: number; url: string };
type SavedUpload = {
  uploadId: string;
  key: string;
  url: string;
  partSize: number;
  completedParts: CompletedUploadPart[];
  resumeKey: string;
};

export default function ResumableImageUpload({
  id,
  name,
  label,
  purpose,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  onUploadingChange,
  onRemove,
  removeDisabled = false,
  shape = "rectangle",
  multiple = false,
  maxFiles = 1,
  requireRemoveBeforeReplace = false,
}: {
  id: string;
  name: string;
  label: string;
  purpose: UploadPurpose;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onUploadingChange?: (uploading: boolean) => void;
  onRemove?: () => Promise<boolean>;
  removeDisabled?: boolean;
  shape?: "rectangle" | "circle";
  multiple?: boolean;
  maxFiles?: number;
  requireRemoveBeforeReplace?: boolean;
}) {
  const maxFileSize = imageMaxBytes(purpose);
  const maxFileSizeMb = imageMaxMegabytes(purpose);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removing, startRemoval] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const uppyRef = useRef<Uppy<UploadMeta, UploadBody> | null>(null);
  const activeUploadRef = useRef<SavedUpload | null>(null);
  const cancelledRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const onUploadingChangeRef = useRef(onUploadingChange);
  const labelRef = useRef(label);
  const maxFilesRef = useRef(maxFiles);
  const [localPreview, setLocalPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [hasResumableUpload, setHasResumableUpload] = useState(false);
  const displayedImage = localPreview || value;

  useEffect(() => {
    onChangeRef.current = onChange;
    onUploadingChangeRef.current = onUploadingChange;
    labelRef.current = label;
    maxFilesRef.current = maxFiles;
  }, [label, maxFiles, onChange, onUploadingChange]);

  const fingerprint = (file: Blob & { name?: string; lastModified?: number }) =>
    `${file.name ?? "image"}:${file.size}:${file.lastModified ?? 0}:${file.type}`;
  const storageKey = (file: Blob & { name?: string; lastModified?: number }) =>
    `r2-multipart:${purpose}:${fingerprint(file)}`;

  function readSavedUpload(key: string): SavedUpload | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const session = JSON.parse(raw) as SavedUpload;
      if (!session.uploadId || !session.key || !session.partSize) return null;
      return {
        ...session,
        resumeKey: key,
        completedParts: session.completedParts ?? [],
      };
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  async function uploadPart(
    url: string,
    blob: Blob,
    onProgress: (loaded: number) => void,
  ) {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("PUT", url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded);
      };
      xhr.onload = () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag");
          if (etag) resolve(etag);
          else
            reject(
              new Error(
                "R2 tidak mengembalikan ETag. Pastikan ETag diekspos pada CORS bucket.",
              ),
            );
        } else reject(new Error(`Upload gagal dengan status ${xhr.status}.`));
      };
      xhr.onerror = () =>
        reject(
          new Error(
            navigator.onLine
              ? "Browser gagal mengakses Cloudflare R2. Periksa CORS bucket untuk origin aplikasi dan pastikan header ETag diekspos."
              : "Koneksi internet terputus. Upload akan dilanjutkan saat online.",
          ),
        );
      xhr.onabort = () => reject(new Error("Upload dijeda."));
      xhr.send(blob);
    });
  }

  async function uploadWithUppy(
    uppy: Uppy<UploadMeta, UploadBody>,
    fileID: string,
  ) {
    const file = uppy.getFile(fileID);
    const data = file.data;
    if (!(data instanceof Blob))
      throw new Error("Pilih ulang file untuk melanjutkan upload.");

    cancelledRef.current = false;
    setUploading(true);
    setUploadError("");
    onUploadingChangeRef.current?.(true);
    const key = storageKey(data);
    let session = readSavedUpload(key);
    let signedParts: SignedPart[] = [];

    try {
      if (!session) {
        const result = await createMultipartUpload({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size ?? data.size,
          purpose,
        });
        if (!result.data) throw new Error(result.error);
        session = { ...result.data, completedParts: [], resumeKey: key };
        signedParts = result.data.parts;
        localStorage.setItem(key, JSON.stringify(session));
      }
      activeUploadRef.current = session;
      setHasResumableUpload(true);

      const completed = new Map(
        session.completedParts.map((part) => [part.partNumber, part.etag]),
      );
      const partCount = Math.ceil(data.size / session.partSize);
      const pendingNumbers = Array.from(
        { length: partCount },
        (_, index) => index + 1,
      ).filter((partNumber) => !completed.has(partNumber));
      if (signedParts.length === 0 && pendingNumbers.length > 0) {
        const signed = await signUploadParts({
          uploadId: session.uploadId,
          key: session.key,
          partNumbers: pendingNumbers,
        });
        if (!signed.data) throw new Error(signed.error);
        signedParts = signed.data.parts;
      }

      for (const part of signedParts.filter(
        (item) => !completed.has(item.partNumber),
      )) {
        const start = (part.partNumber - 1) * session.partSize;
        const end = Math.min(start + session.partSize, data.size);
        const completedBytes = Array.from(completed.keys()).reduce(
          (total, number) => {
            const partStart = (number - 1) * session!.partSize;
            return total + Math.min(session!.partSize, data.size - partStart);
          },
          0,
        );
        const etag = await uploadPart(
          part.url,
          data.slice(start, end),
          (loaded) => {
            uppy.emit("upload-progress", uppy.getFile(fileID), {
              uploadStarted: Date.now(),
              bytesUploaded: completedBytes + loaded,
              bytesTotal: data.size,
            });
          },
        );
        completed.set(part.partNumber, etag);
        session.completedParts = Array.from(
          completed,
          ([partNumber, savedEtag]) => ({ partNumber, etag: savedEtag }),
        );
        localStorage.setItem(key, JSON.stringify(session));
      }

      const result = await completeMultipartUpload({
        uploadId: session.uploadId,
        key: session.key,
        parts: session.completedParts,
      });
      if (!result.data) throw new Error(result.error);
      localStorage.removeItem(key);
      activeUploadRef.current = null;
      setProgress(100);
      uppy.emit("upload-success", uppy.getFile(fileID), {
        status: 200,
        uploadURL: result.data.url,
        bytesUploaded: data.size,
        body: { url: result.data.url },
      });
    } catch (failure) {
      if (cancelledRef.current) return;
      const uploadFailure =
        failure instanceof Error ? failure : new Error("Upload gagal.");
      uppy.emit("upload-error", uppy.getFile(fileID), uploadFailure);
      toast.add({
        title: navigator.onLine ? "Upload belum selesai" : "Koneksi terputus",
        description: `${uploadFailure.message} Progres telah disimpan dan akan dilanjutkan setelah koneksi kembali.`,
        type: "error",
        timeout: 7000,
      });
      throw uploadFailure;
    } finally {
      xhrRef.current = null;
    }
  }

  useEffect(() => {
    const uppy = new Uppy<UploadMeta, UploadBody>({
      id: `r2-${purpose}-${id}`,
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: multiple ? 10 : 1,
        maxFileSize,
        allowedFileTypes: ALLOWED_TYPES,
      },
    }).use(GoldenRetriever, { expires: 24 * 60 * 60 * 1000 });

    const uploadFiles = async (fileIDs: string[]) => {
      setUploading(true);
      onUploadingChangeRef.current?.(true);
      try {
        for (const fileID of fileIDs) await uploadWithUppy(uppy, fileID);
      } finally {
        setUploading(false);
        onUploadingChangeRef.current?.(false);
      }
    };
    uppy.addUploader(uploadFiles);
    uppyRef.current = uppy;

    const updateProgress = (
      _file: UppyFile<UploadMeta, UploadBody> | undefined,
      state: { bytesUploaded: number; bytesTotal: number | null },
    ) => {
      if (state.bytesTotal)
        setProgress(Math.round((state.bytesUploaded / state.bytesTotal) * 100));
    };
    const handleSuccess = (
      _file: UppyFile<UploadMeta, UploadBody> | undefined,
      response: { body?: UploadBody },
    ) => {
      if (response.body?.url) {
        onChangeRef.current(response.body.url);
        setLocalPreview("");
        if (purpose === "profile") {
          window.dispatchEvent(
            new CustomEvent("profile-image-updated", {
              detail: response.body.url,
            }),
          );
        }
      }
      setHasResumableUpload(false);
      toast.add({
        title: "Upload selesai",
        description: `${labelRef.current} berhasil diunggah.`,
        type: "success",
        timeout: 5000,
      });
    };
    const handleError = (
      _file: UppyFile<UploadMeta, UploadBody> | undefined,
      uploadFailure: { message: string },
    ) => {
      if (cancelledRef.current) return;
      setHasResumableUpload(true);
      setUploadError(uploadFailure.message || "Upload gagal.");
    };
    const resumeWhenOnline = () => {
      if (uppy.getFiles().some((file) => file.error) && !cancelledRef.current)
        void uppy.retryAll();
    };
    const resumeRestoredUpload = () => {
      const restored = uppy
        .getFiles()
        .find((file) => !file.isGhost && file.data instanceof Blob);
      if (!restored || !navigator.onLine) return;
      setUploading(true);
      setHasResumableUpload(true);
      onUploadingChangeRef.current?.(true);
      void uppy.retryAll();
    };

    uppy.on("upload-progress", updateProgress);
    uppy.on("upload-success", handleSuccess);
    uppy.on("upload-error", handleError);
    uppy.on("restored", resumeRestoredUpload);
    window.addEventListener("online", resumeWhenOnline);

    return () => {
      window.removeEventListener("online", resumeWhenOnline);
      uppy.removeUploader(uploadFiles);
      uppy.destroy();
      uppyRef.current = null;
    };
    // The uploader identity must stay stable while a multipart session is active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, maxFileSize, multiple, purpose]);
  async function selectFiles(selectedFiles: File[]) {
    const uppy = uppyRef.current;
    if (!uppy) return;
    cancelledRef.current = false;
    setUploadError("");
    setProgress(0);
    const availableSlots = multiple ? Math.max(0, maxFilesRef.current) : 1;
    const files = selectedFiles.slice(0, availableSlots);
    if (selectedFiles.length > availableSlots) {
      toast.add({
        title: "Sebagian file tidak ditambahkan",
        description: `Galeri hanya memiliki ${availableSlots} slot tersisa.`,
        type: "error",
        timeout: 6000,
      });
    }
    const unsupportedFiles = files.filter(
      (file) => !ALLOWED_TYPES.includes(file.type),
    );
    const supportedFiles = files.filter((file) =>
      ALLOWED_TYPES.includes(file.type),
    );
    const oversizedFiles = supportedFiles.filter(
      (file) => file.size > maxFileSize,
    );
    const validFiles = supportedFiles.filter(
      (file) => file.size <= maxFileSize,
    );
    if (unsupportedFiles.length > 0) {
      toast.add({
        title: "Format file tidak didukung",
        description: `${unsupportedFiles.length} file dilewati. Gunakan JPG, PNG, atau WEBP.`,
        type: "error",
        timeout: 6000,
      });
    }
    if (oversizedFiles.length > 0) {
      const message = `${label} maksimal ${maxFileSizeMb} MB.`;
      setUploadError(message);
      setHasResumableUpload(false);
      toast.add({
        title: "Ukuran file terlalu besar",
        description: `${oversizedFiles.length} file dilewati. ${message}`,
        type: "error",
        timeout: 6000,
      });
    }
    if (validFiles.length === 0) return;
    try {
      uppy.clear();
      for (const file of validFiles) {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
          source: "file-input",
          meta: { purpose },
        });
      }
      if (!multiple) setLocalPreview(URL.createObjectURL(validFiles[0]));
      await uppy.upload();
    } catch (failure) {
      const message =
        failure instanceof Error
          ? failure.message
          : "File tidak dapat diunggah.";
      setUploadError(message);
    }
  }

  async function cancelUpload() {
    cancelledRef.current = true;
    xhrRef.current?.abort();
    const session = activeUploadRef.current;
    if (session) {
      await abortMultipartUpload({
        uploadId: session.uploadId,
        key: session.key,
      });
      localStorage.removeItem(session.resumeKey);
    }
    activeUploadRef.current = null;
    uppyRef.current?.cancelAll();
    setHasResumableUpload(false);
    setUploading(false);
    setProgress(0);
    setUploadError("");
    onUploadingChangeRef.current?.(false);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <button
        type="button"
        onClick={() => {
          if (displayedImage && requireRemoveBeforeReplace) return;
          inputRef.current?.click();
        }}
        aria-disabled={Boolean(displayedImage && requireRemoveBeforeReplace)}
        disabled={disabled || uploading || removing}
        className={`group relative flex overflow-hidden border-2 border-dashed border-foreground/20 bg-muted/30 text-left transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-70 dark:border-foreground-dark/20 dark:bg-muted-dark/30 ${
          shape === "circle"
            ? "mx-auto aspect-square w-48 max-w-full rounded-full md:mx-0"
            : "min-h-48 w-full rounded-2xl"
        } ${displayedImage && requireRemoveBeforeReplace ? "cursor-default" : ""}`}
      >
        {displayedImage ? (
          <RetryingHtmlImage
            key={displayedImage}
            src={displayedImage}
            alt={`Pratinjau ${label}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="m-auto flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
            <span className="text-sm font-medium">
              {multiple ? "Pilih Beberapa Gambar" : "Pilih Gambar"}
            </span>
            <span className="text-xs">
              JPG, PNG, atau WEBP · maksimum {maxFileSizeMb} MB
            </span>
          </span>
        )}
        {displayedImage && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 px-4 text-center text-sm font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {requireRemoveBeforeReplace ? (
              <>
                <Trash2 className="mr-2 h-5 w-5" /> Hapus gambar melalui
                tombol di bawah untuk menggantinya
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-5 w-5" /> Ganti gambar
              </>
            )}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={
          disabled ||
          uploading ||
          removing ||
          Boolean(displayedImage && requireRemoveBeforeReplace)
        }
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) void selectFiles(files);
          event.currentTarget.value = "";
        }}
      />

      {uploading && (
        <div className="space-y-2 rounded-xl border border-foreground/10 p-3 dark:border-foreground-dark/10">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengunggah...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-muted-dark">
            <div
              className="h-full rounded-full bg-primary transition-[width] dark:bg-primary-dark"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelUpload}
            className="rounded-lg"
          >
            <X /> Batalkan upload
          </Button>
        </div>
      )}
      {uploadError && !uploading && (
        <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <p>
            {uploadError}{" "}
            {hasResumableUpload &&
              "Pilih file yang sama atau sambungkan kembali internet untuk melanjutkan."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-background/70 dark:bg-background-dark/70"
            >
              <RotateCcw /> Lanjutkan
            </Button>
            {hasResumableUpload && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelUpload}
                className="rounded-lg"
              >
                <X /> Mulai ulang
              </Button>
            )}
          </div>
        </div>
      )}
      {onRemove && value && (
        <AlertDialog
          open={removeDialogOpen}
          onOpenChange={(open) => {
            if (!removing) setRemoveDialogOpen(open);
          }}
        >
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  disabled ||
                  uploading ||
                  removing ||
                  removeDisabled ||
                  hasResumableUpload
                }
                className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10"
              />
            }
          >
            <Trash2 className="h-4 w-4" /> Hapus {label.toLowerCase()}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus {label.toLowerCase()}?</AlertDialogTitle>
              <AlertDialogDescription>
                Gambar ini akan dihapus secara permanen. Anda dapat mengunggah
                gambar baru setelahnya.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removing}>Batal</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={removing || removeDisabled}
                onClick={() =>
                  startRemoval(async () => {
                    const removed = await onRemove();
                    if (removed) {
                      setLocalPreview("");
                      setUploadError("");
                      setProgress(0);
                      uppyRef.current?.clear();
                      if (purpose === "profile") {
                        window.dispatchEvent(
                          new CustomEvent("profile-image-updated", {
                            detail: "",
                          }),
                        );
                      }
                      setRemoveDialogOpen(false);
                    }
                  })
                }
              >
                {removing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {removing ? "Menghapus..." : "Hapus gambar"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
