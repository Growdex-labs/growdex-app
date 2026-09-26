import type { MetadataRoute } from "next";
import { APP_TITLE } from "@/lib/site-metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_TITLE,
    short_name: APP_TITLE,
    description:
      "Create, launch, manage, and optimize Meta and TikTok campaigns from one intelligent platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
