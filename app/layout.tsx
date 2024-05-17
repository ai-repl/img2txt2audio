import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { slogan } from "@/lib/constants";

export const metadata: Metadata = {
  title: "img2txt2audio",
  description: slogan,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-mono bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white px-3 lg:px-10 py-4 lg:py-10 min-h-dvh flex flex-col`}
      >
        <h1 className="font-semibold text-center text-2xl bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-200 from-neutral-950 to-neutral-800 bg-clip-text text-transparent select-none">
          img2txt2audio
        </h1>

        <main className="grow flex flex-col lg:flex-row gap-6 py-4 lg:py-10">
          {children}
        </main>

        <footer className="lg:flex flex-row justify-between text-center text-sm dark:text-neutral-400 text-neutral-600 select-none">
          <p>
            <A href="https://x.com/robert_shaw_x">
              Follow me on X / Robert Shaw
            </A>
          </p>
          <p>
            Built with <A href="https://sdk.vercel.ai">Vercel AI SDK</A> &{" "}
            <A href="https://openai.com/">OpenAI</A>
          </p>
          <p>
            <A href="https://github.com/xiaoluoboding/img2txt2audio">source</A>{" "}
            / <A href="#">deploy</A>
          </p>
        </footer>

        <Toaster richColors theme="system" position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}

function A(props: any) {
  return (
    <a {...props} className="text-black dark:text-white hover:underline" />
  );
}
