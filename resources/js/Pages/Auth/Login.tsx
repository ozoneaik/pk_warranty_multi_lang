import LineIcon from '@/assets/icons/LineIcon';
import { useLanguage } from '@/context/LanguageContext';
import { Head } from '@inertiajs/react';
import { Facebook, Google } from '@mui/icons-material';
import { Button, Container, Stack, Typography, Box, Paper, Avatar } from '@mui/material';
import PumpkinLogo from '../../assets/logo/PumpkinLogo.png'
export default function Login({ status }: { status?: string }) {
    const { t } = useLanguage();

    return (
        <>
            <Head title="Login" />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // สีพื้นหลังใหม่ใช้โทนสีส้มและครีม
                    background: 'linear-gradient(135deg, #fff5f1 0%, #ffeee6 25%, #ffe4d6 50%, #f25722 100%)',
                    p: 2,
                    position: 'relative',
                    // เพิ่มแอนิเมชันพื้นหลัง
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 80%, rgba(242, 87, 34, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(242, 87, 34, 0.15) 0%, transparent 50%)',
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                    <Paper
                        elevation={20}
                        sx={{
                            p: 4,
                            pt: 10, 
                            position: 'relative',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(242, 87, 34, 0.1)',
                            boxShadow: '0 20px 40px rgba(242, 87, 34, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)'
                        }}
                    >

                        {/* Status Message */}
                        {status && (
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    border: '1px solid rgba(76, 175, 80, 0.3)',
                                    borderRadius: 2,
                                    p: 2,
                                    mb: 3
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="success.main"
                                    align="center"
                                    fontWeight="500"
                                >
                                    {status}
                                </Typography>
                            </Box>
                        )}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -50,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 2, 
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <Avatar
                                src={PumpkinLogo}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    width: 100,
                                    height: 100,
                                    boxShadow: '0 4px 15px rgba(242, 87, 34, 0.3)',
                                    border: '3px solid white'
                                }}
                            />
                        </Box>
                        {/* Social Login Buttons */}
                        <Stack spacing={3}>
                            {/* Google Button */}
                            {/* <Button
                                onClick={() => window.location.href = route('google.login')}
                                variant="outlined"
                                fullWidth
                                size="large"
                                startIcon={<Google sx={{ fontSize: '24px' }} />}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    borderRadius: 3,
                                    height: '56px',
                                    borderColor: '#f25722',
                                    color: '#f25722',
                                    borderWidth: '2px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: '#f25722',
                                        backgroundColor: 'rgba(242, 87, 34, 0.05)',
                                        borderWidth: '2px',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(242, 87, 34, 0.2)'
                                    }
                                }}
                            >
                                {t.loginPage.loginWithGoogle}
                            </Button> */}

                            {/* LINE Button */}
                            <Button
                                onClick={() => window.location.href = route('line.login')}
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<LineIcon />}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    borderRadius: 3,
                                    height: '56px',
                                    backgroundColor: '#06C755',
                                    color: 'white',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)',
                                    '&:hover': {
                                        backgroundColor: '#05b04a',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(6, 199, 85, 0.4)'
                                    }
                                }}
                            >
                                {t.loginPage.loginWithLine}
                            </Button>

                            {/* Facebook Button */}
                            {/* <Button
                                onClick={() => window.location.href = route('facebook.login')}
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<Facebook sx={{ fontSize: '24px' }} />}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    borderRadius: 3,
                                    height: '56px',
                                    backgroundColor: '#1877F2',
                                    color: 'white',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(24, 119, 242, 0.3)',
                                    '&:hover': {
                                        backgroundColor: '#145dbf',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(24, 119, 242, 0.4)'
                                    }
                                }}
                            >
                                {t.loginPage.loginWithFacebook}
                            </Button> */}
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}