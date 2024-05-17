"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconCopy, IconLoader2 } from "@tabler/icons-react";
import { useCompletion } from "ai/react";
import { toast } from "sonner";
import Image from "next/image";
import { track } from "@vercel/analytics";

import { slogan } from "@/lib/constants";
import { copy, isSupportedImageType, toBase64 } from "@/lib";

export default function Home() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [blobURL, setBlobURL] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [isLoadingTTS, setLoadingTTS] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [audioSrc, setVoiceSrc] = useState("");

  const { complete, completion, isLoading } = useCompletion({
    onError: (e) => {
      toast.error(e.message);
      setBlobURL(null);
    },
    onFinish: (prompt: string, completion: string) => {
      const [_, description, text] = completion.split("▲");
      handleGenerateVoice(description);
      setFinished(true);
    },
  });

  const handleGenerateVoice = async (text: string) => {
    const params = JSON.stringify({
      prompt: text,
      audio: "nova",
      model: "tts-1-hd",
    });
    const res = await fetch("/api/tts", {
      method: "POST",
      body: params,
    });
    const blobData = await res.blob();

    const objectUrl = URL.createObjectURL(blobData);
    setVoiceSrc(objectUrl);
    // Auto play the audio
    const audio = new Audio(objectUrl);
    audio.play();
    setLoadingTTS(false);
  };

  async function submit(file?: File | Blob) {
    if (!file) return;

    if (!isSupportedImageType(file.type)) {
      return toast.error(
        "Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported."
      );
    }

    if (file.size > 4.5 * 1024 * 1024) {
      return toast.error("Image too large, maximum file size is 4.5MB.");
    }

    const base64 = await toBase64(file);

    // roughly 4.5MB in base64
    if (base64.length > 6_464_471) {
      return toast.error("Image too large, maximum file size is 4.5MB.");
    }

    setBlobURL(URL.createObjectURL(file));
    setVoiceSrc("");
    setLoadingTTS(true);
    setFinished(false);
    complete(base64);
  }

  function handleDragLeave() {
    setIsDraggingOver(false);
  }

  function handleDragOver(e: DragEvent) {
    setIsDraggingOver(true);
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }

  async function handleDrop(e: DragEvent) {
    track("Drop");

    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer?.files?.[0];
    submit(file);
  }

  useEffect(() => {
    addEventListener("paste", handlePaste);
    addEventListener("drop", handleDrop);
    addEventListener("dragover", handleDragOver);
    addEventListener("dragleave", handleDragLeave);

    return () => {
      removeEventListener("paste", handlePaste);
      removeEventListener("drop", handleDrop);
      removeEventListener("dragover", handleDragOver);
      removeEventListener("dragleave", handleDragLeave);
    };
  });

  async function handlePaste(e: ClipboardEvent) {
    track("Paste");
    const file = e.clipboardData?.files?.[0];
    submit(file);
  }

  async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    track("Upload");
    const file = e.target.files?.[0];
    submit(file);
  }

  const [_, description, text] = completion.split("▲");

  function copyBoth() {
    navigator.clipboard.writeText(
      [description.trim(), text.trim()].join("\n\n")
    );
    toast.success("Copied to clipboard");
  }

  return (
    <>
      <div
        className={clsx(
          "rounded-lg border-4 drop-shadow-sm text-neutral-700 dark:text-neutral-300 cursor-pointer border-dashed transition-colors ease-in-out bg-neutral-100 dark:bg-neutral-900 relative group select-none grow pointer-events-none [@media(hover:hover)]:pointer-events-auto",
          {
            "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700":
              !isDraggingOver,
            "border-blue-300 dark:border-blue-700": isDraggingOver,
          }
        )}
        onClick={() => inputRef.current?.click()}
      >
        {blobURL && (
          <Image
            src={blobURL}
            unoptimized
            fill
            className="lg:object-contain object-cover min-h-16"
            alt="Uploaded image"
          />
        )}

        <div
          className={clsx(
            "flex flex-col w-full h-full p-3 items-center justify-center text-center absolute bg-neutral-100/70 dark:bg-neutral-900/70 text-lg",
            {
              "opacity-0 group-hover:opacity-100 transition ease-in-out":
                completion,
            }
          )}
        >
          {isLoading ? (
            <IconLoader2 className="animate-spin size-12" />
          ) : (
            <>
              <p className="font-bold mb-4">{slogan}</p>
              <p className="hidden [@media(hover:hover)]:block">
                Drop or paste anywhere, or click to upload.
              </p>

              <div className="w-56 space-y-4 [@media(hover:hover)]:hidden pointer-events-auto">
                <button className="rounded-full w-full py-3 bg-black dark:bg-white text-white dark:text-black">
                  Tap to upload
                </button>

                <input
                  type="text"
                  onKeyDown={(e) => e.preventDefault()}
                  placeholder="Hold to paste"
                  onClick={(e) => e.stopPropagation()}
                  className="text-center w-full rounded-full py-3 bg-neutral-200 dark:bg-neutral-800 placeholder-black dark:placeholder-white focus:bg-white dark:focus:bg-black focus:placeholder-neutral-700 dark:focus:placeholder-neutral-300 transition-colors ease-in-out focus:outline-none border-2 focus:border-blue-300 dark:focus:border-blue-700 border-transparent"
                />
              </div>

              <p className="text-sm mt-3 text-neutral-700 dark:text-neutral-300">
                (images are not stored)
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleInputChange}
          accept="image/jpeg, image/png, image/gif, image/webp"
        />
      </div>

      {(isLoading || completion) && (
        <div className="space-y-3 basis-1/2 p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 w-full drop-shadow-sm">
          <Section finished={finished} content={description}>
            Description
          </Section>
          <div>
            <h2 className="font-semibold select-none text-neutral-600 dark:text-neutral-400 mb-2">
              Audio
            </h2>
            {isLoadingTTS && audioSrc === "" ? (
              <>
                <div className="bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded w-full h-[54px]" />
              </>
            ) : (
              <>
                <audio controls src={audioSrc} />
              </>
            )}
          </div>
          <Section finished={finished} content={text}>
            Text
          </Section>
          {finished && text && (
            <button
              onClick={copyBoth}
              className="w-full lg:w-auto rounded-md underline hover:no-underline hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center gap-2"
            >
              <IconCopy className="size-4" /> Copy All
            </button>
          )}
        </div>
      )}
    </>
  );
}

function Section({
  children,
  content,
  finished,
}: {
  children: string;
  content?: string;
  finished: boolean;
}) {
  const loading = !content && !finished;

  return (
    <div>
      {content && (
        <button
          className="float-right rounded-md p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ease-in-out"
          onClick={(e) => {
            e.preventDefault();
            copy(content);
          }}
          aria-label="Copy to clipboard"
        >
          <IconCopy />
        </button>
      )}
      <h2 className="font-semibold select-none text-neutral-600 dark:text-neutral-400 mb-2">
        {children}
      </h2>

      {loading && (
        <div className="bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded w-full h-6" />
      )}
      {content && (
        <p className="whitespace-pre-wrap break-words">{content.trim()}</p>
      )}
      {finished && !content && (
        <p className="text-neutral-600 dark:text-neutral-400 select-none">
          No text was found in that image.
        </p>
      )}
    </div>
  );
}
