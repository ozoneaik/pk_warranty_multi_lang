// import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
// import {
//     Box, Card, CardContent, Grid, Typography, Stack,
//     Avatar, Paper, Container, useTheme, useMediaQuery
// } from "@mui/material";
// import { Assignment, History, Edit, WorkspacePremium } from "@mui/icons-material";
// import { Head, Link, router, usePage } from "@inertiajs/react";
// import { useLanguage } from "@/context/LanguageContext";
// import PumpkinLogo from '../../assets/logo/PumpkinLogo.png'
// import backgroundHome from '../../assets/images/bigBanner_20251016-161220.jpg'

// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import IconMenuCarousel from "@/Components/IconMenuCarousel";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import CheckinModal from "./CheckinModal";
// import dayjs from "dayjs";
// import EarnPointModal from "./EarnPointModal";

// const bannerHeight = { xs: 250, sm: 220, md: 260 };
// export default function WarrantyHome() {
//     const { t } = useLanguage();
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//     // const { user } = usePage().props.auth;
//     const { auth, line_avatar, point } = usePage().props as any;
//     const user = auth.user;
//     const [currentPoint, setCurrentPoint] = useState(point ?? 0);
//     const [showCheckin, setShowCheckin] = useState(false);
//     const [currentStreak, setCurrentStreak] = useState(0);
//     const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
//     const [checkedDays, setCheckedDays] = useState<string[]>([]);

//     const [banners, setBanners] = useState<string[]>([]);
//     const [heroImage, setHeroImage] = useState<string | null>(null);
//     const [loading, setLoading] = useState(true);

//     const [showEarnModal, setShowEarnModal] = useState(false);
//     const [earnedData, setEarnedData] = useState({ points: 0, ids: [] });

//     const defaultBackground = backgroundHome;

//     const checkPendingPoints = async () => {
//         try {
//             const res = await axios.get('/api/points/pending');
//             if (res.data.has_points) {
//                 setEarnedData({
//                     points: res.data.total_points,
//                     ids: res.data.transaction_ids
//                 });
//                 setShowEarnModal(true);
//             }
//         } catch (error) {
//             console.error("Error checking points:", error);
//         }
//     };

//     useEffect(() => {

//         const fetchBanners = async () => {
//             try {
//                 const res = await axios.get('/api/banners/active');

//                 // รับค่า Sliders
//                 if (res.data.sliders && res.data.sliders.length > 0) {
//                     setBanners(res.data.sliders);
//                 }

//                 // รับค่า Background Image
//                 if (res.data.background) {
//                     setHeroImage(res.data.background);
//                 }

//             } catch (error) {
//                 console.error("Failed to fetch banners", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchBanners();

//         const checkStatus = async () => {
//             try {
//                 const res = await axios.get('/api/checkin/status');

//                 setCurrentStreak(res.data.current_streak);
//                 setHasCheckedInToday(res.data.has_checked_in);
//                 setCheckedDays(res.data.checked_days || []);

//                 if (!res.data.has_checked_in) {
//                     setTimeout(() => setShowCheckin(true), 1000);
//                 }
//             } catch (err) {
//                 console.error(err);
//             }
//         };

//         checkStatus();
//         checkPendingPoints();
//     }, []);

//     const handleCloseEarnModal = async () => {
//         setShowEarnModal(false);
//         try {
//             await axios.post('/api/points/ack', { transaction_ids: earnedData.ids });

//             // อัปเดตแต้มปัจจุบันบนหน้าจอให้ทันที (Option)
//             setCurrentPoint((prev: number) => prev + earnedData.points);
//         } catch (error) {
//             console.error("Failed to ack points:", error);
//         }
//     };

//     const handleCheckinSuccess = (earnedPoints: number) => {
//         setCurrentPoint((prev: number) => prev + earnedPoints);
//         setHasCheckedInToday(true);

//         const today = dayjs().format('YYYY-MM-DD');

//         setCheckedDays(prev => {
//             if (prev.includes(today)) return prev;
//             return [...prev, today];
//         });

