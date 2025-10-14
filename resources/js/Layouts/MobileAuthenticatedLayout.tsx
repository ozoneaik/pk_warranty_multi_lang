// import React, { useState, useEffect } from 'react';
// import {
//     Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Container,
//     IconButton, Menu, MenuItem, useTheme, useMediaQuery, Select,
//     alpha
// } from '@mui/material';
// import { AccountCircle, AppRegistration, Assignment, History, Home, Inventory, Menu as MenuIcon, SupervisedUserCircle } from '@mui/icons-material';
// import { router, usePage } from '@inertiajs/react';
// import { useLanguage } from '@/context/LanguageContext';

// type Language = "en" | "th" | "lao" | "myanmar";
// interface MobileAuthenticatedLayoutProps {
//     children: React.ReactNode;
//     title?: string;
// }

// export default function MobileAuthenticatedLayout({
//     children,
//     title = ""
// }: MobileAuthenticatedLayoutProps) {


//     const { t, setLanguage, language } = useLanguage();
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//     const { url } = usePage();

//     // ✅ แก้ไขการเปรียบเทียب URL ให้ถูกต้อง
//     const getSelectedIndex = () => {
//         // เปรียบเทียบกับ URL path แทนที่จะเป็น route name
//         if (url.includes('/warranty/home') || url === route('warranty.form')) return 0;
//         if (url.includes('/warranty/form') || url === route('warranty.form')) return 1;
//         if (url.includes('/warranty/history') || url === route('warranty.history')) return 2;
//         // if (url.includes('/profile') || url === route('profile.edit')) return 3;
//         // if (url.includes('/customer-profile') || url === route('customer.profile.edit')) return 3;
//         if (
//             url.includes('/customer-profile') ||
//             url === route('customer.profile.welcome')
//         ) return 3;
//         return 0; // default
//     };

//     const [value, setValue] = useState(getSelectedIndex());
//     const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

//     // ✅ useEffect จะทำงานทุกครั้งที่ url เปลี่ยน
//     useEffect(() => {
//         const newIndex = getSelectedIndex();
//         setValue(newIndex);
//         console.log('Current URL:', url, 'Selected Index:', newIndex); // สำหรับ debug
//     }, [url]);

//     const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
//         setAnchorEl(event.currentTarget);
//     };

//     const handleClose = () => setAnchorEl(null);

//     const handleChangeLang = (value: string) => setLanguage(value as Language);

//     const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
//         setValue(newValue); // ตั้งค่าทันทีเพื่อให้ UI responsive

//         switch (newValue) {
//             case 0:
//                 router.get(route('warranty.home'));
//                 break;
//             case 1:
//                 router.get(route('warranty.form'));
//                 break;
//             case 2:
//                 router.get(route('warranty.history'));
//                 break;
//             // case 3:
//             //     router.get(route('profile.edit'));
//             //     break;
//             // case 3:
//             //     router.get(route('customer.profile.edit'));
//             //     break;
//             case 3:
//                 router.get(route('customer.profile.welcome'));
//                 break;
//             default:
//                 break;
//         }
//     };

//     const handleLogout = () => {
//         router.post(route('logout'));
//     }

//     const isWarrantyHome = url.startsWith(route("warranty.home", undefined, false));

//     // current route = http://localhost:8000/warranty/home

//     const navStyle = {
//         color: "rgba(255,255,255,0.8)",
//         minWidth: "auto",
//         flexDirection: "column", 
//         gap: "1px",
//         "& .MuiSvgIcon-root": {
//             fontSize: "1.8rem",
//         },
//         "& .MuiBottomNavigationAction-label": {
//             fontSize: "0.7rem",
//             fontWeight: 500,
//             textTransform: "none",
//             marginTop: "2px !important", 
//         },
//         "&.Mui-selected": {
//             color: "white",
//         },
//     };

//     return (
//         <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
//             {/* Navbar */}
//             <AppBar position="fixed"
//                 sx={{
//                     zIndex: (theme) => theme.zIndex.drawer + 1,
//                     backgroundColor: !isWarrantyHome ? "#F54927" : "transparent",
//                     // backgroundColor: 'rgba(245, 73, 39, 0.9)', 
//                     backdropFilter: 'blur(6px)',
//                     boxShadow: 'none',
//                 }}
//             >
//                 <Toolbar>
//                     <IconButton size="large" edge="start" color="inherit" onClick={handleMenu} sx={{ mr: 2 }}>
//                         <MenuIcon />
//                     </IconButton>
//                     <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: isMobile ? '1rem' : '1.25rem' }}>
//                         {title}
//                     </Typography>
//                     <Select
//                         value={language}
//                         onChange={(e) => handleChangeLang(e.target.value)}
//                         size="small"
//                         variant="outlined"
//                         sx={{
//                             color: "white",
//                             "&::before": { borderBottomColor: "white" },
//                             "& .MuiSvgIcon-root": { color: "white" },
//                             minWidth: 100,
//                             ml: 1,
//                         }}
//                     >
//                         <MenuItem value={'en'}>English</MenuItem>
//                         <MenuItem value={'th'}>ไทย</MenuItem>
//                         <MenuItem value={'lao'}>ລາວ</MenuItem>
//                         <MenuItem value={'myanmar'}>မြန်မာ</MenuItem>
//                     </Select>
//                 </Toolbar>
//             </AppBar>

