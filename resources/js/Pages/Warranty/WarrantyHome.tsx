import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Stack,
    Avatar,
    Paper,
    Container,
    useTheme,
    useMediaQuery,
    Fab,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItemAvatar,
    ListItemText,
    ListItemButton,
    IconButton,
    keyframes,
} from "@mui/material";
import {
    Assignment,
    History,
    Edit,
    WorkspacePremium,
    NotificationsActive,
    CheckCircle,
    CardGiftcard,
    Close,
} from "@mui/icons-material";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import backgroundHome from "../../assets/images/bigBanner_20251016-161220.jpg";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import IconMenuCarousel from "@/Components/IconMenuCarousel";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import CheckinModal from "./CheckinModal";
import dayjs from "dayjs";
import EarnPointModal from "./EarnPointModal";
import ImagePopupModal from "./ImagePopupModal";
import ProfileQrModal from "./ProfileQrModal";
import { ChevronRightIcon } from "lucide-react";
import PointExpiryModal from "../Profile/Partials/PointExpiryModal";

const bannerHeight = { xs: 250, sm: 220, md: 260 };

// --- กำหนด Type สำหรับการแจ้งเตือน ---
type NotificationType = "CHECK_IN" | "EARN_POINT";
interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}

export default function WarrantyHome() {
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const {
        auth,
        line_avatar,
        point,
        customer_code,
        referral_url,
        point_expiry_date,
        tier,
    } = usePage().props as any;
    const user = auth.user;

    // State
    const [currentPoint, setCurrentPoint] = useState(point ?? 0);

    React.useEffect(() => {
        setCurrentPoint(point ?? 0);
    }, [point]);

    const [banners, setBanners] = useState<string[]>([]);
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showCheckin, setShowCheckin] = useState(false);
    const [showEarnModal, setShowEarnModal] = useState(false);
    const [showImagePopup, setShowImagePopup] = useState(false);
    const [showProfileQr, setShowProfileQr] = useState(false);
    const [openPointModal, setOpenPointModal] = React.useState(false);

    // Data States สำหรับ Check-in และ Points
    const [currentStreak, setCurrentStreak] = useState(0);
    const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
    const [checkedDays, setCheckedDays] = useState<string[]>([]);
    
    const notificationsLoadedRef = useRef(false);

    const tierConfig: Record<
        string,
        { label: string; color: string; bg: string; border: string }
    > = {
        silver: {
            label: t.Score.tiers.silver,
            color: "#5F5E5A",
            bg: "#F1EFE8",
            border: "#B4B2A9",
        },
        gold: {
            label: t.Score.tiers.gold,
            color: "#854F0B",
            bg: "#FAEEDA",
            border: "#EF9F27",
        },
        platinum: {
            label: t.Score.tiers.platinum,
            color: "#3C3489",
            bg: "#EEEDFE",
            border: "#AFA9EC",
        },
    };

    const [earnedData, setEarnedData] = useState<{
        title: string;
        points: number;
        ids: number[];
        message: string;
        items: any[];
        notificationId?: string;
    }>({
        title: "",
        points: 0,
        ids: [],
        message: "",
        items: [],
    });
    const [popupImages, setPopupImages] = useState<string[]>([]);
    const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

    // --- State สำหรับระบบกระดิ่งแจ้งเตือน ---
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotificationModal, setShowNotificationModal] = useState(false);

    const defaultBackground = backgroundHome;

    // โหลด Popup โปรโมชั่น (ยังคง Auto Popup อยู่เพราะเป็นแบนเนอร์)
    const checkImagePopup = async () => {
        try {
            const res = await axios.get("/api/popup/active");
            const images = res.data.images;

            if (images && images.length > 0) {
                const lastShown = sessionStorage.getItem("popup_last_shown");
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;

                if (!lastShown || now - parseInt(lastShown, 10) > oneHour) {
                    setPopupImages(images);
                    setCurrentPopupIndex(0);
                    setShowImagePopup(true);
                    sessionStorage.setItem("popup_last_shown", now.toString());
                    return; // หยุดรอก่อน (รอปิด Modal ค่อยไปต่อ)
                }
            }
            loadNotifications();
        } catch (error) {
            console.error("Failed to fetch popup:", error);
            loadNotifications();
        }
    };

    // --- ดึงข้อมูลการแจ้งเตือนทั้งหมดมารวมกันโดยไม่เปิด Modal ทันที ---
    const loadNotifications = async () => {
        if (notificationsLoadedRef.current) return; // กัน double call
        notificationsLoadedRef.current = true;
        let newNotifs: NotificationItem[] = [];

        try {
            // 1. เช็คแต้มค้างรับ (แบ่งกลุ่ม: เช็คอินลง FAB, อื่นๆ ลง Popup)
            const ptRes = await axios.get("/api/points/pending");
            if (
                ptRes.data.has_points &&
                ptRes.data.items &&
                ptRes.data.items.length > 0
            ) {
                const items = ptRes.data.items;
                // แยกรายการที่เป็นเช็คอิน
                const checkinPoints = items.filter(
                    (item: any) =>
                        item.title?.includes("เช็คอิน") ||
                        item.type === "checkin",
                );
                // รายการอื่นๆ
                const otherPoints = items.filter(
                    (item: any) =>
                        !(
                            item.title?.includes("เช็คอิน") ||
                            item.type === "checkin"
                        ),
                );

                // ส่งรายการเช็คอินเข้า FAB
                checkinPoints.forEach((item: any) => {
                    newNotifs.push({
                        id: `pending_point_${item.id}`,
                        type: "EARN_POINT",
                        title: item.title,
                        message: item.message,
                        data: {
                            point: item.point || 0,
                            transaction_ids: [item.id],
                            items: [item],
                        },
                    });
                });

                // แสดงรายการอื่นๆ เป็น Popup ทันที
                if (otherPoints.length > 0) {
                    const firstItem = otherPoints[0];
                    setEarnedData({
                        title: t.homePage.notifications.earn_title,
                        points: otherPoints.reduce(
                            (sum: number, item: any) => sum + (item.point || 0),
                            0,
                        ),
                        ids: otherPoints.map((item: any) => item.id),
                        message: t.homePage.notifications.earn_message,
                        items: otherPoints,
                    });
                    setShowEarnModal(true);
                }
            }

            // 2. เช็คสถานะ Check-in
            const chkRes = await axios.get("/api/checkin/status");
            setCurrentStreak(chkRes.data.current_streak);
            setHasCheckedInToday(chkRes.data.has_checked_in);
            setCheckedDays(chkRes.data.checked_days || []);

            if (!chkRes.data.has_checked_in) {
                newNotifs.push({
                    id: "daily_checkin",
                    type: "CHECK_IN",
                    title: t.homePage.notifications.checkin_title,
                    message: t.homePage.notifications.checkin_message,
                });
            }

            setNotifications(newNotifs);
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    };

    useEffect(() => {
        fetchBanners();
        checkImagePopup();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get("/api/banners/active");
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

    const handleCloseImagePopup = () => {
        const nextIndex = currentPopupIndex + 1;
        if (nextIndex < popupImages.length) {
            setShowImagePopup(false);
            setTimeout(() => {
                setCurrentPopupIndex(nextIndex);
                setShowImagePopup(true);
            }, 300);
        } else {
            setShowImagePopup(false);
            setTimeout(() => loadNotifications(), 300);
        }
    };

    // --- Action เมื่อกดรายการแจ้งเตือน ---
    const handleNotificationClick = (notif: NotificationItem) => {
        setShowNotificationModal(false); // ปิด Modal ก่อนเปิด Modal ซ้อนถ้ามี

        if (notif.type === "CHECK_IN") {
            setShowCheckin(true);
        } else if (notif.type === "EARN_POINT") {
            setEarnedData({
                title: notif.title,
                points: notif.data.point || 0,
                ids: notif.data.transaction_ids || [],
                message: notif.message || "",
                items: notif.data.items || [],
                notificationId: notif.id,
            });
            setShowEarnModal(true);
        }
    };

    // --- เมื่อเช็คอินสำเร็จ ---
    const handleCheckinSuccess = (earnedPoints: number) => {
        setCurrentPoint((prev: number) => prev + earnedPoints);
        setHasCheckedInToday(true);

        const today = dayjs().format("YYYY-MM-DD");
        setCheckedDays((prev) => {
            if (prev.includes(today)) return prev;
            return [...prev, today];
        });

        // ลบ notification CHECK_IN ออก โดยไม่ต้องเพิ่มรายการแจ้งเตือนรับแต้มใหม่
        setNotifications((prev) => prev.filter((n) => n.type !== "CHECK_IN"));
    };

    // --- เมื่อกดรับแต้มเสร็จ ---
    const handleCloseEarnModal = async () => {
        setShowEarnModal(false);
        try {
            if (earnedData.ids && earnedData.ids.length > 0) {
                await axios.post("/api/points/ack", {
                    transaction_ids: earnedData.ids,
                });
            }

            // หมายเหตุ: ไม่ต้องบวกแต้ม (setCurrentPoint) เข้าไปอีก
            // เนื่องจากแต้มตั้งต้น (usePage().props.point) ได้รวมแต้มเหล่านี้มาจากฐานข้อมูลแล้ว
            // ลบรายการแต้มนี้ออกจากการแจ้งเตือน (ถ้ามี)
            if (earnedData.notificationId) {
                setNotifications((prev) =>
                    prev.filter((n) => n.id !== earnedData.notificationId),
                );
            }
        } catch (error) {
            console.error(error);
        }
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
                            paddingTop: "60px",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderBottomRightRadius: "12px",
                            borderBottomLeftRadius: "12px",
                            objectPosition: "top",
                            maxHeight: "430px",
                        }}
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://via.placeholder.com/800x400?text=No+Image";
                        }}
                    />

                    {/* Floating Header Section */}
                    <Paper
                        elevation={4}
                        sx={{
                            position: "absolute",
                            bottom: -60,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "90%",
                            padding: 2,
                            borderRadius: 3,
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                                src={line_avatar ?? undefined}
                                onClick={() => setShowProfileQr(true)}
                                sx={{
                                    bgcolor: line_avatar ? "transparent" : "#867e7cff",
                                    width: 60,
                                    height: 60,
                                    cursor: "pointer",
                                    border: "2px solid #fff",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                            />

                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                {/* ชื่อ */}
                                <Typography fontWeight="bold" noWrap>
                                    {t.homePage.menu_list.welcome + " "}
                                    <Box
                                        component="span"
                                        sx={{ color: "#F54927" }}
                                    >
                                        {user.name}
                                    </Box>
                                </Typography>

                                {/* แถว: Point + Tier badge */}
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    sx={{ mt: 0.5 }}
                                >
                                    {/* Point (กดเปิด Modal) */}
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.4}
                                        onClick={() => setOpenPointModal(true)}
                                        sx={{
                                            cursor: "pointer",
                                            "&:active": { opacity: 0.6 },
                                        }}
                                    >
                                        <WorkspacePremium
                                            sx={{
                                                color: "#F5B301",
                                                fontSize: 18,
                                            }}
                                        />
                                        <Typography
                                            fontWeight="bold"
                                            sx={{
                                                color: "#F5B301",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            {currentPoint.toLocaleString()} P
                                        </Typography>
                                        <ChevronRightIcon
                                            size={13}
                                            color="#F5B301"
                                        />
                                    </Stack>

                                    {/* Divider จุด */}
                                    <Typography
                                        sx={{
                                            color: "text.disabled",
                                            fontSize: "0.6rem",
                                            lineHeight: 1,
                                        }}
                                    >
                                        •
                                    </Typography>

                                    {/* Tier Badge */}
                                    {(() => {
                                        const cfg =
                                            tierConfig[tier] ??
                                            tierConfig.silver;
                                        const tierIcon: Record<string, string> =
                                            {
                                                silver: "🥈",
                                                gold: "🥇",
                                                platinum: "💎",
                                            };
                                        return (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: cfg.color,
                                                    bgcolor: cfg.bg,
                                                    border: `1px solid ${cfg.border}`,
                                                    borderRadius: "20px",
                                                    px: 1,
                                                    py: 0.2,
                                                    fontSize: "0.68rem",
                                                    fontWeight: 700,
                                                    lineHeight: 1.6,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {/* {tierIcon[tier] ?? "🥈"}{" "} */}
                                                {cfg.label}
                                            </Typography>
                                        );
                                    })()}
                                </Stack>

                                {/* วันหมดอายุแต้ม */}
                                {point_expiry_date && (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.4}
                                        sx={{ mt: 0.6 }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#9e6c00",
                                                fontSize: "0.65rem",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {t.homePage.point_expiry.replace("{date}", point_expiry_date)}
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>

                            <Link href={route("customer.profile.welcome")}>
                                <Edit sx={{ color: "#F54927" }} />
                            </Link>
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            <Container
                maxWidth={isMobile ? "sm" : "lg"}
                sx={{
                    flexGrow: 1,
                    mt: { xs: 6, sm: 8, md: 8 },
                    mb: 7,
                    px: 2,
                    py: 2,
                }}
            >
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
                                onClick={() =>
                                    router.get(route("warranty.form"))
                                }
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
                                            bgcolor: "#4caf50",
                                            mx: "auto",
                                            mb: 2,
                                            width: 50,
                                            height: 50,
                                        }}
                                    >
                                        <Assignment />
                                    </Avatar>
                                    <Typography
                                        variant="h6"
                                        fontWeight="600"
                                        sx={{ mb: 1 }}
                                    >
                                        {
                                            t.homePage.menu_list
                                                .warrantyFormHeadTitle
                                        }
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {
                                            t.homePage.menu_list
                                                .warrantyFormSubTitle
                                        }
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
                                    <Typography
                                        variant="h6"
                                        fontWeight="600"
                                        sx={{ mb: 1 }}
                                    >
                                        {
                                            t.homePage.menu_list
                                                .warrantyHistoryHeadTitle
                                        }
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {
                                            t.homePage.menu_list
                                                .warrantyHistorySubTitle
                                        }
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <IconMenuCarousel
                        onCheckinClick={() => setShowCheckin(true)}
                        notificationsCount={notifications.length}
                        onNotificationClick={() =>
                            setShowNotificationModal(true)
                        }
                    />
                    {!loading && banners.length > 0 && (
                        <Box
                            sx={{
                                mt: { xs: -5, sm: -1, md: -2 },
                                borderRadius: 3,
                                overflow: "hidden",
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

            <Dialog
                open={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                fullWidth
                maxWidth="xs"
                disableScrollLock
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: "hidden",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        p: 2,
                        bgcolor: "#f8f9fa",
                        borderBottom: "1px solid #eaeaea",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">
                        {t.homePage.notifications.title}
                    </Typography>
                    <IconButton
                        onClick={() => setShowNotificationModal(false)}
                        size="small"
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <List sx={{ p: 0 }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ py: 6, textAlign: "center" }}>
                                <Typography color="text.secondary">
                                    {t.homePage.notifications.no_new}
                                </Typography>
                            </Box>
                        ) : (
                            notifications.map((notif) => (
                                <ListItemButton
                                    key={notif.id}
                                    onClick={() =>
                                        handleNotificationClick(notif)
                                    }
                                    sx={{ borderBottom: "1px solid #f0f0f0" }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor:
                                                    notif.type === "CHECK_IN"
                                                        ? "#4caf50"
                                                        : "#FFC107",
                                            }}
                                        >
                                            {notif.type === "CHECK_IN" ? (
                                                <CheckCircle />
                                            ) : (
                                                <CardGiftcard />
                                            )}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                            >
                                                {notif.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {notif.message}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            ))
                        )}
                    </List>
                </DialogContent>
            </Dialog>

            {/* Modal Components */}
            <ImagePopupModal
                open={showImagePopup}
                onClose={handleCloseImagePopup}
                images={
                    popupImages[currentPopupIndex]
                        ? [popupImages[currentPopupIndex]]
                        : []
                }
            />

            <EarnPointModal
                open={showEarnModal}
                title={earnedData.title}
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
                lineAvatar={line_avatar ?? null}
                customerCode={customer_code}
                referralUrl={referral_url}
            />
            <PointExpiryModal
                open={openPointModal}
                onClose={() => setOpenPointModal(false)}
            />
        </MobileAuthenticatedLayout>
    );
}
