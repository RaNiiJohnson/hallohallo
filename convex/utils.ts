import type { api } from "./_generated/api";
import { useAction, useMutation } from "convex/react";

export async function uploadDirectToCloudinary(
  file: File,
  getCredentials: ReturnType<
    typeof useAction<typeof api.cloudinary.generateUploadCredentials>
  >,
  finalizeUploadMutation: ReturnType<
    typeof useMutation<typeof api.cloudinary.finalizeUpload>
  >,
  onProgress?: (percent: number) => void,
) {
  // Step 1 : récupérer les credentials signés depuis Convex
  const credentials = await getCredentials({
    folder: "real_estates",
    tags: ["real_estate"],
  });

  // Step 2 : upload direct vers Cloudinary avec FormData
  const formData = new FormData();
  formData.append("file", file);

  // La doc montre Object.entries(credentials.uploadParams)
  // mais ne donne pas les types exacts, donc on filtre sur string.
  Object.entries(credentials.uploadParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      formData.append(key, value);
    }
  });

  // Utiliser XMLHttpRequest pour suivre la progression (comme dans la doc)
  const response = await new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", credentials.uploadUrl);

    // Suivi de progression (optionnel)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => resolve(new Response(xhr.responseText));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'upload direct Cloudinary");
  }

  const result = await response.json();

  if (result.error) {
    console.error("Cloudinary error:", result.error.message);
    throw new Error(result.error.message);
  }

  // Step 3 : stocker les métadonnées dans Convex
  await finalizeUploadMutation({
    publicId: result.public_id,
    uploadResult: result,
  });

  // On renvoie ce dont ton code a besoin
  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
  };
}
