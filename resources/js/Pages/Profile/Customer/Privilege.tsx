import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Stack,
    Typography,
    IconButton,
    Button,
    useMediaQuery,
    useTheme,
    Avatar,
    Tabs,
    Tab,
} from "@mui/material";
import { ExpandMore, Language } from "@mui/icons-material";
import * as React from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axios from "axios";
import RedeemHistory from "./RedeemHistory";
import type { PageProps } from "@inertiajs/core";

type Tier = "silver" | "gold" | "platinum";

interface MembershipTier {
    key: string;          // เช่น "gold", "platinum"
    name: string;         // ชื่อเต็ม
    min_point: number;    // เกณฑ์ขั้นต่ำของ tier
    level: number;
    duration_years: number;
}

interface ProductItem {
    pid: string;
    pname: string;
    image_url: string;
    tier_level: number;
    redeem_point: number;
    product_type: "reward" | "privilege" | "coupon";
}

interface ProductsByType {
    reward: ProductItem[];
    privilege: ProductItem[];
    coupon: ProductItem[];
}

interface PrivilegeProps extends PageProps {
    display_name: string;
    point: number;
    joined_at: string;
    tier: Tier;
    line_avatar?: string | null;
    products: ProductsByType;
    tier_expired_at?: string;
    tiers: MembershipTier[];
}

