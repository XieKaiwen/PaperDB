import { defineConfig } from 'vite'
// import { vitePlugin as remix } from "@remix-run/dev";
import react from '@vitejs/plugin-react'
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

})
