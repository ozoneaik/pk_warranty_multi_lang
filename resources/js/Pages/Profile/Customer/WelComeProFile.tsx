import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Card, CardContent, Grid, Typography, Stack,
    Avatar, Paper, Container, useTheme, useMediaQuery,
    Button
} from "@mui/material";
import { Edit, Star, ArrowBack, ContentCopy } from "@mui/icons-material";
import { Head, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import backgroundHome from "@/assets/images/backgroundHome.jpg";
import { WorkspacePremium } from "@mui/icons-material";
import { useState } from "react";
import Swal from "sweetalert2";
import ProfileQrModal from "@/Pages/Warranty/ProfileQrModal";

export default function WelComeProFile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { auth, line_avatar, point, referral_code, referral_url } = usePage().props as any;
    const user = auth.user;
    const { t } = useLanguage();
    const [showProfileQr, setShowProfileQr] = useState(false);
    const myReferralCode = referral_code || "-";

    const handleShowScore = () => router.get(route("customer.profile.score"));

    const handleCopy = async () => {
        if (!myReferralCode) return;

        // ฟังก์ชันแสดง Alert
        const showSuccess = () => {
            Swal.fire({
                toast: true,
                position: 'center',
                icon: 'success',
                title: 'คัดลอกรหัสแนะนำแล้ว',
                showConfirmButton: false,
                timer: 1500
            });
        };

        // 1. ลองใช้วิธี Modern API (สำหรับ HTTPS / Localhost)
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(myReferralCode);
                showSuccess();
                return;
            } catch (err) {
                console.error('Clipboard API failed', err);
            }
        }

        // 2. วิธีสำรอง (Fallback) สำหรับ HTTP หรือ Browser เก่า
        try {
            const textArea = document.createElement("textarea");
            textArea.value = myReferralCode;

            // ซ่อน TextArea ไม่ให้ User เห็น
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                showSuccess();
            } else {
                console.error("Fallback copy failed.");
            }
        } catch (err) {
            console.error("Unable to copy", err);
        }
    };
    return (
        <MobileAuthenticatedLayout title={t.ProfileWelcome.title}>
            <Head title={t.Customer.title.mainTitle} />

            {/* ✅ ส่วนภาพด้านบน */}
            <Box sx={{ position: "relative" }}>
                <img
                    src={backgroundHome}
                    alt="Profile Banner"
                    style={{
                        width: "100%",
                        objectFit: "cover",
                        borderBottomRightRadius: "12px",
                        borderBottomLeftRadius: "12px",
                        objectPosition: "top",
                        maxHeight: "390px",
                        paddingTop: "16px",
                    }}
                />
                <Paper
                    elevation={4}
                    sx={{
                        position: "absolute",
                        bottom: -45,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "96%",
                        p: 2,
                        borderRadius: 3,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
                        <Avatar
                            src={line_avatar || "https://via.placeholder.com/150"}
                            onClick={() => setShowProfileQr(true)}
                            sx={{
                                width: isMobile ? 60 : 70,
                                height: isMobile ? 60 : 70,
                                border: "3px solid #fff",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                cursor: "pointer"
                            }}
                        />
                        <Box
                            sx={{
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <Typography fontWeight="bold">
                                {t.ProfileWelcome.hello}{" "}
                                <Box component="span" sx={{ color: "#F54927" }}>
                                    {user.name}
                                </Box>
                            </Typography>

                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    mt: 0.5,
                                    flexWrap: 'nowrap', // บังคับห้ามตัดบรรทัด
                                    overflow: 'hidden'  // ป้องกันส่วนเกินล้น
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#555',
                                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {isMobile ? t.ProfileWelcome.ShortreferralCode : t.ProfileWelcome.referralCode}
                                    &nbsp;
                                    <span style={{ fontWeight: 'bold', color: '#333' }}>
                                        {myReferralCode}
                                    </span>
                                </Typography>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    // ปรับขนาดไอคอนตามหน้าจอ
                                    // startIcon={<ContentCopy sx={{ fontSize: isMobile ? 10 : 12 }} />}
                                    onClick={handleCopy}
                                    sx={{
                                        borderRadius: 20,
                                        px: 1,
                                        py: 0,
                                        height: 24,
                                        minWidth: 'auto',
                                        // ปรับขนาดฟอนต์ปุ่มให้เล็กลงบนมือถือ
                                        fontSize: isMobile ? '0.65rem' : '0.70rem',
                                        borderColor: '#F54927',
                                        color: '#F54927',
                                        bgcolor: '#fff',
                                        textTransform: 'none',
                                        flexShrink: 0, // ❌ สำคัญ: ห้ามปุ่มหดตัวเมื่อพื้นที่น้อย
                                        whiteSpace: 'nowrap',
                                        '&:hover': { bgcolor: '#FFF3E0' }
                                    }}
                                >
                                    {t.copy}
                                </Button>
                            </Stack>
                            {/* จบส่วนแก้ไข */}

                            {/* <Box sx={{ display: "flex", alignItems: "center", paddingTop: 0.5 }}>
        <WorkspacePremium sx={{ color: "#F5B301" }} />
        <Typography fontWeight="bold" sx={{ color: "#F5B301" }}>
            {point ?? 0} P
        </Typography>
    </Box> */}
                        </Box>
                        <Edit
                            sx={{ color: "#F54927", cursor: "pointer" }}
                            onClick={() => router.get(route("customer.profile.edit"))}
                        />
                    </Stack>
                </Paper>
            </Box>

            {/* ✅ ส่วนเนื้อหาหลัก */}
            <Container
                maxWidth={isMobile ? "sm" : "lg"}
                sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}
            >
                <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                        {t.ProfileWelcome.manageTitle}
                    </Typography>

                    {/* ✅ ปรับให้เป็น Column เดียว */}
                    <Grid
                        container
                        direction="column"
                        spacing={2} // ระยะห่างเท่ากันทุกกล่อง
                        alignItems="stretch"
                    >
                        {/* 🔸 การ์ดแก้ไขข้อมูล */}
                        <Grid size={12}>
                            <Card
                                elevation={3}
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                                }}
                                onClick={() => router.get(route("customer.profile.show"))}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#4caf50",
                                            mx: "auto",
                                            mb: 2,
                                            width: 60,
                                            height: 60,
                                        }}
                                    >
                                        <Edit />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                                        {t.ProfileWelcome.menu.edit.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t.ProfileWelcome.menu.edit.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 🔸 การ์ดดูคะแนน */}
                        <Grid size={12}>
                            <Card
                                elevation={3}
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                                }}
                                onClick={handleShowScore}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#FFC107",
                                            mx: "auto",
                                            mb: 2,
                                            width: 60,
                                            height: 60,
                                        }}
                                    >
                                        <Star />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                                        {t.ProfileWelcome.menu.score.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t.ProfileWelcome.menu.score.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 🔸 การ์ดกลับไปหน้าหลัก */}
                        <Grid size={12}>
                            <Card
                                elevation={3}
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                                }}
                                onClick={() => router.get(route("warranty.home"))}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#2196f3",
                                            mx: "auto",
                                            mb: 2,
                                            width: 60,
                                            height: 60,
                                        }}
                                    >
                                        <ArrowBack />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                                        {t.ProfileWelcome.menu.home.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t.ProfileWelcome.menu.home.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
            <ProfileQrModal
                open={showProfileQr}
                onClose={() => setShowProfileQr(false)}
                user={user}
                lineAvatar={line_avatar ?? null}
                customerCode={referral_code}
                referralUrl={referral_url}
            />
        </MobileAuthenticatedLayout>
    );
}

