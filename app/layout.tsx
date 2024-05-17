import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

import { siteTitle, slogan } from "@/lib/constants";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: siteTitle,
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
        <h1 className="flex items-center justify-center gap-2 font-semibold text-center text-2xl bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-200 from-neutral-950 to-neutral-800 bg-clip-text text-transparent select-none">
          <Logo size={32} />
          <span className="bg-gradient-to-b dark:from-neutral-50 dark:to-neutral-700/90 from-neutral-950 to-neutral-800 bg-clip-text">
            {siteTitle}
          </span>
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
            <A href="https://openai.com/">OpenAI GPT-4o</A>
          </p>
          <p>
            <A href="https://github.com/xiaoluoboding/img2txt2audio">Source</A>{" "}
            /{" "}
            <A href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fxiaoluoboding%2Fimg2txt2voice&env=OPENAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&demo-title=img2txt2audio&demo-description=Image%20to%20text%20to%20audio%2C%20accurate%2C%20fast.&demo-url=https%3A%2F%2Fimg2txt2audio.vercel.app%2F&demo-image=https%3A%2F%2Fimg2txt2audio.vercel.app%2Fopengraph-image.png&skippable-integrations=1">
              Deploy
            </A>
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
