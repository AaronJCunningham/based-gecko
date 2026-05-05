"use client";

import BrainPageComponent from "@/components/brainPage/BrainPageComponent";

interface PageParams {
  params: {
    brainid: string;
  };
}

export default function BrainPage({ params }: PageParams) {
  return <BrainPageComponent params={params} />;
}
