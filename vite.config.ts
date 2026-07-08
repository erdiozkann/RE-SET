import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";
import { vitePrerenderPlugin } from "vite-prerender-plugin";
import dotenv from "dotenv";

// Make .env values available to the prerender script (which runs in Node at build time)
dotenv.config();

// SPA routing için "/" kullanılmalı (Hostinger kök dizin ise)
const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;
// https://vite.dev/config/
export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
    __READDY_PROJECT_ID__: JSON.stringify(process.env.PROJECT_ID || ""),
    __READDY_VERSION_ID__: JSON.stringify(process.env.VERSION_ID || ""),
  },
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          react: [
            "React",
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
      ],
      dts: true,
    }),
    vitePrerenderPlugin({
      renderTarget: "#root",
      additionalPrerenderRoutes: [
        "/",
        "/about",
        "/demartini-yontemi",
        "/primordial-ses-meditasyonu",
        "/demartini-seansi",
        "/deger-belirleme",
        "/breakthrough-experience",
        "/blog",
        "/podcast",
        "/youtube",
        "/booking",
        "/contact",
        "/privacy",
        "/kvkk",
        "/copyright",
        "/cookies",
      ],
    }),
  ],
  base,
  build: {
    sourcemap: isPreview || process.env.NODE_ENV !== "production",
    outDir: "HOSTINGER_UPLOAD",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-dom") || id.includes("/react/")) return "vendor-react";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("dompurify")) return "vendor-sanitize";
          // marked (~140KB) yalnız prerender (build) + lazy blog/cms'te gerekli.
          // Kendi chunk'ında olmazsa React'in scheduler'ıyla aynı `vendor` catch-all'a
          // düşüp home kritik yoluna modulepreload ediliyordu. Ayrı chunk → home'a girmez.
          if (id.includes("/marked/") || id.includes("node_modules/marked")) return "vendor-marked";
          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