//             {/* Menu Dropdown */}
//             <Menu
//                 id="menu-appbar" anchorEl={anchorEl} keepMounted
//                 anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//                 transformOrigin={{ vertical: 'top', horizontal: 'right', }}
//                 open={Boolean(anchorEl)} onClose={handleClose} sx={{ mt: '45px' }}
//             >
//                 {/* <MenuItem onClick={handleClose}>
//                     <Typography>{t.homePage.manageProfile}</Typography>
//                 </MenuItem> */}
//                 <MenuItem
//                     onClick={() => {
//                         handleClose(); // ปิดเมนู
//                         router.get(route("customer.profile.welcome"));
//                     }}
//                 >
//                     <Typography>{t.homePage.manageProfile}</Typography>
//                 </MenuItem>
//                 <MenuItem onClick={handleLogout}>
//                     <Typography>{t.homePage.logout}</Typography>
//                 </MenuItem>
//             </Menu>

//             {/* Content */}
//             {/* <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}> */}
//             {children}
//             {/* </Container> */}

//             {/* Bottom Navigation */}
//             <BottomNavigation
//                 showLabels
//                 value={value}
//                 onChange={handleBottomNavChange}
//                 sx={{
//                     position: 'fixed', bottom: 0, left: 0, right: 0,
//                     // backgroundColor: '#f5f5f5',
//                     backgroundColor: '#F54927',
//                     // borderTop: '1px solid gray',
//                     // borderRight: '1px solid gray',
//                     // borderLeft: '1px solid gray',
//                     // boxShadow : '4',
//                     borderTopLeftRadius: '25px',
//                     borderTopRightRadius: '25px',
//                     zIndex: (theme) => theme.zIndex.drawer + 1,
//                 }}
//             >
//                 {/* <BottomNavigationAction icon={<Home />} sx={{ '&.Mui-selected': { color: '#F54927' } }} />
//                 <BottomNavigationAction icon={<Assignment />} sx={{ '&.Mui-selected': { color: '#F54927' } }} />
//                 <BottomNavigationAction icon={<History />} sx={{ '&.Mui-selected': { color: '#F54927' } }} />
//                 <BottomNavigationAction icon={<AccountCircle />} sx={{ '&.Mui-selected': { color: '#F54927' } }} /> */}
//                 <BottomNavigationAction 
//                 // label={t.homePage.title} 
//                 icon={<Home />} sx={navStyle} />
//                 <BottomNavigationAction 
//                 // label={t.homePage.from} 
//                 icon={<Assignment />} sx={navStyle} />
//                 <BottomNavigationAction 
//                 // label={t.homePage.history} 
//                 icon={<History />} sx={navStyle} />
//                 {/* <BottomNavigationAction label="ผู้ใช้งาน" icon={<AccountCircle />} sx={{ '&.Mui-selected': { color: 'white' } }} /> */}
//                 <BottomNavigationAction 
//                 // label={t.homePage.manageProfile} 
//                 icon={<SupervisedUserCircle />} sx={navStyle} />
//             </BottomNavigation>
//         </Box>
//     );
// }

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

    const handleBottomNavChange = (e: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        switch (newValue) {
            case 0: router.get(route('warranty.home')); break;
            case 1: router.get(route('warranty.form')); break;
            case 2: router.get(route('warranty.history')); break;
            case 3: router.get(route('customer.profile.welcome')); break;
        }
    };

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
        // outer center page
        <Box
            sx={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 2,
                // background: optional
            }}
        >
            {/* phone-like frame */}
            <Box
                sx={{
                    width: 500,
                    height: '100vh',
                    bgcolor: '#fff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: 0,
                }}
            >
                {/* Header - stays fixed (flexShrink:0) */}
                <AppBar
                    position="static" // use static inside flex container
                    sx={{
                        backgroundColor: '#F54927',
                        boxShadow: 'none',
                        flexShrink: 0,
                    }}
                >
                    <Toolbar sx={{ minHeight: 56 }}>
                        <IconButton edge="start" color="inherit" onClick={handleMenu} sx={{ mr: 1 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1, fontSize: '1rem', fontWeight: 600 }}
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
                                "& .MuiSvgIcon-root": { color: "white" },
                                minWidth: 80,
                                fontSize: "0.8rem",
                                borderColor: "rgba(255,255,255,0.3)",
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

                {/* Dropdown Menu */}
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

                {/* Main content: flex:1 and scrollable only this area */}
                <Box
                    sx={{
                        flex: '1 1 auto',
                        px: 2,
                        py: 1,
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    {children}
                </Box>

                {/* Footer / Bottom Navigation - stays fixed (flexShrink:0) */}
                <Box sx={{ flexShrink: 0 }}>
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={handleBottomNavChange}
                        sx={{
                            backgroundColor: '#F54927',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                        }}
                    >
                        <BottomNavigationAction icon={<Home />} sx={navStyle} />
                        <BottomNavigationAction icon={<Assignment />} sx={navStyle} />
                        <BottomNavigationAction icon={<History />} sx={navStyle} />
                        <BottomNavigationAction icon={<SupervisedUserCircle />} sx={navStyle} />
                    </BottomNavigation>
                </Box>
            </Box>
        </Box>
    );
}
