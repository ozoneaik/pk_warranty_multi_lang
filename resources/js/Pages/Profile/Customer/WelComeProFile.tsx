import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Card, CardContent, Grid, Typography, Stack,
    Avatar, Paper, Container, useTheme, useMediaQuery
} from "@mui/material";
import { Edit, Star, ArrowBack } from "@mui/icons-material";
import { Head, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import backgroundHome from "@/assets/images/backgroundHome.jpg";
import { WorkspacePremium } from "@mui/icons-material";

export default function WelComeProFile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { auth, line_avatar, point } = usePage().props as any;
    const user = auth.user;
    const { t } = useLanguage();

    const handleShowScore = () => router.get(route("customer.profile.score"));

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
                        maxHeight: "350px",
                    }}
                />
                <Paper
                    elevation={4}
                    sx={{
                        position: "absolute",
                        bottom: -40,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "90%",
                        p: 2,
                        borderRadius: 3,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                            src={line_avatar || "https://via.placeholder.com/64"}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                width: 60,
                                height: 60,
                            }}
                        />
                        <Box
                            sx={{
                                // display: "flex",
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
                            <Box sx={{ display: "flex", alignItems: "center", paddingTop: 0.5 }}>
                                <WorkspacePremium sx={{ color: "#F5B301" }} />
                                <Typography fontWeight="bold" sx={{ color: "#F5B301" }}>
                                    {point ?? 0} P
                                </Typography>
                            </Box>
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
                                onClick={() => router.get(route("customer.profile.edit"))}
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
        </MobileAuthenticatedLayout>
    );
}
