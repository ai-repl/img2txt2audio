import { toast } from "sonner";

export function copy(content: string) {
  navigator.clipboard.writeText(content || "");
  toast.success("Copied to clipboard");
}
