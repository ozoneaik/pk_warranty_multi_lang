// import LineIcon from '@/assets/icons/LineIcon';
// import { useLanguage } from '@/context/LanguageContext';
// import { Head } from '@inertiajs/react';
// import { Facebook, Google } from '@mui/icons-material';
// import { Button, Container, Stack, Typography, Box, Paper, Avatar } from '@mui/material';
// import PumpkinLogo from '../../assets/logo/PumpkinLogo.png'
// export default function Login({ status }: { status?: string }) {
//     const { t } = useLanguage();

//     return (
//         <>
//             <Head title="Login" />
//             <Box
//                 sx={{
//                     minHeight: '100vh',
//                     display: 'flex',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     // สีพื้นหลังใหม่ใช้โทนสีส้มและครีม
//                     background: 'linear-gradient(135deg, #fff5f1 0%, #ffeee6 25%, #ffe4d6 50%, #f25722 100%)',
//                     p: 2,
//                     position: 'relative',
//                     // เพิ่มแอนิเมชันพื้นหลัง
//                     '&::before': {
//                         content: '""',
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         right: 0,
//                         bottom: 0,
//                         background: 'radial-gradient(circle at 20% 80%, rgba(242, 87, 34, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(242, 87, 34, 0.15) 0%, transparent 50%)',
//                         zIndex: 0
//                     }
//                 }}
//             >
//                 <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
//                     <Paper
//                         elevation={20}
//                         sx={{
//                             p: 4,
//                             pt: 10, 
//                             position: 'relative',
//                             borderRadius: 4,
//                             background: 'rgba(255, 255, 255, 0.95)',
//                             backdropFilter: 'blur(10px)',
//                             border: '1px solid rgba(242, 87, 34, 0.1)',
//                             boxShadow: '0 20px 40px rgba(242, 87, 34, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)'
//                         }}
//                     >

//                         {/* Status Message */}
//                         {status && (
//                             <Box
//                                 sx={{
//                                     backgroundColor: 'rgba(76, 175, 80, 0.1)',
//                                     border: '1px solid rgba(76, 175, 80, 0.3)',
//                                     borderRadius: 2,
//                                     p: 2,
//                                     mb: 3
//                                 }}
//                             >
//                                 <Typography
//                                     variant="body2"
//                                     color="success.main"
//                                     align="center"
//                                     fontWeight="500"
//                                 >
//                                     {status}
//                                 </Typography>
//                             </Box>
//                         )}
//                         <Box
//                             sx={{
//                                 position: 'absolute',
//                                 top: -50,
//                                 left: '50%',
//                                 transform: 'translateX(-50%)',
//                                 zIndex: 2, 
//                                 display: 'flex',
//                                 justifyContent: 'center'
//                             }}
//                         >
//                             <Avatar
//                                 src={PumpkinLogo}
//                                 sx={{
//                                     bgcolor: 'rgba(255,255,255,0.9)',
//                                     width: 100,
//                                     height: 100,
//                                     boxShadow: '0 4px 15px rgba(242, 87, 34, 0.3)',
//                                     border: '3px solid white'
//                                 }}
//                             />
//                         </Box>
//                         {/* Social Login Buttons */}
//                         <Stack spacing={3}>
//                             {/* Google Button */}
//                             {/* <Button
//                                 onClick={() => window.location.href = route('google.login')}
//                                 variant="outlined"
//                                 fullWidth
//                                 size="large"
//                                 startIcon={<Google sx={{ fontSize: '24px' }} />}
//                                 sx={{
//                                     textTransform: 'none',
//                                     fontSize: '1.1rem',
//                                     fontWeight: '600',
//                                     borderRadius: 3,
//                                     height: '56px',
//                                     borderColor: '#f25722',
//                                     color: '#f25722',
//                                     borderWidth: '2px',
//                                     transition: 'all 0.3s ease',
//                                     '&:hover': {
//                                         borderColor: '#f25722',
//                                         backgroundColor: 'rgba(242, 87, 34, 0.05)',
//                                         borderWidth: '2px',
//                                         transform: 'translateY(-2px)',
//                                         boxShadow: '0 8px 20px rgba(242, 87, 34, 0.2)'
//                                     }
//                                 }}
//                             >
//                                 {t.loginPage.loginWithGoogle}
//                             </Button> */}

//                             {/* LINE Button */}
//                             <Button
//                                 onClick={() => window.location.href = route('line.login')}
//                                 variant="contained"
//                                 fullWidth
//                                 size="large"
//                                 startIcon={<LineIcon />}
//                                 sx={{
//                                     textTransform: 'none',
//                                     fontSize: '1.1rem',
//                                     fontWeight: '600',
//                                     borderRadius: 3,
//                                     height: '56px',
//                                     backgroundColor: '#06C755',
//                                     color: 'white',
//                                     transition: 'all 0.3s ease',
//                                     boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)',
//                                     '&:hover': {
//                                         backgroundColor: '#05b04a',
//                                         transform: 'translateY(-2px)',
//                                         boxShadow: '0 8px 25px rgba(6, 199, 85, 0.4)'
//                                     }
//                                 }}
//                             >
//                                 {t.loginPage.loginWithLine}
//                             </Button>

