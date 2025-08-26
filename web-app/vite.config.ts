import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), "");
  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
      outDir: "build",
    },
    define: {
      "process.env": env,
    },
  };
});
