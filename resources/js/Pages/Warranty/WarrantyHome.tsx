import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Card, CardContent, Grid, Typography, Stack,
    Avatar, Paper, Container, useTheme, useMediaQuery
} from "@mui/material";
import { Assignment, History, Edit, WorkspacePremium } from "@mui/icons-material";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import PumpkinLogo from '../../assets/logo/PumpkinLogo.png'
import backgroundHome from '../../assets/images/bigBanner_20251016-161220.jpg'
import banner1 from '../../assets/images/banner1_20251016-161139.jpg'
import banner2 from '../../assets/images/banner2_20251016-161200.jpg'
import banner3 from '../../assets/images/banner3_20251016-161210.jpg'

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import IconMenuCarousel from "@/Components/IconMenuCarousel";

const bottomBanners = [
    banner1,
    banner2,
    banner3
];
const bannerHeight = { xs: 250, sm: 220, md: 260 };
export default function WarrantyHome() {
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // const { user } = usePage().props.auth;
    const { auth, line_avatar, point } = usePage().props as any;
    const user = auth.user;
    console.log("userrrrrrr", user);

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
                            backgroundColor: "black",
                            paddingTop: "20px",
                            // marginTop: "20px",
                            width: "100%", height: "100%", objectFit: "cover",
                            borderBottomRightRadius: "12px",
                            borderBottomLeftRadius: "12px",
                            objectPosition: "top", maxHeight: "400px"
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
                                src={line_avatar || "https://via.placeholder.com/64"} sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    width: 60, height: 60
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
                                    {/* สวัสดีคุณ {" "} */}
                                    {t.homePage.menu_list.welcome + " "}
                                    <Box component="span" sx={{ color: "#F54927" }}>
                                        {user.name}
                                    </Box>
                                </Typography>
                                {/* <Box sx={{ display: "flex", alignItems: "center", paddingTop: 0.5 }}>
                                    <WorkspacePremium sx={{ color: "#F5B301" }} />
                                    <Typography fontWeight="bold" sx={{ color: "#F5B301" }}>
                                        {point ?? 0} P
                                    </Typography>
                                </Box> */}
                            </Box>
                            <Link href={route('customer.profile.welcome')}>
                                <Edit />
                            </Link>
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
                                    height: "100%", // ✅ ความสูงเต็ม grid
                                    display: "flex", // ✅ บังคับให้การ์ดขยายเท่ากัน
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={() => router.get(route("warranty.form"))}
                            >
                                <CardContent
                                    sx={{
                                        textAlign: "center",
                                        py: 3,
                                        flexGrow: 1, 
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
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
                                    height: "100%", // ✅ ความสูงเท่ากัน
                                    display: "flex",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                    },
                                }}
                                onClick={() => navigateTo("/warranty/history")}
                            >
                                <CardContent
                                    sx={{
                                        textAlign: "center",
                                        py: 3,
                                        flexGrow: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
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
                    <IconMenuCarousel />
                    <Box
                        sx={{
                            mt: { sm: 0 },
                            borderRadius: 3,
                            overflow: "visible",
                            // boxShadow: 3,
                            position: "relative",
                            height: bannerHeight,
                            width: "100%",
                        }}
                    >
                        <Slider {...bannerSettings}>
                            {bottomBanners.map((banner, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        height: bannerHeight,
                                        // borderRadius: 2,
                                        overflow: "hidden",
                                        position: "relative",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={banner}
                                        alt={`Promotion ${idx + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            display: "block",
                                        }}
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