//         setEarnedData({ points: earnedPoints, ids: [] }); // ids ว่างไว้เพราะ CheckinModal อาจจะจัดการเอง หรือถ้าอยากให้ flow เดียวกันก็ยิง API
//         setShowEarnModal(true);
//     };

//     // ฟังก์ชันสำหรับนำทางไปยังหน้าต่างๆ
//     const navigateTo = (route: string) => {
//         router.visit(route);
//     };

//     const bannerSettings = {
//         dots: true,
//         infinite: true,
//         speed: 500,
//         slidesToShow: 1,
//         slidesToScroll: 1,
//         autoplay: true,
//         autoplaySpeed: 4000,
//         arrows: false,
//         pauseOnHover: true,
//     };

//     return (
//         <MobileAuthenticatedLayout title={t.homePage.title}>
//             <Head title={t.homePage.title} />
//             <Box>
//                 {/* Hero Image Section */}
//                 <Box sx={{ position: "relative" }}>
//                     <img
//                         src={heroImage || defaultBackground}
//                         alt="Warranty Banner"
//                         style={{
//                             backgroundColor: "black",
//                             paddingTop: "20px",
//                             width: "100%", height: "100%", objectFit: "cover",
//                             borderBottomRightRadius: "12px",
//                             borderBottomLeftRadius: "12px",
//                             objectPosition: "top", maxHeight: "400px"
//                         }}
//                         // เพิ่ม onError เพื่อกันรูปแตก
//                         onError={(e) => {
//                             e.currentTarget.src = "https://via.placeholder.com/800x400?text=No+Image";
//                         }}
//                     />

//                     {/* Floating Header Section */}
//                     <Paper
//                         elevation={4}
//                         sx={{
//                             position: "absolute", bottom: -40,
//                             left: "50%", transform: "translateX(-50%)",
//                             width: "90%", padding: 2, borderRadius: 3,
//                         }}
//                     >
//                         <Stack direction="row" alignItems="center" spacing={2}>
//                             <Avatar
//                                 src={line_avatar || "https://via.placeholder.com/64"} sx={{
//                                     bgcolor: "rgba(255,255,255,0.2)",
//                                     width: 60, height: 60
//                                 }}
//                             />

//                             <Box
//                                 sx={{
//                                     // display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "space-between",
//                                     width: "100%",
//                                 }}
//                             >
//                                 <Typography fontWeight="bold">
//                                     {/* สวัสดีคุณ {" "} */}
//                                     {t.homePage.menu_list.welcome + " "}
//                                     <Box component="span" sx={{ color: "#F54927" }}>
//                                         {user.name}
//                                     </Box>
//                                 </Typography>
//                                 {/* <Box sx={{ display: "flex", alignItems: "center", paddingTop: 0.5 }}>
//                                     <WorkspacePremium sx={{ color: "#F5B301" }} />
//                                     <Typography fontWeight="bold" sx={{ color: "#F5B301" }}>
//                                         {point ?? 0} P
//                                     </Typography>
//                                 </Box> */}
//                             </Box>
//                             <Link href={route('customer.profile.welcome')}>
//                                 <Edit />
//                             </Link>
//                         </Stack>
//                     </Paper>
//                 </Box>
//             </Box>

//             <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}>
//                 <Box>
//                     {/* Quick Actions */}
//                     <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
//                         {t.homePage.menu_list.title}
//                     </Typography>

//                     <Grid container spacing={2} sx={{ mb: 3 }}>
//                         {/* ลงทะเบียนรับประกัน */}
//                         <Grid size={{ xs: 6 }}>
//                             <Card
//                                 elevation={2}
//                                 sx={{
//                                     cursor: "pointer",
//                                     height: "100%", // ความสูงเต็ม grid
//                                     display: "flex", // บังคับให้การ์ดขยายเท่ากัน
//                                     transition: "all 0.3s ease",
//                                     "&:hover": {
//                                         transform: "translateY(-4px)",
//                                         boxShadow: 4,
//                                     },
//                                 }}
//                                 onClick={() => router.get(route("warranty.form"))}
//                             >
//                                 <CardContent
//                                     sx={{
//                                         textAlign: "center",
//                                         py: 3,
//                                         flexGrow: 1,
//                                         display: "flex",
//                                         flexDirection: "column",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                     }}
//                                 >
//                                     <Avatar
//                                         sx={{
//                                             bgcolor: "#4caf50", mx: "auto",
//                                             mb: 2, width: 50, height: 50,
//                                         }}
//                                     >
//                                         <Assignment />
//                                     </Avatar>
//                                     <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
//                                         {t.homePage.menu_list.warrantyFormHeadTitle}
//                                     </Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         {t.homePage.menu_list.warrantyFormSubTitle}
//                                     </Typography>
//                                 </CardContent>
//                             </Card>
//                         </Grid>