//--------------------------------------------------------------------------------------
// import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
// import {
//     Box, Typography, Stack, Avatar, Container, useTheme,
//     useMediaQuery, IconButton, List, ListItem, ListItemButton,
//     ListItemIcon, ListItemText, Divider, Button
// } from "@mui/material";
// import {
//     EditOutlined,
//     StarOutline,
//     StorefrontOutlined,
//     ChevronRight,
//     ContentCopy,
//     ArrowBackIosNew
// } from "@mui/icons-material";
// import { Head, router, usePage } from "@inertiajs/react";
// import { useLanguage } from "@/context/LanguageContext";
// import Swal from "sweetalert2";
// import backgroundHome from "@/assets/images/backgroundHome.jpg"; // นำเข้าภาพพื้นหลังกลับมา
// import { useState } from "react";
// import ProfileQrModal from "@/Pages/Warranty/ProfileQrModal";
// import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

// export default function WelComeProFile() {
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//     // รับ Props เดิม
//     const { auth, line_avatar, point, referral_code, referral_url } = usePage().props as any;
//     const user = auth.user;
//     const { t } = useLanguage();
//     const [showProfileQr, setShowProfileQr] = useState(false);
//     const myReferralCode = referral_code || "-";

//     // ฟังก์ชัน Copy
//     const handleCopy = async () => {
//         if (!myReferralCode) return;

