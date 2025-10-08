import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Card, CardContent, Grid, Typography, Stack,
    Avatar, Paper, Container, useTheme, useMediaQuery
} from "@mui/material";
import { Edit, Star, ArrowBack } from "@mui/icons-material";
import { Head, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import PumpkinLogo from "@/assets/logo/PumpkinLogo.png";
import backgroundHome from "@/assets/images/backgroundHome.jpg";

export default function WelComeProFile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = usePage().props.auth;
    const { t } = useLanguage();

    const handleShowScore = () => {
        router.get(route("customer.profile.score"));
    };

    return (
        <MobileAuthenticatedLayout title={t.ProfileWelcome.title}>
            <Head title={t.Customer.title.mainTitle} />
            <Box>
                {/* ส่วนภาพด้านบน */}
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
                            maxHeight: "350px",
                        }}
                    />

                    {/* กล่องข้อมูลลอย */}
                    <Paper
                        elevation={4}
                        sx={{
                            position: "absolute",
                            bottom: -40,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "90%",
                            padding: 2,
                            borderRadius: 3,
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                                src={PumpkinLogo}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    width: 60,
                                    height: 60,
                                }}
                            />
                            <Box flexGrow={1}>
                                <Typography fontWeight="bold">
                                    {t.ProfileWelcome.hello}{" "}
                                    <Box component="span" sx={{ color: "#F54927" }}>
                                        {user.name}
                                    </Box>
                                </Typography>
                            </Box>
                            <Edit
                                sx={{ color: "#F54927", cursor: "pointer" }}
                                onClick={() => router.get(route('customer.profile.edit'))}
                            />
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            {/* ส่วนเนื้อหาหลัก */}
            <Container
                maxWidth={isMobile ? "sm" : "lg"}
                sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}
            >
                <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        {t.ProfileWelcome.manageTitle}
                    </Typography>

                    <Grid container spacing={2}>
                        {/* ปุ่มแก้ไขข้อมูล */}
                        <Grid size={{ xs: 6 }}>
                            <Card
                                elevation={2}
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={() => router.get(route("customer.profile.edit"))}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#4caf50",
                                            mx: "auto",
                                            mb: 2,
                                            width: 50,
                                            height: 50,
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

                        {/* ปุ่มดูคะแนน */}
                        <Grid size={{ xs: 6 }}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: "100%",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={handleShowScore}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#FFC107",
                                            mx: "auto",
                                            mb: 2,
                                            width: 50,
                                            height: 50,
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

                        {/* ปุ่มกลับไปหน้าหลัก */}
                        <Grid size={{ xs: 12 }}>
                            <Card
                                elevation={2}
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={() => router.get(route("warranty.home"))}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#2196f3",
                                            mx: "auto",
                                            mb: 2,
                                            width: 50,
                                            height: 50,
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
        </MobileAuthenticatedLayout>
    );
}
