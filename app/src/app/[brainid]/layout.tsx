// app/[brainid]/layout.tsx
import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: { brainid: string };
}): Promise<Metadata> {
  return {
    title:
      params.brainid === "BASEDAI"
        ? "BasedAI | BrainGecko"
        : params.brainid === "PEPECOIN"
        ? "PepeCoin | BrainGecko"
        : params.brainid === "BCRED"
        ? "BCRED | BrainGecko"
        : `Brain${params.brainid} | BrainGecko`,
    description:
      params.brainid === "BASEDAI"
        ? "Trade and track BasedAI on BrainGecko"
        : params.brainid === "PEPECOIN"
        ? "Trade and track PepeCoin on BrainGecko"
        : params.brainid === "BCRED"
        ? "Trade and track BCRED on BrainGecko"
        : `Trade and track Brain${params.brainid} on BrainGecko`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