//         // ฟังก์ชันแสดง Alert
//         const showSuccess = () => {
//             Swal.fire({
//                 toast: true,
//                 position: 'center',
//                 icon: 'success',
//                 title: 'คัดลอกรหัสแล้ว',
//                 showConfirmButton: false,
//                 timer: 1500
//             });
//         };

//         // 1. ลองใช้วิธี Modern API (สำหรับ HTTPS / Localhost)
//         if (navigator.clipboard && window.isSecureContext) {
//             try {
//                 await navigator.clipboard.writeText(myReferralCode);
//                 showSuccess();
//                 return;
//             } catch (err) {
//                 console.error('Clipboard API failed', err);
//             }
//         }

//         // 2. วิธีสำรอง (Fallback) สำหรับ HTTP หรือ Browser เก่า
//         try {
//             const textArea = document.createElement("textarea");
//             textArea.value = myReferralCode;

//             // ซ่อน TextArea ไม่ให้ User เห็น
//             textArea.style.position = "fixed";
//             textArea.style.left = "-9999px";
//             textArea.style.top = "0";

//             document.body.appendChild(textArea);
//             textArea.focus();
//             textArea.select();

//             const successful = document.execCommand('copy');
//             document.body.removeChild(textArea);

//             if (successful) {
//                 showSuccess();
//             } else {
//                 console.error("Fallback copy failed.");
//             }
//         } catch (err) {
//             console.error("Unable to copy", err);
//         }
//     };

//     // ฟังก์ชัน Logout
//     const handleLogout = () => {
//         router.post(route('logout'));
//     };

//     return (
//         <MobileAuthenticatedLayout title={t.ProfileWelcome.title}>
//             <Head title={t.Customer.title.mainTitle} />

//             <Box sx={{
//                 position: 'relative',
//                 // --- ส่วนที่เพิ่มเพื่อขยายเต็มจอ ---
//                 width: '100vw',                 // 1. ความกว้างเท่ากับหน้าจอ
//                 marginLeft: 'calc(-50vw + 50%)',// 2. ดันขอบซ้ายออกไปชนขอบจอ
//                 marginRight: 'calc(-50vw + 50%)',// 3. ดันขอบขวาออกไปชนขอบจอ
//                 overflow: 'hidden',             // 4. ป้องกันไม่ให้เกิด Scrollbar แนวนอน
//                 // ----------------------------

//                 background: `linear-gradient(180deg, rgba(245, 73, 39, 0.8) 0%, rgba(255, 255, 255, 1) 100%), url(${backgroundHome})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center top', // ปรับเป็น center top เพื่อให้ภาพอยู่กึ่งกลางสวยงาม
//                 backgroundRepeat: 'no-repeat',    // ป้องกันภาพซ้ำ

