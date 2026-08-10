import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "icons/favicon.png",
        "icons/apple-touch-icon.png",
      ],

      manifest: {
        name: "Life_OS",
        short_name: "Life_OS",

        description:
          "Life_OS — personal life management and analytics system.",

        start_url: "/",
        scope: "/",

        display: "standalone",
        orientation: "portrait",

        theme_color: "#00AAFF",
        background_color: "#0D1B2A",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },

          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },

          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});