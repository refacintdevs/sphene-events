"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary, type UploadedFile } from "@/lib/cloudinary-upload";

// ── Single-file upload ────────────────────────────────────────────────────────

interface FileUploadProps {
  label: string;
  required?: boolean;
  /** "image" = images only; "image-or-pdf" = images + PDF */
  accept: "image" | "image-or-pdf";
  preset: string;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  /** Called whenever an upload starts (true) or finishes/fails (false). */
  onUploadingChange?: (uploading: boolean) => void;
  error?: string;
  hint?: string;
}

export function FileUpload({
  label,
  required,
  accept,
  preset,
  value,
  onChange,
  onUploadingChange,
  error,
  hint,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const acceptAttr = accept === "image" ? "image/*" : "image/*,application/pdf";

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (accept === "image" && !file.type.startsWith("image/")) {
      setUploadError("Please upload an image file.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    onUploadingChange?.(true);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, {
        preset,
        onProgress: setProgress,
      });
      onChange(result);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const displayError = uploadError ?? error;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && (
          <span className="ml-1 text-primary" aria-hidden="true">
            *
          </span>
        )}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate text-foreground">{value.fileName}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setUploadError(null);
            }}
            className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Remove ${value.fileName}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/40",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            className="sr-only"
            onChange={handleChange}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Uploading… {progress}%</span>
            </>
          ) : (
            <>
              <Upload className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Click to upload</span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {accept === "image" ? "Images only" : "Images or PDF"} · Max 5 MB
              </span>
            </>
          )}
        </label>
      )}

      {displayError && <p className="text-sm text-destructive">{displayError}</p>}
    </div>
  );
}

// ── Multi-file upload (portfolio) ─────────────────────────────────────────────

interface MultiFileUploadProps {
  label: string;
  required?: boolean;
  min: number;
  max: number;
  preset: string;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** Called whenever an upload starts (true) or finishes/fails (false). */
  onUploadingChange?: (uploading: boolean) => void;
  error?: string;
}

export function MultiFileUpload({
  label,
  required,
  min,
  max,
  preset,
  value,
  onChange,
  onUploadingChange,
  error,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Portfolio items must be images.");
      return;
    }
    if (value.length >= max) {
      setUploadError(`You can upload at most ${max} images.`);
      return;
    }
    setUploadError(null);
    setUploading(true);
    onUploadingChange?.(true);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, { preset, onProgress: setProgress });
      onChange([...value, result]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const canAdd = value.length < max && !uploading;
  const displayError = uploadError ?? error;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && (
          <span className="ml-1 text-primary" aria-hidden="true">
            *
          </span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">
        {value.length} / {max} uploaded · minimum {min}
      </p>

      {/* Uploaded files */}
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((f, i) => (
            <li
              key={f.publicId}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate text-foreground">{f.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-2 shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${f.fileName}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload area (shown when below max) */}
      {canAdd && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-muted/40">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleChange}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="mb-1.5 h-5 w-5 animate-spin text-primary" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Uploading… {progress}%</span>
            </>
          ) : (
            <>
              <Upload className="mb-1.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">
                {value.length === 0 ? "Upload portfolio images" : "Add another image"}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                Images only · Max 5 MB each
              </span>
            </>
          )}
        </label>
      )}

      {displayError && <p className="text-sm text-destructive">{displayError}</p>}
    </div>
  );
}
