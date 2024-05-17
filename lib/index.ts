import { toast } from "sonner";

export function copy(content: string) {
  navigator.clipboard.writeText(content || "");
  toast.success("Copied to clipboard");
}

export function isSupportedImageType(
  type: string
): type is SupportedImageTypes {
  return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type);
}

export function toBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
  });
}
