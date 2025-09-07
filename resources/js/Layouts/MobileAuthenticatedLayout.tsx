import React, { useState } from 'react';
import {
    Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Container,
    IconButton, Menu, MenuItem, useTheme, useMediaQuery, Select
} from '@mui/material';
import { AppRegistration, History, Inventory, Menu as MenuIcon } from '@mui/icons-material';
import { router } from '@inertiajs/react';
import { useLanguage } from '@/context/LanguageContext';

interface MobileAuthenticatedLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function MobileAuthenticatedLayout({
    children,
    title = "PUMPKIN CORPORATION COMPANY LIMITED"
}: MobileAuthenticatedLayoutProps) {

    const { t, setLanguage, language } = useLanguage();

    // State สำหรับ bottom navigation
    const [value, setValue] = useState(0);

    // State สำหรับ menu dropdown ใน navbar
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));   

    // ฟังก์ชันสำหรับเปิด/ปิด menu
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeLang = (value: string) => setLanguage(value as Language);


    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลง bottom navigation
    const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        // ที่นี่คุณสามารถเพิ่มการ navigate ไปยังหน้าต่างๆ ได้
        switch (newValue) {
            case 0:
                console.log('ไปยังหน้าลงทะเบียนรับประกัน');
                break;
            case 1:
                console.log('ไปยังหน้าประวัติการลงทะเบียน');
                break;
            case 2:
                console.log('ไปยังหน้าข้อมูลส่วนตัว');
                break;
            case 3:
                console.log('ไปยังหน้าสินค้าที่รับประกัน');
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
            {/* Navbar ด้านบน */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: '#F54927',
                }}
            >
                <Toolbar>
                    {/* ปุ่ม Menu ทางซ้าย */}
                    <IconButton
                        size="large" edge="start" color="inherit"
                        aria-label="menu" onClick={handleMenu} sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* หัวข้อหลัก */}
                    <Typography
                        variant="h6" component="div"
                        sx={{
                            flexGrow: 1,
                            fontSize: isMobile ? '1rem' : '1.25rem'
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
                            color: "white",
                            "&::before": { borderBottomColor: "white" }, // เปลี่ยนเส้นเป็นสีขาว
                            "& .MuiSvgIcon-root": { color: "white" },
                            minWidth: 100,
                            ml: 1,
                        }}
                    >
                        <MenuItem value={'en'}>
                            English
                        </MenuItem>
                        <MenuItem value={'th'}>
                            ไทย
                        </MenuItem>
                        <MenuItem value={'lao'}>
                            ລາວ
                        </MenuItem>
                        <MenuItem value={'myanmar'}>
                            မြန်မာ
                        </MenuItem>
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

            {/* Content Area */}
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
                <BottomNavigationAction
                    // label="ลงทะเบียนรับประกัน"
                    icon={<AppRegistration />}
                    sx={{
                        '&.Mui-selected': { color: '#F54927' },
                        fontSize: '0.75rem'
                    }}
                />
                <BottomNavigationAction
                    // label="ประวัติการลงทะเบียน"
                    icon={<History />}
                    sx={{
                        '&.Mui-selected': { color: '#F54927' },
                        fontSize: '0.75rem'
                    }}
                />
                <BottomNavigationAction
                    // label="สินค้าที่รับประกัน"
                    icon={<Inventory />}
                    sx={{
                        '&.Mui-selected': { color: '#F54927' },
                        fontSize: '0.75rem'
                    }}
                />
            </BottomNavigation>
        </Box>
    );
}