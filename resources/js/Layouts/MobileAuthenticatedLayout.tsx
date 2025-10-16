import React, { useState, useEffect } from 'react';
import {
    Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction,
    IconButton, Menu, MenuItem, Select
} from '@mui/material';
import {
    Home, Assignment, History, SupervisedUserCircle, Menu as MenuIcon
} from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import { useLanguage } from '@/context/LanguageContext';
import PumpkinLogo from '../assets/logo/PumpkinLogo.png';
import * as MuiIcons from '@mui/icons-material';
import FooterCarousel from '@/Components/FooterCarousel';

type Language = "en" | "th" | "lao" | "myanmar";

interface MobileAuthenticatedLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function MobileAuthenticatedLayout({
    children,
    title = ""
}: MobileAuthenticatedLayoutProps) {

    const { t, setLanguage, language } = useLanguage();
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const isWarrantyHome = url.includes('/warranty/home');

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setScrolled(scrollTop > 5);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getSelectedIndex = () => {
        if (url.includes('/warranty/home')) return 0;
        if (url.includes('/warranty/form')) return 1;
        if (url.includes('/warranty/history')) return 2;
        if (url.includes('/customer-profile')) return 3;
        return 0;
    };

    const [value, setValue] = useState(getSelectedIndex());
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => setValue(getSelectedIndex()), [url]);

    const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLogout = () => router.post(route('logout'));
    const handleChangeLang = (value: string) => setLanguage(value as Language);

    const navStyle = {
        color: "rgba(255,255,255,0.9)",
        minWidth: "auto",
        flexDirection: "column",
        gap: "1px",
        "& .MuiSvgIcon-root": { fontSize: "1.6rem" },
        "& .MuiBottomNavigationAction-label": {
            fontSize: "0.72rem",
            fontWeight: 500,
            marginTop: "2px !important",
        },
        "&.Mui-selected": { color: "white" },
    };

    return (
        // <Box
        //     sx={{
        //         display: 'flex',
        //         justifyContent: 'center',
        //         alignItems: 'center',
        //         minHeight: '100vh',
        //         backgroundColor: '#f5f5f5',
        //     }}
        // >
        //     {/* ✅ กรอบจำลองจอมือถือ */}
        //     <Box
        //         sx={{
        //             position: 'relative',
        //             width: '100%',
        //             maxWidth: 500,
        //             height: '100vh',
        //             backgroundColor: '#fff',
        //             boxShadow: {
        //                 xs: 'none',
        //                 md: '0 0 20px rgba(0,0,0,0.15)',
        //             },
        //             display: 'flex',
        //             flexDirection: 'column',
        //             overflow: 'hidden',
        //             borderRadius: { xs: 0, md: '25px' },
        //         }}
        //     >
        //         {/* ✅ Navbar */}
        //         <AppBar
        //             position="fixed"
        //             sx={{
        //                 top: 0,
        //                 backgroundColor: 'transparent',
        //                 boxShadow: 'none',
        //                 zIndex: (theme) => theme.zIndex.drawer + 1,
        //                 backdropFilter: 'blur(0px)',
        //                 width: '100%',
        //                 maxWidth: 500,
        //                 left: '50%',
        //                 transform: 'translateX(-50%)',
        //             }}
        //         >
        //             <Toolbar>
        //                 <Box
        //                     component="img"
        //                     src={PumpkinLogo}
        //                     alt="Pumpkin Logo"
        //                     sx={{
        //                         height: 35,
        //                         mr: 1.5,
        //                         ml: -1,
        //                     }}
        //                     onClick={() => router.get('/warranty/home')}
        //                 />

        //                 <IconButton edge="start" onClick={handleMenu} sx={{ mr: -0.5, color: '#000' }}>
        //                     <MenuIcon />
        //                 </IconButton>
        //                 <Typography
        //                     variant="h6"
        //                     sx={{
        //                         flexGrow: 1,
        //                         fontWeight: 600,
        //                         fontSize: '1rem',
        //                         color: '#000',
        //                     }}
        //                 >
        //                     {title}
        //                 </Typography>
        //                 <Select
        //                     value={language}
        //                     onChange={(e) => handleChangeLang(e.target.value)}
        //                     size="small"
        //                     variant="outlined"
        //                     sx={{
        //                         color: '#000',
        //                         '& .MuiSvgIcon-root': { color: '#000' },
        //                         minWidth: 80,
        //                         border: 'none',
        //                         '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        //                     }}
        //                 >
        //                     <MenuItem value={'en'}>EN</MenuItem>
        //                     <MenuItem value={'th'}>ไทย</MenuItem>
        //                     <MenuItem value={'lao'}>ລາວ</MenuItem>
        //                     <MenuItem value={'myanmar'}>မြန်မာ</MenuItem>
        //                 </Select>
        //             </Toolbar>
        //         </AppBar>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
            }}
        >
            {/* ✅ กรอบจำลองจอมือถือ */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 500,
                    height: '100vh',
                    backgroundColor: '#fff',
                    boxShadow: {
                        xs: 'none',
                        md: '0 0 20px rgba(0,0,0,0.15)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: { xs: 0, md: '25px' },
                }}
            >
                {/* ✅ Navbar */}
                <AppBar
                    position="fixed"
                    sx={{
                        top: 0,
                        backgroundColor: isWarrantyHome ? 'transparent' : '#F54927',
                        boxShadow: 'none',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backdropFilter: 'blur(0px)',
                        width: '100%',
                        maxWidth: 500,
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    <Toolbar>
                        <Box
                            component="img"
                            src={PumpkinLogo}
                            alt="Pumpkin Logo"
                            sx={{
                                height: 35,
                                mr: 1.5,
                                ml: -1,
                            }}
                            onClick={() => router.get('/warranty/home')}
                        />

                        <IconButton
                            edge="start"
                            onClick={handleMenu}
                            sx={{
                                mr: -0.5,
                                color: isWarrantyHome ? '#000' : '#fff'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            sx={{
                                flexGrow: 1,
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: isWarrantyHome ? '#000' : '#fff',
                            }}
                        >
                            {title}
                        </Typography>
                        <Select
                            value={language}
                            onChange={(e) => handleChangeLang(e.target.value)}
                            size="small"
                            variant="outlined"
                            sx={{
                                color: isWarrantyHome ? '#000' : '#fff',
                                '& .MuiSvgIcon-root': { color: isWarrantyHome ? '#000' : '#fff' },
                                minWidth: 80,
                                border: 'none',
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            }}
                        >
                            <MenuItem value={'en'}>EN</MenuItem>
                            <MenuItem value={'th'}>ไทย</MenuItem>
                            <MenuItem value={'lao'}>ລາວ</MenuItem>
                            <MenuItem value={'myanmar'}>မြန်မာ</MenuItem>
                        </Select>
                    </Toolbar>
                </AppBar>

                {/* ✅ Dropdown Menu */}
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    keepMounted
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    sx={{ mt: '45px' }}
                >
                    <MenuItem
                        onClick={() => {
                            handleClose();
                            router.get(route("customer.profile.welcome"));
                        }}
                    >
                        <Typography>{t.homePage.manageProfile}</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        <Typography>{t.homePage.logout}</Typography>
                    </MenuItem>
                </Menu>
                <Box
                    sx={{
                        flexGrow: 1,
                        mt: '64px',
                        mb: '65px',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        px: 2,
                        py: 1,
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {children}
                </Box>
                <FooterCarousel />
            </Box>
        </Box>
    );
}
