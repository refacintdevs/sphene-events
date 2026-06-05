// Client-side Cloudinary upload utility.
// Must only be imported from "use client" components (browser context required).
//
// Orphaned uploads (user uploads a file then abandons the form) are an accepted MVP
// limitation. Cleanup would require a signed server-side delete call; deferred.

export type UploadedFile = {
  publicId: string;
  url: string;
  fileName: string;
};

type UploadOptions = {
  preset: string;
  onProgress?: (pct: number) => void;
};

type CloudinaryErrorBody = { error?: { message?: string } };
type CloudinarySuccessBody = { public_id: string; secure_url: string };

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

/**
 * Uploads a single File to Cloudinary using an unsigned preset.
 * Throws on validation failure, network error, or Cloudinary rejection.
 *
 * A 401 response means the preset is not configured in Cloudinary — the error
 * message names the preset so the developer can fix it (not swallowed).
 */
export async function uploadToCloudinary(
  file: File,
  { preset, onProgress }: UploadOptions,
): Promise<UploadedFile> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`"${file.name}" is too large — maximum file size is 5 MB.`);
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);

  // XHR is used (not fetch) to get upload progress events.
  return new Promise<UploadedFile>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as CloudinarySuccessBody;
        resolve({ publicId: data.public_id, url: data.secure_url, fileName: file.name });
        return;
      }
      if (xhr.status === 401) {
        reject(
          new Error(
            `Upload rejected — preset "${preset}" is not authorised in Cloudinary. ` +
              `Check your Cloudinary dashboard (unsigned preset must exist and be active).`,
          ),
        );
        return;
      }
      let msg = `Upload failed (HTTP ${xhr.status})`;
      try {
        const err = JSON.parse(xhr.responseText) as CloudinaryErrorBody;
        if (err.error?.message) msg = err.error.message;
      } catch {
        // ignore JSON parse error — use the generic message above
      }
      reject(new Error(msg));
    };

    xhr.onerror = () =>
      reject(new Error("Network error during upload. Please check your connection and try again."));

    xhr.send(body);
  });
}