//                 mt: 0,
//                 pt: isMobile ? 2 : 8, // เพิ่ม padding-top นิดหน่อยเพื่อให้ Avatar ไม่ติดขอบบนเกินไป
//                 pb: isMobile ? 5 : 6,
//                 px: isMobile ? 2 : 93,
//                 textAlign: 'center',
//                 color: 'white'
//             }}>
//                 {/* <Container maxWidth={isMobile ? 'sm' : 'xs'} sx={{ px: isMobile ? 0 : 2 }}> */}
//                 <Stack direction="row"
//                     alignItems="center"
//                     spacing={2}
//                     sx={{
//                         mt: 2,
//                         width: '100%',
//                         // ✅ กำหนดความกว้างสูงสุดที่ต้องการที่นี่
//                         // ถ้าอยากให้กว้างกว่ามือถือหน่อยในจอคอม ให้เพิ่มค่านี้ เช่น 600px, 800px
//                         maxWidth: '500px'
//                     }}>
//                     {/* 1. Avatar (ซ้าย) */}
//                     <Avatar
//                         src={line_avatar || "https://via.placeholder.com/150"}
//                         onClick={() => setShowProfileQr(true)}
//                         sx={{
//                             width: 80,
//                             height: 80,
//                             border: "3px solid #fff",
//                             boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//                             cursor: "pointer"
//                         }}
//                     />

//                     {/* 2. ชื่อและรหัสแนะนำ (กลาง) - ใช้ flexGrow: 1 เพื่อดัน QR ไปขวา */}
//                     <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
//                         <Typography variant="h6" fontWeight="800" sx={{ mb: 1, color: '#333' }}>
//                             {user.name}
//                         </Typography>

//                         <Typography variant="body2" sx={{ mb: 0.5, color: '#555' }}>
//                             รหัสแนะนำเพื่อน <span style={{ fontWeight: 'bold', color: '#333' }}>{myReferralCode}</span>
//                         </Typography>

//                         {/* ปุ่ม Copy */}
//                         <Button
//                             variant="outlined"
//                             size="small"
//                             startIcon={<ContentCopy sx={{ fontSize: 14 }} />}
//                             onClick={handleCopy}
//                             sx={{
//                                 borderRadius: 20,
//                                 px: 2,
//                                 py: 0.2,
//                                 fontSize: '0.75rem',
//                                 borderColor: '#F54927',
//                                 color: '#F54927',
//                                 bgcolor: '#fff',
//                                 textTransform: 'none',
//                                 '&:hover': { bgcolor: '#FFF3E0' }
//                             }}
//                         >
//                             คัดลอก
//                         </Button>
//                     </Box>

//                     {/* 3. ปุ่ม QR Code (ขวา) */}
//                     <Stack
//                         alignItems="center"
//                         spacing={0.5}
//                         onClick={() => setShowProfileQr(true)}
//                         sx={{ cursor: 'pointer', minWidth: 60 }}
//                     >
//                         <Box sx={{
//                             bgcolor: 'white',
//                             p: 1,
//                             borderRadius: '50%',
//                             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center'
//                         }}>
//                             <QrCodeScannerIcon sx={{ color: "#F54927", fontSize: 24 }} />
//                         </Box>
//                         <Typography variant="caption" sx={{ color: "#333", fontWeight: 700, lineHeight: 1.2 }}>
//                             หมายเลข<br />สมาชิก
//                         </Typography>
//                     </Stack>
//                 </Stack>
//             </Box>