//                         {/* ประวัติการรับประกัน */}
//                         <Grid size={{ xs: 6 }}>
//                             <Card
//                                 elevation={2}
//                                 sx={{
//                                     cursor: "pointer",
//                                     height: "100%", // ความสูงเท่ากัน
//                                     display: "flex",
//                                     transition: "all 0.3s ease",
//                                     "&:hover": {
//                                         transform: "translateY(-4px)",
//                                         boxShadow: 4,
//                                     },
//                                 }}
//                                 onClick={() => navigateTo("/warranty/history")}
//                             >
//                                 <CardContent
//                                     sx={{
//                                         textAlign: "center",
//                                         py: 3,
//                                         flexGrow: 1,
//                                         display: "flex",
//                                         flexDirection: "column",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                     }}
//                                 >
//                                     <Avatar
//                                         sx={{
//                                             bgcolor: "#2196f3",
//                                             mx: "auto",
//                                             mb: 2,
//                                             width: 50,
//                                             height: 50,
//                                         }}
//                                     >
//                                         <History />
//                                     </Avatar>
//                                     <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
//                                         {t.homePage.menu_list.warrantyHistoryHeadTitle}
//                                     </Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         {t.homePage.menu_list.warrantyHistorySubTitle}
//                                     </Typography>
//                                 </CardContent>
//                             </Card>
//                         </Grid>
//                     </Grid>
//                     <IconMenuCarousel onCheckinClick={() => setShowCheckin(true)} />
//                     {!loading && banners.length > 0 && (
//                         <Box
//                             sx={{
//                                 mt: { sm: 0 },
//                                 borderRadius: 3,
//                                 overflow: "visible",
//                                 position: "relative",
//                                 height: bannerHeight,
//                                 width: "100%",
//                             }}
//                         >
//                             <Slider {...bannerSettings}>
//                                 {banners.map((bannerUrl, idx) => (
//                                     <Box
//                                         key={idx}
//                                         sx={{
//                                             height: bannerHeight,
//                                             overflow: "hidden",
//                                             position: "relative",
//                                         }}
//                                     >
//                                         <Box
//                                             component="img"
//                                             src={bannerUrl} // ใช้ URL จาก DB
//                                             alt={`Promotion ${idx + 1}`}
//                                             loading="lazy"
//                                             decoding="async"
//                                             sx={{
//                                                 width: "100%",
//                                                 height: "100%",
//                                                 objectFit: "contain",
//                                                 display: "block",
//                                             }}
//                                         />
//                                     </Box>
//                                 ))}
//                             </Slider>
//                         </Box>
//                     )}
//                 </Box>
//             </Container>
//             <CheckinModal
//                 open={showCheckin}
//                 onClose={() => setShowCheckin(false)}
//                 onSuccess={handleCheckinSuccess}
//                 currentStreak={currentStreak}
//                 hasCheckedInToday={hasCheckedInToday} // ส่งสถานะไปที่ Modal ด้วย
//                 checkedDays={checkedDays}
//             />
//             <EarnPointModal
//                 open={showEarnModal}
//                 onClose={handleCloseEarnModal}
//                 points={earnedData.points}
//             />
//         </MobileAuthenticatedLayout>
//     )
// }

