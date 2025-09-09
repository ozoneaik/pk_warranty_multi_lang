import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline, Backdrop, CircularProgress, Box, Typography } from '@mui/material';
import { theme } from './ThemeCustom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// สร้าง Custom Progress Component
function CustomProgress() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // ฟังการเริ่มต้น navigation
        const startHandler = () => setLoading(true);
        // ฟังการสิ้นสุด navigation
        const finishHandler = () => setLoading(false);

        const unsubscribeStart = router.on('start', startHandler);
        const unsubscribeFinish = router.on('finish', finishHandler);

        // Cleanup event listeners
        return () => {
            unsubscribeStart();
            unsubscribeFinish();
        };
    }, []);

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)'
            }}
            open={loading}
        >
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={3}
            >
                <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{
                        color: '#4B5563',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.9)',
                        textAlign: 'center'
                    }}
                >
                    กำลังโหลด...
                </Typography>
            </Box>
        </Backdrop>
    );
}

// Main App Wrapper ที่มี Progress
function AppWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CustomProgress />
            {children}
        </>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(
            <LanguageProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <AppWrapper>
                            <App {...props} />
                        </AppWrapper>
                    </ThemeProvider>
                </LocalizationProvider>
            </LanguageProvider>
        );
    },
    progress: false, // ปิด default progress bar
});