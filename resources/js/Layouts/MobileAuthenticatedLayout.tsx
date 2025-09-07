import React, { useState, useEffect } from 'react';
import {
    Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Container,
    IconButton, Menu, MenuItem, useTheme, useMediaQuery, Select
} from '@mui/material';
import { AppRegistration, History, Inventory, Menu as MenuIcon } from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import { useLanguage } from '@/context/LanguageContext';

type Language = "en" | "th" | "lao" | "myanmar";
interface MobileAuthenticatedLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function MobileAuthenticatedLayout({
    children,
    title = "PUMPKIN CORPORATION COMPANY LIMITED"
}: MobileAuthenticatedLayoutProps) {

    const { t, setLanguage, language } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { url } = usePage();

    // ✅ แก้ไขการเปรียบเทียب URL ให้ถูกต้อง
    const getSelectedIndex = () => {
        // เปรียบเทียบกับ URL path แทนที่จะเป็น route name
        if (url.includes('/warranty/form') || url === route('warranty.form')) return 0;
        if (url.includes('/warranty/history') || url === route('warranty.history')) return 1;
        if (url.includes('/profile') || url === route('profile.edit')) return 2;
        return 0; // default
    };

    const [value, setValue] = useState(getSelectedIndex());
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // ✅ useEffect จะทำงานทุกครั้งที่ url เปลี่ยน
    useEffect(() => {
        const newIndex = getSelectedIndex();
        setValue(newIndex);
        console.log('Current URL:', url, 'Selected Index:', newIndex); // สำหรับ debug
    }, [url]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => setAnchorEl(null);
    
    const handleChangeLang = (value: string) => setLanguage(value as Language);

    const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue); // ตั้งค่าทันทีเพื่อให้ UI responsive
        
        switch (newValue) {
            case 0:
                router.get(route('warranty.form'));
                break;
            case 1:
                router.get(route('warranty.history'));
                break;
            case 2:
                router.get(route('profile.edit'));
                break;
            default:
                break;
        }
    };

    const handleLogout = () => {
        router.post(route('logout'));
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Navbar */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#F54927' }}>
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" onClick={handleMenu} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}>
                        {title}
                    </Typography>
                    <Select
                        value={language}
                        onChange={(e) => handleChangeLang(e.target.value)}
                        size="small"
                        variant="outlined"
                        sx={{
                            color: "white",
                            "&::before": { borderBottomColor: "white" },
                            "& .MuiSvgIcon-root": { color: "white" },
                            minWidth: 100,
                            ml: 1,
                        }}
                    >
                        <MenuItem value={'en'}>English</MenuItem>
                        <MenuItem value={'th'}>ไทย</MenuItem>
                        <MenuItem value={'lao'}>ລາວ</MenuItem>
                        <MenuItem value={'myanmar'}>မြန်မာ</MenuItem>
                    </Select>
                </Toolbar>
            </AppBar>

            {/* Menu Dropdown */}
            <Menu
                id="menu-appbar" anchorEl={anchorEl} keepMounted
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right', }}
                open={Boolean(anchorEl)} onClose={handleClose} sx={{ mt: '45px' }}
            >
                <MenuItem onClick={handleClose}>
                    <Typography>ข้อมูลส่วนตัว</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <Typography>ออกจากระบบ</Typography>
                </MenuItem>
            </Menu>

            {/* Content */}
            <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}>
                {children}
            </Container>

            {/* Bottom Navigation */}
            <BottomNavigation
                value={value}
                onChange={handleBottomNavChange}
                sx={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    backgroundColor: '#f5f5f5',
                    borderTop: '1px solid #e0e0e0',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <BottomNavigationAction icon={<AppRegistration />} sx={{ '&.Mui-selected': { color: '#F54927' } }} />
                <BottomNavigationAction icon={<History />} sx={{ '&.Mui-selected': { color: '#F54927' } }} />
                <BottomNavigationAction icon={<Inventory />} sx={{ '&.Mui-selected': { color: '#F54927' } }} />
            </BottomNavigation>
        </Box>
    );
}