//             {/* ✅ 2. รายการเมนู (List Menu) - โครงสร้างเดิม */}
//             <Container maxWidth="sm" sx={{ px: 1.5 }}>
//                 <List sx={{ bgcolor: 'background.paper' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 800, color: 'gray' }}>
//                         ตั้งค่าบัญชี
//                     </div>
//                     {/* เมนู: แก้ไขข้อมูลส่วนตัว */}
//                     <ListItem disablePadding>
//                         <ListItemButton onClick={() => router.get(route("customer.profile.edit"))} sx={{ py: 2 }}>
//                             <ListItemIcon sx={{ minWidth: 40, color: '#F54927' }}> {/* เปลี่ยนสีไอคอนเป็นส้ม */}
//                                 <EditOutlined />
//                             </ListItemIcon>
//                             <ListItemText
//                                 primary={t.ProfileWelcome.menu.edit.title}
//                                 primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500 }}
//                             />
//                             <ChevronRight color="action" />
//                         </ListItemButton>
//                     </ListItem>
//                     {/* <Divider variant="inset" component="li" /> */}

//                     <div style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 800, marginTop: 5, color: 'gray' }}>
//                         คะแนนสะสม
//                     </div>
//                     {/* เมนู: คะแนนของฉัน */}
//                     <ListItem disablePadding>
//                         <ListItemButton onClick={() => router.get(route("customer.profile.score"))} sx={{ py: 1 }}>
//                             <ListItemIcon sx={{ minWidth: 40, color: '#FFC107' }}> {/* ไอคอนคะแนนสีเหลืองเหมือนเดิม */}
//                                 <StarOutline />
//                             </ListItemIcon>
//                             <ListItemText
//                                 primary={t.ProfileWelcome.menu.score.title}
//                                 secondary={`คะแนนสะสม: ${point ?? 0} แต้ม`}
//                                 primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500 }}
//                             />
//                             <ChevronRight color="action" />
//                         </ListItemButton>
//                     </ListItem>
//                     {/* <Divider variant="inset" component="li" /> */}

//                     {/* เมนู: กลับหน้าหลัก */}
//                     <div style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 800, marginTop: 5, color: 'gray' }}>
//                         อื่นๆ
//                     </div>
//                     <ListItem disablePadding>
//                         <ListItemButton onClick={() => router.get(route("warranty.home"))} sx={{ py: 1 }}>
//                             <ListItemIcon sx={{ minWidth: 40, color: '#2196f3' }}> {/* ไอคอนร้านค้าสีฟ้าเหมือนเดิม */}
//                                 <StorefrontOutlined />
//                             </ListItemIcon>
//                             <ListItemText
//                                 primary={t.ProfileWelcome.menu.home.title}
//                                 primaryTypographyProps={{ fontSize: '1rem', fontWeight: 500 }}
//                             />
//                             <ChevronRight color="action" />
//                         </ListItemButton>
//                     </ListItem>

//                 </List>

//                 {/* ส่วน Footer / Logout */}
//                 <Box sx={{ mt: isMobile ? 6 : 40, px: 2, textAlign: 'center' }}>
//                     {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
//                         เวอร์ชั่น 1.0.0
//                     </Typography> */}

//                     {/* ปุ่มออกจากระบบ (ปรับสีให้เข้ากับธีมส้ม) */}
//                     <Button
//                         fullWidth
//                         variant="contained"
//                         onClick={handleLogout}
//                         sx={{
//                             bgcolor: '#FBE9E7', // สีส้มอ่อนๆ
//                             color: '#D84315', // สีส้มเข้ม
//                             py: 1.5,
//                             borderRadius: 3,
//                             fontWeight: 'bold',
//                             boxShadow: 'none',
//                             '&:hover': { bgcolor: '#FFCCBC' }
//                         }}
//                     >
//                         ออกจากระบบ
//                     </Button>
//                 </Box>
//             </Container>
//             <ProfileQrModal
//                 open={showProfileQr}
//                 onClose={() => setShowProfileQr(false)}
//                 user={user}
//                 lineAvatar={line_avatar ?? null}
//                 customerCode={referral_code}
//                 referralUrl={referral_url}
//             />
//         </MobileAuthenticatedLayout>
//     );
// }