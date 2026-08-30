import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import appCss from "../styles.css?url";

const APP_NAME = "ColorChord - Living Spectrum";
const APP_DESC =
  "A color is a chord. Circle of Fifths mapped to the spectrum. Live resonance, journeys of light, a pocket color organ.";
const SITE_URL = "https://play-colorchord.jonbailey.xyz";
const OG_IMAGE = `${SITE_URL}/og.jpg?v=2.1.0`;

function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const ready = () => {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          // Always register latest SW; drop stale workers from earlier broken builds
          return navigator.serviceWorker.register("/sw.js").then((reg) => {
            reg.update().catch(() => {});
            return regs;
          });
        })
        .catch(() => {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        });
    };
    if (document.readyState === "complete") ready();
    else window.addEventListener("load", ready, { once: true });
  }, []);
  return null;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { title: APP_NAME },
      { name: "description", content: APP_DESC },
      { name: "theme-color", content: "#070709" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { property: "og:title", content: APP_NAME },
      { property: "og:description", content: APP_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:site_name", content: "ColorChord" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "ColorChord dual harmonic wheel" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@suddenlyjon" },
      { name: "twitter:creator", content: "@suddenlyjon" },
      { name: "twitter:title", content: APP_NAME },
      { name: "twitter:description", content: APP_DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "icon", href: "/icon-192.png", type: "image/png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <CreatedWithGrokBanner />
        <AuthProvider>
          <PwaRegister />
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
