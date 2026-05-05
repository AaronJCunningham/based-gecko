// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import TrollBox from "@/components/brainPage/TrollBox";

export const metadata: Metadata = {
  title: "BrainGecko",
  description: "Trade and track BasedAI Brains on BrainGecko",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: "/img/braingecko.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainGecko",
    description: "Trade and track BasedAI Brains on BrainGecko",
    images: "/img/braingecko.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
      </head>
      <body className="antialiased">
        {children}
        <TrollBox />
      </body>
    </html>
  );
}
