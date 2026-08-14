import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  server: { allowedHosts: ['localhost', 'ajktux', 'ajktux.local'] },
});