function ProductList({
    products,
    point,
    onRedeem,
}: {
    products: ProductItem[];
    point: number;
    onRedeem: (item: ProductItem) => void;
}) {
    if (!products || products.length === 0) {
        return (
            <Typography variant="body2" sx={{ color: "#999", mt: 3, ml: 3 }}>
                ยังไม่มีรายการในหมวดนี้
            </Typography>
        );
    }

    return (
        <Grid container spacing={1.5} sx={{ mt: 3, px: 2 }} alignItems="stretch">
            {products.map((item) => (
                <Grid key={item.pid} size={{ xs: 6, sm: 4, md: 6 }}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                            overflow: "hidden",
                            transition: "transform 0.2s",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            "&:hover": { transform: "translateY(-3px)" },
                        }}
                    >
                        <Box
                            component="img"
                            src={item.image_url}
                            alt={item.pname}
                            sx={{
                                width: "100%",
                                height: 110,
                                objectFit: "contain",
                                bgcolor: "#FFF",
                            }}
                        />
                        <CardContent
                            sx={{
                                p: 1.5,
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                    color: "#333",
                                    minHeight: 40,
                                    lineHeight: 1.3,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {item.pname}
                            </Typography>

                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                sx={{ mt: 0.5, mb: 1 }}
                            >
                                <Box
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: "50%",
                                        background: "radial-gradient(#FFF, #FFF6B4)",
                                        border: "2px solid #FFE970",
                                        display: "grid",
                                        placeItems: "center",
                                        color: "#8A8200",
                                        fontWeight: 900,
                                        fontSize: 12,
                                    }}
                                >
                                    P
                                </Box>
                                <Typography
                                    variant="body2"
                                    fontWeight={900}
                                    sx={{ color: "#444" }}
                                >
                                    {item.redeem_point.toLocaleString("th-TH")} คะแนน
                                </Typography>
                            </Stack>

                            <Button
                                fullWidth
                                size="small"
                                disabled={point < item.redeem_point}
                                sx={{
                                    bgcolor:
                                        point >= item.redeem_point ? "#FF8A00" : "#E0E0E0",
                                    color: "white",
                                    fontWeight: 700,
                                    py: 0.6,
                                    fontSize: 13,
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    "&:hover": {
                                        bgcolor:
                                            point >= item.redeem_point
                                                ? "#e67800"
                                                : "#E0E0E0",
                                    },
                                    transition: "0.2s",
                                }}
                                onClick={() => onRedeem(item)}
                            >
                                {point >= item.redeem_point
                                    ? "แลกของรางวัล"
                                    : "คะแนนไม่พอ"}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

export default function PrivilegePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { display_name, point, joined_at, tier, line_avatar, products, tier_expired_at, tiers = [], } =
        usePage<PrivilegeProps>().props;

    const currentTierInfo = tiers?.find((t: any) => t.key === tier);
    const currentMinPoint = currentTierInfo?.min_point || 0;

    // ✅ ตรวจว่าตกจาก tier เดิมหรือยัง
    const isHighTier = tier === "platinum" || tier === "gold";
    const isBelowThreshold = isHighTier && point < currentMinPoint;
    const isNotExpired = tier_expired_at && dayjs().isBefore(dayjs(tier_expired_at));

    const fmt = new Intl.NumberFormat("th-TH");
    const [tab, setTab] = React.useState(0);
    const [redeemHistory, setRedeemHistory] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (tab === 3) {
            axios
                .get(route("redeem.history"))
                .then((res) => setRedeemHistory(res.data.data))
                .catch(() => setRedeemHistory([]));
        }
    }, [tab]);

    const handleRedeem = async (item: ProductItem) => {
        if (point < item.redeem_point) {
            Swal.fire(
                "คะแนนไม่พอ",
                "คะแนนของคุณไม่เพียงพอสำหรับแลกรางวัลนี้ 😢",
                "warning"
            );
            return;
        }

        const confirm = await Swal.fire({
            title: "ยืนยันการแลกของรางวัล?",
            text: `ใช้ ${item.redeem_point.toLocaleString()} คะแนนเพื่อแลก "${item.pname}"`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ยืนยันแลก",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#FF8A00",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await axios.post(route("redeem.store"), {
                pid: item.pid,
                pname: item.pname,
                redeem_point: item.redeem_point,
            });

            if (res.data.success) {
                Swal.fire("สำเร็จ!", res.data.message, "success").then(() => {
                    setTab(3);
                    axios
                        .get(route("redeem.history"))
                        .then((res) => setRedeemHistory(res.data.data))
                        .catch(() => setRedeemHistory([]));
                    router.reload({ only: ["auth", "point"] });
                });
            }
        } catch (err: any) {
            Swal.fire(
                "เกิดข้อผิดพลาด",
                err.response?.data?.message || "ไม่สามารถแลกได้",
                "error"
            );
        }
    };

    let nextTier = "";
    let nextTierGoal = 0;

    if (tier === "silver") {
        nextTier = "Gold";
        nextTierGoal = 1001; // gold เริ่มที่ 1001
    } else if (tier === "gold") {
        nextTier = "Platinum";
        nextTierGoal = 3001; // platinum เริ่มที่ 3001
    } else {
        nextTier = ""; // platinum ไม่มีต่อ
    }

    const remainingPoints = nextTierGoal > 0 ? Math.max(0, nextTierGoal - point) : 0;

    return (
        <MobileAuthenticatedLayout title="สิทธิพิเศษ (Privilege)">
            <Head title="สิทธิพิเศษ (Privilege)" />
            <Container maxWidth={false} disableGutters sx={{ mt: 1, mb: 7 }}>
                {/* ส่วนหัว */}
                <Card elevation={0} sx={{ backgroundColor: "#FFEEDB" }}>
                    <CardContent sx={{ p: { xs: 2, sm: 1.5 } }}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid size={{ xs: 3, sm: 2.3 }}>
                                <Avatar
                                    src={line_avatar || "https://via.placeholder.com/64"}
                                    sx={{
                                        width: { xs: 64, sm: 72 },
                                        height: { xs: 64, sm: 72 },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 9, sm: 9 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                                        {/* คะแนนรวม */}
                                        <Typography variant="body2" sx={{ color: "#F55014", fontWeight: 800, mb: 0.5, fontSize: 18, }}>
                                            {fmt.format(point)} คะแนน
                                        </Typography>

                                        {/* ชื่อ + tier */}
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={800}
                                            sx={{ color: "#222", lineHeight: 1.3, mt: 0.5, }}
                                        >
                                            {display_name}
                                            <Chip
                                                label={tier[0].toUpperCase() + tier.slice(1)}
                                                size="small"
                                                sx={{
                                                    bgcolor: "#FF8A00",
                                                    color: "white",
                                                    fontWeight: 700,
                                                    borderRadius: 999,
                                                    height: 22,
                                                    ml: 1,
                                                }}
                                            />
                                        </Typography>

                                        {/* 🟣 ข้อความอธิบายเลื่อน Tier */}
                                        {/* {nextTier ? (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.7,
                                                    color: "#444",
                                                    fontSize: 13,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                <span>
                                                    คุณต้องเพิ่มอีก {fmt.format(remainingPoints)} คะแนน ภายใน{" "}
                                                    {dayjs(tier_expired_at).format("DD/MM/YYYY")}
                                                </span>
                                                <span>เพื่อเลื่อนสถานะเป็น {nextTier}</span>
                                            </Typography>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 1,
                                                    color: "#444",
                                                    fontSize: 13,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                สถานะสมาชิกของคุณอยู่ในระดับสูงสุด
                                            </Typography>
                                        )} */}

                                        {nextTier ? (
                                            <Typography variant="body2" sx={{ mt: 0.7, color: "#444", fontSize: 13, lineHeight: 1.4 }}>
                                                <span>
                                                    คุณสามารถเพิ่มอีก {fmt.format(remainingPoints)} คะแนน ภายใน {" "}
                                                    {dayjs(tier_expired_at).format("DD/MM/YYYY")}
                                                </span> <br />
                                                <span> เพื่อเลื่อนสถานะเป็น {nextTier}</span>
                                            </Typography>
                                        ) : isBelowThreshold && isNotExpired ? (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 1,
                                                    color: "#C62828",
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                <span>สถานะสมาชิกของคุณอยู่ในระดับสูงสุดแล้ว</span> <br />
                                                <span>
                                                    คุณสามารถลงทะเบียนสินค้าเพื่อรักษาระดับแต้มสมาชิก ภายใน{" "}
                                                    {dayjs(tier_expired_at).format("DD/MM/YYYY")}
                                                </span>
                                            </Typography>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 1,
                                                    color: "#444",
                                                    fontSize: 13,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                สถานะสมาชิกของคุณอยู่ในระดับสูงสุด
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ flexGrow: 1 }} />
                                    {/* <IconButton
                                        size="small"
                                        sx={{
                                            color: "#FF8A00",
                                            "&:hover": { bgcolor: "rgba(255,138,0,.08)" },
                                        }}
                                    >
                                        <Language />
                                    </IconButton> */}
                                </Stack>

                                {/* <Typography variant="body2" sx={{ color: "#6B6B6B", mt: 0.25 }}>
                                    สมาชิกตั้งแต่ {dayjs(joined_at).format("D MMM YYYY")}
                                </Typography> */}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Box sx={{ mt: 1.5, px: 1 }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="standard"
                        sx={{
                            width: "100%",
                            minHeight: 44,
                            borderBottom: "1px solid #E0E0E0",
                            "& .MuiTabs-flexContainer": { justifyContent: "space-between" },
                            "& .MuiTab-root": {
                                minHeight: 44,
                                px: 0,
                                flex: "0 0 auto",
                                color: "#8C8C8C",
                                fontWeight: 700,
                                fontSize: 16,
                                textTransform: "none",
                            },
                            "& .Mui-selected": { color: "#FF8A00" },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#FF8A00",
                                height: 3,
                                borderRadius: 3,
                            },
                        }}
                    >
                        <Tab label="รางวัล" />
                        <Tab label="สิทธิพิเศษ" />
                        <Tab label="คูปอง" />
                        <Tab label="ประวัติ" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <ProductList
                        products={products.reward}
                        point={point}
                        onRedeem={handleRedeem}
                    />
                )}
                {tab === 1 && (
                    <ProductList
                        products={products.privilege}
                        point={point}
                        onRedeem={handleRedeem}
                    />
                )}
                {tab === 2 && (
                    <ProductList
                        products={products.coupon}
                        point={point}
                        onRedeem={handleRedeem}
                    />
                )}
                {tab === 3 && <RedeemHistory data={redeemHistory} />}
            </Container>
        </MobileAuthenticatedLayout>
    );
}