//                             {/* Facebook Button */}
//                             {/* <Button
//                                 onClick={() => window.location.href = route('facebook.login')}
//                                 variant="contained"
//                                 fullWidth
//                                 size="large"
//                                 startIcon={<Facebook sx={{ fontSize: '24px' }} />}
//                                 sx={{
//                                     textTransform: 'none',
//                                     fontSize: '1.1rem',
//                                     fontWeight: '600',
//                                     borderRadius: 3,
//                                     height: '56px',
//                                     backgroundColor: '#1877F2',
//                                     color: 'white',
//                                     transition: 'all 0.3s ease',
//                                     boxShadow: '0 4px 15px rgba(24, 119, 242, 0.3)',
//                                     '&:hover': {
//                                         backgroundColor: '#145dbf',
//                                         transform: 'translateY(-2px)',
//                                         boxShadow: '0 8px 25px rgba(24, 119, 242, 0.4)'
//                                     }
//                                 }}
//                             >
//                                 {t.loginPage.loginWithFacebook}
//                             </Button> */}
//                         </Stack>
//                     </Paper>
//                 </Container>
//             </Box>
//         </>
//     );
// }
import LineIcon from '@/assets/icons/LineIcon';
import { useLanguage } from '@/context/LanguageContext';
import { Head } from '@inertiajs/react';
import { Button, Typography, Box, Stack, Grid, Divider } from '@mui/material';
import PumpkinLogo from '../../assets/logo/pumpkin.png';
import LoginPromotionImg from '../../assets/logo/CoverLogin1.png';

export default function Login({ status }: { status?: string }) {
    const { t } = useLanguage();

    return (
        <>
            <Head title="Login" />
            <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#fff' }}>
                <Grid container sx={{ flexGrow: 1 }}>
                    {/* ฝั่งซ้าย: Login Form */}
                    <Grid
                        size={{ xs: 12, md: 7, lg: 6 }}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh', // ให้ Grid สูงเต็มจอเพื่อให้ดัน Footer ได้
                            position: 'relative',
                            px: { xs: 4, md: 8 },
                            pt: { xs: 12, md: 4 }, // เว้นที่ให้ Logo ด้านบนใน Mobile
                            pb: 4,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: { xs: `url(${LoginPromotionImg})`, md: 'none' },
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.1,
                                zIndex: 0,
                            },
                        }}
                    >
                        {/* 1. Top Logo Area */}
                        <Box sx={{
                            position: 'absolute',
                            top: 20,
                            // left: 10,
                            left: { xs: '3%', md: -10 },
                            right: 0,
                            display: 'flex',
                            justifyContent: { xs: 'left', md: 'flex-start' }, // Mobile อยู่กลาง Desktop ชิดซ้าย
                            px: { md: 4 },
                            zIndex: 2,
                            gap: 1,
                            alignItems: 'center'
                        }}>
                            <img src={PumpkinLogo} alt="Logo" style={{ height: '35px' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                PUMPKIN ครบทุกเรื่อง เครื่องมือช่าง
                            </Typography>
                        </Box>

                        {/* 2. Main Content (Centered Area) */}
                        <Box sx={{
                            flex: 1, // ยืดตัวเพื่อดัน Footer ลงข้างล่าง
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', textAlign: { xs: 'left', md: 'left' } }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 1,
                                        fontSize: { xs: '1.2rem', md: '1.4rem' },
                                        background: 'linear-gradient(90deg, #f25722, #ff9800, #ffc107)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Pumpkin Online <br />
                                    Warranty Registration System
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                                    ระบบลงทะเบียนรับประกันสินค้าออนไลน์พัมคิน ฯ
                                </Typography>
                                {/* <Divide>เข้าสู่ระบบ</Divide> */}
                                <Divider sx={{ mb: 2 }}>
                                    เข้าสู่ระบบ
                                </Divider>
                                <Stack spacing={2}>
                                    <Button
                                        onClick={() => window.location.href = route('line.login')}
                                        variant="contained"
                                        fullWidth
                                        startIcon={<LineIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: '600',
                                            borderRadius: 1.5,
                                            height: '50px',
                                            backgroundColor: '#06C755',
                                            fontSize: '1rem',
                                            '&:hover': { backgroundColor: '#05b04a' }
                                        }}
                                    >
                                        {t.loginPage.loginWithLine}
                                    </Button>
                                </Stack>
                            </Box>
                        </Box>

                        {/* 3. Footer (แยก Style ตามหน้าจอ) */}
                        <Box sx={{
                            position: 'relative',
                            zIndex: 1,
                            mt: { xs: 8, md: 4 }, // Mobile เว้นห่างจากปุ่มเยอะหน่อย Desktop ปกติ
                            textAlign: 'center'
                        }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    fontSize: '0.80rem',
                                    opacity: 0.7
                                }}
                            >
                                © Pumpkin Corporation Company Limited | Bangkok {new Date().getFullYear()}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* ฝั่งขวา: Desktop Banner */}
                    <Grid size={{ md: 5, lg: 6 }} sx={{
                        display: { xs: 'none', md: 'block' },
                        backgroundImage: `url(${LoginPromotionImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        bgcolor: '#f25722'
                    }} />
                </Grid>
            </Box>
        </>
    );
}