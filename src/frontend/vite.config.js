import { defineConfig } from "vite";
import license from 'rollup-plugin-license';
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), viteSingleFile()],
	build: {
		target: "esnext",
		cssCodeSplit: false,
		assetsInlineLimit: 100000000,
		rollupOptions: {
         plugins: [
           license({
             thirdParty: {
               // Creates licenses.txt in dist folder
               output: path.resolve(__dirname, './dist/licenses.txt'),
             },
           }),
		 ],
	   },
	},
	resolve: {
		alias: {
			"@bookmarks": path.resolve(__dirname, "src/bookmarks"),
			"@auth": path.resolve(__dirname, "src/auth"),
			"@objects": path.resolve(__dirname, "src/objects"),
			"@styles": path.resolve(__dirname, "src/styles"),

			"@api": path.resolve(__dirname, "src/api"),
			"@components": path.resolve(__dirname, "src/components"),
			"@forms": path.resolve(__dirname, "src/components/forms"),
			"@tables": path.resolve(__dirname, "src/components/tables"),
			"@dialogs": path.resolve(__dirname, "src/components/dialogs"),
			"@columns": path.resolve(__dirname, "src/components/columns"),
			"@atoms": path.resolve(__dirname, "src/components/atoms"),
			"@main": path.resolve(__dirname, "src"),
			"@backend": path.resolve(__dirname, "backend"),
			"@models": path.resolve(__dirname, "backend/models"),
			"@routes": path.resolve(__dirname, "backend/routes"),
			"@mappers": path.resolve(__dirname, "src/mappers"),
			"@config": path.resolve(__dirname, "src/config"),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:5119", // port for backend from launchSettings
				changeOrigin: true,
				secure: false, // backend is not HTTPS
			},
		},
	},
});
