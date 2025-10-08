import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Card, CardContent, Grid, Typography, Stack,
    Avatar, Paper, Container, useTheme, useMediaQuery
} from "@mui/material";
import { Assignment, History, Edit } from "@mui/icons-material";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import PumpkinLogo from '../../assets/logo/PumpkinLogo.png'
import backgroundHome from '../../assets/images/backgroundHome.jpg'

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const bottomBanners = [
    "https://pumpkin.co.th/wp-content/uploads/2025/01/20250113-092158.jpg",
    "https://pumpkin.co.th/wp-content/uploads/2023/01/1920x752px-product-group.jpg",
    "https://pumpkin.co.th/wp-content/uploads/2023/05/NEW-CORDLESS-SERIES-1530x630px.jpg"
];
export default function WarrantyHome() {

    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { user } = usePage().props.auth;

    // ฟังก์ชันสำหรับนำทางไปยังหน้าต่างๆ
    const navigateTo = (route: string) => {
        router.visit(route);
    };

    const bannerSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false,
        pauseOnHover: true,
    };

    return (
        <MobileAuthenticatedLayout title={t.homePage.title}>
            <Head title={t.homePage.title} />
            <Box>
                {/* Hero Image Section */}
                <Box sx={{ position: "relative" }}>
                    <img
                        src={backgroundHome}
                        alt="Warranty Banner"
                        style={{
                            width: "100%", objectFit: "cover",
                            borderBottomRightRadius: "12px",
                            borderBottomLeftRadius: "12px",
                            objectPosition: "top", maxHeight: "345px"
                        }}
                    />

                    {/* Floating Header Section */}
                    <Paper
                        elevation={4}
                        sx={{
                            position: "absolute", bottom: -40,
                            left: "50%", transform: "translateX(-50%)",
                            width: "90%", padding: 2, borderRadius: 3,
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                                src={PumpkinLogo}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    width: 60, height: 60
                                }}
                            />
                            <Box display='flex' justifyContent='space-between' alignItems='center'>
                                <Typography fontWeight="bold">
                                    {/* สวัสดีคุณ {" "} */}
                                    {t.homePage.menu_list.welcome + " "}
                                    <Box component="span" sx={{ color: "#F54927" }}>
                                        {user.name}
                                    </Box>
                                </Typography>
                                <Link href={route('customer.profile.welcome')}>
                                    <Edit />
                                </Link>
                            </Box>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
            <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}>
                <Box>
                    {/* Quick Actions */}
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        {t.homePage.menu_list.title}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* ลงทะเบียนรับประกัน */}
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
                                onClick={() => router.get(route("warranty.form"))}
                            >
                                <CardContent sx={{ textAlign: "center", py: 3 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "#4caf50", mx: "auto",
                                            mb: 2, width: 50, height: 50,
                                        }}
                                    >
                                        <Assignment />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                                        {t.homePage.menu_list.warrantyFormHeadTitle}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t.homePage.menu_list.warrantyFormSubTitle}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* ประวัติการรับประกัน */}
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
                                onClick={() => navigateTo("/warranty/history")}
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
                                        <History />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                                        {t.homePage.menu_list.warrantyHistoryHeadTitle}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t.homePage.menu_list.warrantyHistorySubTitle}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Box
                        sx={{
                            mt: { xs: 2, sm: 3 },
                            borderRadius: 3,
                            overflow: "visible",
                            boxShadow: 3,
                            position: "relative",
                        }}
                    >
                        <Slider {...bannerSettings}>
                            {bottomBanners.map((banner, idx) => (
                                <Box key={idx}>
                                    <img
                                        src={banner}
                                        alt={`Promotion ${idx + 1}`}
                                        style={{
                                            width: "100%",
                                            objectFit: "cover",
                                            maxHeight: "220px",
                                            borderRadius: "10px",
                                            display: "block",
                                            backgroundColor: "black",
                                        }}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </Box>
                            ))}
                        </Slider>
                    </Box>
                </Box>
            </Container>
        </MobileAuthenticatedLayout>
    )
}