import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],
});

// export default defineConfig({
//     server: {
//         host: '0.0.0.0',
//         port: 5174,
//         strictPort: true,
//         cors: true,
//         hmr: {
//             host: '192.168.9.32',
//         },
//     },
//     plugins: [
//         laravel({
//             input: 'resources/js/app.tsx',
//             refresh: true,
//         }),
//         react(),
//     ],
// });