import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Card, CardContent, Grid, Typography, Stack,
    Avatar, Paper, Container, useTheme, useMediaQuery
} from "@mui/material";
import { Assignment, History, Edit } from "@mui/icons-material";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import backgroundHome from '../../assets/images/bigBanner_20251016-161220.jpg'

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import IconMenuCarousel from "@/Components/IconMenuCarousel";
import { useEffect, useState } from "react";
import axios from "axios";
import CheckinModal from "./CheckinModal";
import dayjs from "dayjs";
import EarnPointModal from "./EarnPointModal";
import ImagePopupModal from "./ImagePopupModal";
import ProfileQrModal from "./ProfileQrModal";

const bannerHeight = { xs: 250, sm: 220, md: 260 };

export default function WarrantyHome() {
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { auth, line_avatar, point, customer_code, referral_url } = usePage().props as any;
    const user = auth.user;
    console.log("customer_code:", customer_code);
    // State
    const [currentPoint, setCurrentPoint] = useState(point ?? 0);
    const [banners, setBanners] = useState<string[]>([]);
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showCheckin, setShowCheckin] = useState(false);
    const [showEarnModal, setShowEarnModal] = useState(false);
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [showProfileQr, setShowProfileQr] = useState(false);

    // Data States
    const [currentStreak, setCurrentStreak] = useState(0);
    const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
    const [checkedDays, setCheckedDays] = useState<string[]>([]);
    const [earnedData, setEarnedData] = useState({ points: 0, ids: [], message: '', items: [], });
    const [popupImages, setPopupImages] = useState<string[]>([]);

    const defaultBackground = backgroundHome;

    const checkImagePopup = async () => {
        try {
            const res = await axios.get('/api/popup/active');
            const images = res.data.images;

            if (images && images.length > 0) {
                // เช็คว่าเคยแสดงไปหรือยัง (Session 1 ชั่วโมง)
                const lastShown = sessionStorage.getItem("popup_last_shown");
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;

                if (!lastShown || now - parseInt(lastShown, 10) > oneHour) {
                    setPopupImages(images);
                    setShowImagePopup(true);
                    sessionStorage.setItem("popup_last_shown", now.toString());
                    return; // หยุดรอก่อน (รอปิด Modal ค่อยไปต่อ)
                }
            }
            // ถ้าไม่มีรูป หรือเคยแสดงแล้ว -> ไปขั้นต่อไปทันที
            checkPendingPoints();
        } catch (error) {
            console.error("Failed to fetch popup:", error);
            checkPendingPoints(); // Error ก็ไปต่อ
        }
    };

    // การจัดลำดับ Popup (Step-by-Step)
    // Step 2: เช็คแต้มก่อน
    const checkPendingPoints = async () => {
        try {
            const res = await axios.get('/api/points/pending');
            if (res.data.has_points) {
                // ถ้ามีแต้ม -> เปิด Modal แต้ม และหยุดรอก่อน
                setEarnedData({
                    points: res.data.total_points,
                    ids: res.data.transaction_ids,
                    message: res.data.message,
                    items: res.data.items,
                });
                setShowEarnModal(true);
            } else {
                // ถ้าไม่มีแต้ม -> ไป Step 2 ทันที
                checkCheckinStatus();
            }
        } catch (error) {
            console.error("Error checking points:", error);
            // ถ้า Error ก็ให้ข้ามไป Step 2 เลย
            checkCheckinStatus();
        }
    };

    // Step 3: เช็คสถานะ Check-in
    const checkCheckinStatus = async () => {
        try {
            const res = await axios.get('/api/checkin/status');

            setCurrentStreak(res.data.current_streak);
            setHasCheckedInToday(res.data.has_checked_in);
            setCheckedDays(res.data.checked_days || []);

            if (!res.data.has_checked_in) {
                // ถ้ายังไม่เช็คอิน -> เปิด Modal เช็คอิน
                setTimeout(() => setShowCheckin(true), 500); // หน่วงนิดนึงให้ดูนุ่มนวล
            }
        } catch (err) {
            console.error(err);
        }
    };

    // เริ่มต้นทำงานเมื่อโหลดหน้าเว็บ
    useEffect(() => {
        fetchBanners();
        // เริ่ม Flow การเช็ค Popup
        checkImagePopup();
    }, []);

    const handleCloseImagePopup = () => {
        setShowImagePopup(false);
        setTimeout(() => checkPendingPoints(), 300); // หน่วงนิดนึงให้ดูสมูท
    };

    const handleCloseEarnModal = async () => {
        setShowEarnModal(false);
        try {
            await axios.post('/api/points/ack', { transaction_ids: earnedData.ids });
            setCurrentPoint((prev: number) => prev + earnedData.points);

            setTimeout(() => checkCheckinStatus(), 300);
        } catch (error) {
            checkCheckinStatus();
        }
    };

    // Handlers
    const fetchBanners = async () => {
        try {
            const res = await axios.get('/api/banners/active');
            if (res.data.sliders && res.data.sliders.length > 0) {
                setBanners(res.data.sliders);
            }
            if (res.data.background) {
                setHeroImage(res.data.background);
            }
        } catch (error) {
            console.error("Failed to fetch banners", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckinSuccess = (earnedPoints: number) => {
        setCurrentPoint((prev: number) => prev + earnedPoints);
        setHasCheckedInToday(true);
        const today = dayjs().format('YYYY-MM-DD');
        setCheckedDays(prev => {
            if (prev.includes(today)) return prev;
            return [...prev, today];
        });

        // ในกรณีเช็คอินแล้วได้แต้มเพิ่มอีก อยากให้โชว์ Modal แต้มซ้อนเลยไหม?
        // ถ้าใช่ Uncomment บรรทัดล่าง

        // setEarnedData({ points: earnedPoints, ids: [] }); 
        // setShowEarnModal(true);
    };

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
                        src={heroImage || defaultBackground}
                        alt="Warranty Banner"
                        style={{
                            backgroundColor: "black",
                            paddingTop: "20px",
                            width: "100%", height: "100%", objectFit: "cover",
                            borderBottomRightRadius: "12px",
                            borderBottomLeftRadius: "12px",
                            objectPosition: "top", maxHeight: "400px"
                        }}
                        onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/800x400?text=No+Image";
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
                                src={line_avatar || "https://via.placeholder.com/64"}
                                onClick={() => setShowProfileQr(true)}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    width: 60, height: 60
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
                                    {t.homePage.menu_list.welcome + " "}
                                    <Box component="span" sx={{ color: "#F54927" }}>
                                        {user.name}
                                    </Box>
                                </Typography>
                            </Box>
                            <Link href={route('customer.profile.welcome')}>
                                <Edit />
                            </Link>
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 6, mb: 7, px: 2, py: 2 }}>
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
                                    height: "100%",
                                    display: "flex",
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
                                    height: "100%",
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
                    <IconMenuCarousel onCheckinClick={() => setShowCheckin(true)} />
                    {!loading && banners.length > 0 && (
                        <Box
                            sx={{
                                mt: { sm: 0 },
                                borderRadius: 3,
                                overflow: "visible",
                                position: "relative",
                                height: bannerHeight,
                                width: "100%",
                            }}
                        >
                            <Slider {...bannerSettings}>
                                {banners.map((bannerUrl, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            height: bannerHeight,
                                            overflow: "hidden",
                                            position: "relative",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={bannerUrl}
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
                    )}
                </Box>
            </Container>
            <ImagePopupModal
                open={showImagePopup}
                onClose={handleCloseImagePopup}
                images={popupImages}
            />

            <EarnPointModal
                open={showEarnModal}
                items={earnedData.items}
                onClose={handleCloseEarnModal}
                points={earnedData.points}
                message={earnedData.message}
            />

            {/* Modal Components */}
            <CheckinModal
                open={showCheckin}
                onClose={() => setShowCheckin(false)}
                onSuccess={handleCheckinSuccess}
                currentStreak={currentStreak}
                hasCheckedInToday={hasCheckedInToday}
                checkedDays={checkedDays}
            />
            <ProfileQrModal
                open={showProfileQr}
                onClose={() => setShowProfileQr(false)}
                user={user}
                lineAvatar={line_avatar}
                customerCode={customer_code}
                referralUrl={referral_url}
            />
        </MobileAuthenticatedLayout>
    )
}