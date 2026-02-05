import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
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
    Dialog,
    DialogContent,
    Divider,
    TextField,
    Checkbox,
    FormControlLabel,
    Autocomplete
} from "@mui/material";
import * as React from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axios from "axios";
import RedeemHistory from "./RedeemHistory";
import type { PageProps } from "@inertiajs/core";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { QRCodeSVG } from "qrcode.react";
import ProfileQrModal from "@/Pages/Warranty/ProfileQrModal";
import { User } from "@/types";
import { ChevronRightIcon } from "lucide-react";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

// --- Types ---
type Tier = "silver" | "gold" | "platinum";

type Province = { id: number; name_th: string; name_en?: string; };
type Amphure = { id: number; province_id: number; name_th: string; };
type Tambon = { id: number; district_id: number; zip_code: number; name_th: string; };

interface MembershipTier {
    key: string;
    name: string;
    min_point: number;
    level: number;
    duration_years: number;
}

interface ProductItem {
    pid: string;
    pname: string;
    image_url: string;
    tier_level: number;
    redeem_point: number;
    earn_point: number;
    product_type: "reward" | "privilege" | "coupon";
    remark?: string;
    expired_at?: string;
    expiry_type?: 'static' | 'dynamic' | 'none';
    expiry_days?: number;
    usage_limit_type?: 'unlimited' | 'once' | 'monthly' | 'yearly' | 'none';
    usage_limit_amount?: number;
    delivery_type?: 'delivery' | 'receive_at_store';
    is_claimed?: boolean;
}

interface ProductsByType {
    reward: ProductItem[];
    privilege: ProductItem[];
    coupon: ProductItem[];
}

interface CustomerInfo {
    fname: string;
    lname: string;
    tel: string;
    address: string;
    subdistrict: string;
    district: string;
    province: string;
    zipcode: string;
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
    customer_info?: CustomerInfo;
    customer_code: string;
    referral_url: string;
    orders?: any[];
    // user: User;
}

// REWARD LIST COMPONENT (แยกออกมาเฉพาะของรางวัล)
function RewardList({ products, point, userTierLevel, onRedeem }: { products: ProductItem[]; point: number; userTierLevel: number; onRedeem: (item: ProductItem) => void; }) {
    if (!products || products.length === 0) {
        return <Typography variant="body2" sx={{ color: "#999", mt: 3, ml: 3 }}>ยังไม่มีของรางวัล</Typography>;
    }
    return (
        <Grid container spacing={1.5} sx={{ mt: 3, px: 2 }} alignItems="stretch">
            {products.map((item) => {
                // Logic เฉพาะของ Reward
                const isTierLocked = userTierLevel < item.tier_level;
                const isPointEnough = point >= item.redeem_point;
                const canRedeem = !isTierLocked && isPointEnough;

                // Styling เฉพาะของ Reward (เช่น เน้นสีส้ม/ทอง)
                let buttonText = "";
                if (isTierLocked) {
                    const tierName = item.tier_level === 2 ? "Gold" : item.tier_level === 3 ? "Platinum" : "High Tier";
                    buttonText = `เฉพาะระดับ ${tierName}`;
                } else {
                    buttonText = isPointEnough ? "แลกของรางวัล" : "คะแนนไม่พอ";
                }

                return (
                    <Grid key={item.pid} size={{ xs: 6, sm: 4, md: 6 }}>
                        <Card sx={{ borderRadius: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.08)", overflow: "hidden", transition: "transform 0.2s", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", filter: isTierLocked ? "grayscale(0.6)" : "none", opacity: isTierLocked ? 0.85 : 1 }}>
                            {isTierLocked && (
                                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(0,0,0,0.65)', color: 'white', borderRadius: 1, px: 0.8, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span style={{ fontSize: 12 }}>🔒</span>
                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: 10 }}>LV.{item.tier_level}</Typography>
                                </Box>
                            )}
                            <Box component="img" src={item.image_url} alt={item.pname} sx={{ width: "100%", height: 110, objectFit: "contain", bgcolor: "#FFF" }} />
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <Typography variant="body2" fontWeight={700} sx={{ color: "#333", minHeight: 40, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{item.pname}</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, mb: 1 }}>
                                    <Box sx={{ width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(#FFF, #FFF6B4)", border: "2px solid #FFE970", display: "grid", placeItems: "center", color: "#8A8200", fontWeight: 900, fontSize: 12 }}>P</Box>
                                    <Typography variant="body2" fontWeight={900} sx={{ color: "#444" }}>{item.redeem_point?.toLocaleString() ?? 0} คะแนน</Typography>
                                </Stack>
                                <Button fullWidth size="small" disabled={!canRedeem} sx={{ bgcolor: isTierLocked ? "#9e9e9e" : (canRedeem ? "#FF8A00" : "#E0E0E0"), color: "white", fontWeight: 700, py: 0.6, fontSize: 12, borderRadius: 1.5, textTransform: "none", "&:hover": { bgcolor: isTierLocked ? "#9e9e9e" : (canRedeem ? "#e67800" : "#E0E0E0") }, transition: "0.2s" }} onClick={() => onRedeem(item)}>
                                    {buttonText}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}

// PRIVILEGE LIST COMPONENT (แยกออกมาเฉพาะสิทธิพิเศษ)
function PrivilegeList({ products, point, userTierLevel, onRedeem }: { products: ProductItem[]; point: number; userTierLevel: number; onRedeem: (item: ProductItem) => void; }) {
    if (!products || products.length === 0) {
        return <Typography variant="body2" sx={{ color: "#999", mt: 3, ml: 3 }}>ยังไม่มีสิทธิพิเศษ</Typography>;
    }
    return (
        <Grid container spacing={1.5} sx={{ mt: 3, px: 2 }} alignItems="stretch">
            {products.map((item) => {
                // Logic เฉพาะ Privilege (มักจะเช็คแค่ Tier หรือกดรับได้เลย)
                const isTierLocked = userTierLevel < item.tier_level;
                const isClaimed = item.is_claimed;

                const isDisabled = isTierLocked || isClaimed;

                let buttonText = "";
                let buttonColor = "#4CAF50"; // สีเขียว default

                if (isClaimed) {
                    buttonText = "รับสิทธิ์แล้ว";
                    buttonColor = "#9e9e9e"; // สีเทา
                } else if (isTierLocked) {
                    const tierName = item.tier_level === 2 ? "Gold" : item.tier_level === 3 ? "Platinum" : "High Tier";
                    buttonText = `เฉพาะระดับ ${tierName}`;
                    buttonColor = "#9e9e9e";
                } else {
                    buttonText = "รับสิทธิพิเศษ";
                }

                // Privilege มักเป็นสีเขียว หรือ Theme ที่สื่อถึงการ "ได้รับ"
                // let buttonText = "";
                // if (isTierLocked) {
                //     const tierName = item.tier_level === 2 ? "Gold" : item.tier_level === 3 ? "Platinum" : "High Tier";
                //     buttonText = `เฉพาะระดับ ${tierName}`;
                // } else {
                //     buttonText = "รับสิทธิพิเศษ";
                // }

                return (
                    <Grid key={item.pid} size={{ xs: 6, sm: 4, md: 6 }}>
                        <Card sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                            overflow: "hidden",
                            transition: "transform 0.2s",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                            // filter: isTierLocked ? "grayscale(0.6)" : "none",
                            // opacity: isTierLocked ? 0.85 : 1,
                            filter: isDisabled ? "grayscale(0.8)" : "none",
                            opacity: isDisabled ? 0.8 : 1
                        }}>
                            {isTierLocked && !isClaimed && (
                                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(0,0,0,0.65)', color: 'white', borderRadius: 1, px: 0.8, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span style={{ fontSize: 12 }}>🔒</span>
                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: 10 }}>LV.{item.tier_level}</Typography>
                                </Box>
                            )}
                            {/* {isClaimed && (
                                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: '#4CAF50', color: 'white', borderRadius: 1, px: 1, py: 0.4 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: 10 }}>CHECKED</Typography>
                                </Box>
                            )} */}
                            <Box component="img" src={item.image_url} alt={item.pname} sx={{ width: "100%", height: 110, objectFit: "contain", bgcolor: "#FFF" }} />
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <Typography variant="body2" fontWeight={700} sx={{ color: "#333", minHeight: 40, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{item.pname}</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, mb: 1 }}>
                                    {/* Privilege อาจจะแสดงเป็น Earn Point (สีเขียว) */}
                                    <Box sx={{ width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(#FFF, #E8F5E9)", border: "2px solid #C8E6C9", display: "grid", placeItems: "center", color: "#1B5E20", fontWeight: 900, fontSize: 12 }}>P</Box>
                                    <Typography variant="body2" fontWeight={900} sx={{ color: "#2E7D32" }}>+{item.earn_point?.toLocaleString() ?? 0} คะแนน</Typography>
                                </Stack>
                                <Button
                                    fullWidth
                                    size="small"
                                    disabled={isDisabled} // Disable ถ้า Locked หรือ Claimed
                                    sx={{
                                        bgcolor: buttonColor,
                                        color: "white",
                                        fontWeight: 700,
                                        py: 0.6,
                                        fontSize: 12,
                                        borderRadius: 1.5,
                                        textTransform: "none",
                                        "&:hover": { bgcolor: buttonColor }, // ไม่ต้องเปลี่ยนสีตอน hover ถ้า disabled
                                        transition: "0.2s"
                                    }}
                                    onClick={() => onRedeem(item)}
                                >
                                    {buttonText}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}

// PART 3: COUPON LIST COMPONENT (แยกออกมาเฉพาะคูปอง)
function CouponList({ products, point, userTierLevel, onRedeem }: { products: ProductItem[]; point: number; userTierLevel: number; onRedeem: (item: ProductItem) => void; }) {
    if (!products || products.length === 0) {
        return <Typography variant="body2" sx={{ color: "#999", mt: 3, ml: 3 }}>ยังไม่มีคูปอง</Typography>;
    }
    return (
        <Grid container spacing={1.5} sx={{ mt: 3, px: 2 }} alignItems="stretch">
            {products.map((item) => {
                // Logic คูปอง (คล้าย Reward แต่หน้าตาอาจจะต่างกันได้ในอนาคต)
                const isTierLocked = userTierLevel < item.tier_level;
                const isPointEnough = point >= item.redeem_point;
                const canRedeem = !isTierLocked && isPointEnough;

                let buttonText = "";
                if (isTierLocked) {
                    const tierName = item.tier_level === 2 ? "Gold" : item.tier_level === 3 ? "Platinum" : "High Tier";
                    buttonText = `เฉพาะระดับ ${tierName}`;
                } else {
                    buttonText = isPointEnough ? "แลกคูปอง" : "คะแนนไม่พอ";
                }

                return (
                    <Grid key={item.pid} size={{ xs: 6, sm: 4, md: 6 }}>
                        {/* ปรับหน้าตา Coupon ให้ต่างได้ที่นี่ เช่น Border เป็นเส้นประ */}
                        <Card sx={{ borderRadius: 2, border: '1px dashed #ddd', boxShadow: "none", overflow: "hidden", transition: "transform 0.2s", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", filter: isTierLocked ? "grayscale(0.6)" : "none", opacity: isTierLocked ? 0.85 : 1 }}>
                            {isTierLocked && (
                                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'rgba(0,0,0,0.65)', color: 'white', borderRadius: 1, px: 0.8, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span style={{ fontSize: 12 }}>🔒</span>
                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: 10 }}>LV.{item.tier_level}</Typography>
                                </Box>
                            )}
                            <Box component="img" src={item.image_url} alt={item.pname} sx={{ width: "100%", height: 110, objectFit: "contain", bgcolor: "#f9f9f9" }} />
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <Typography variant="body2" fontWeight={700} sx={{ color: "#333", minHeight: 40, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{item.pname}</Typography>
                                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, mb: 1 }}>
                                    <Box sx={{ width: 22, height: 22, borderRadius: "50%", background: "#eee", display: "grid", placeItems: "center", color: "#666", fontWeight: 900, fontSize: 12 }}>P</Box>
                                    <Typography variant="body2" fontWeight={900} sx={{ color: "#444" }}>{item.redeem_point?.toLocaleString() ?? 0} คะแนน</Typography>
                                </Stack>
                                <Button fullWidth size="small" disabled={!canRedeem} sx={{ bgcolor: isTierLocked ? "#9e9e9e" : (canRedeem ? "#2196F3" : "#E0E0E0"), color: "white", fontWeight: 700, py: 0.6, fontSize: 12, borderRadius: 1.5, textTransform: "none", "&:hover": { bgcolor: isTierLocked ? "#9e9e9e" : (canRedeem ? "#1976D2" : "#E0E0E0") }, transition: "0.2s" }} onClick={() => onRedeem(item)}>
                                    {buttonText}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}

// --- Main Page ---
export default function PrivilegePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const {
        display_name, point, joined_at, tier, line_avatar, products, tier_expired_at, tiers = [],
        customer_info, customer_code, referral_url, auth, orders
    } = usePage<PrivilegeProps>().props;
    const user = auth.user;
    // console.log("customer_info:", customer_code);
    // console.log("Authenticated User:", user);
    // console.log("referral_url:", referral_url);

    const currentTierInfo = tiers?.find((t: any) => t.key === tier);
    const userTierLevel = currentTierInfo?.level || 1;
    const currentMinPoint = currentTierInfo?.min_point || 0;
    const isHighTier = tier === "platinum" || tier === "gold";
    const isBelowThreshold = isHighTier && point < currentMinPoint;
    const isNotExpired = tier_expired_at && dayjs().isBefore(dayjs(tier_expired_at));
    const fmt = new Intl.NumberFormat("th-TH");

    // --- State ---
    const [tab, setTab] = React.useState(0);
    const [redeemHistory, setRedeemHistory] = React.useState<any[]>([]);
    const [redeemStep, setRedeemStep] = React.useState<'detail' | 'address_input' | 'address_confirm' | 'confirm' | 'result'>('detail');
    const [selectedItem, setSelectedItem] = React.useState<ProductItem | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [mainDialog, setMainDialog] = React.useState<{ open: boolean, data: any }>({ open: false, data: null });
    const [updateProfile, setUpdateProfile] = React.useState(false);

    // --- Address Form State ---
    const [addressForm, setAddressForm] = React.useState({
        name: "", phone: "", address: "", sub_district: "", district: "", province: "", zipcode: ""
    });

    // --- Address Data States ---
    const [provinces, setProvinces] = React.useState<Province[]>([]);
    const [allAmphures, setAllAmphures] = React.useState<Amphure[]>([]);
    const [allTambons, setAllTambons] = React.useState<Tambon[]>([]);
    const [amphures, setAmphures] = React.useState<Amphure[]>([]);
    const [tambons, setTambons] = React.useState<Tambon[]>([]);

    const [showProfileQr, setShowProfileQr] = React.useState(false);

    // --- Fetch Address Data on Mount ---
    React.useEffect(() => {
        const loadAddressData = async () => {
            try {
                const [provRes, ampRes, tamRes] = await Promise.all([
                    fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json"),
                    fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json"),
                    fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json")
                ]);

                if (provRes.ok) setProvinces(await provRes.json());
                if (ampRes.ok) setAllAmphures(await ampRes.json());
                if (tamRes.ok) setAllTambons(await tamRes.json());
            } catch (err) {
                console.error("Failed to load address data", err);
            }
        };
        loadAddressData();
    }, []);

    // --- Auto Filter Amphures ---
    React.useEffect(() => {
        if (addressForm.province && allAmphures.length > 0) {
            const selectedProv = provinces.find(p => p.name_th === addressForm.province);
            if (selectedProv) {
                setAmphures(allAmphures.filter(a => a.province_id === selectedProv.id));
            } else {
                setAmphures([]);
            }
        } else {
            setAmphures([]);
        }
    }, [addressForm.province, allAmphures, provinces]);

    // --- Auto Filter Tambons ---
    React.useEffect(() => {
        if (addressForm.district && allTambons.length > 0) {
            const selectedAmp = amphures.find(a => a.name_th === addressForm.district);
            if (selectedAmp) {
                setTambons(allTambons.filter(t => t.district_id === selectedAmp.id));
            } else {
                setTambons([]);
            }
        } else {
            setTambons([]);
        }
    }, [addressForm.district, allTambons, amphures]);

    React.useEffect(() => {
        if (tab === 3) {
            axios.get(route("redeem.history")).then((res) => setRedeemHistory(res.data.data)).catch(() => setRedeemHistory([]));
        }
    }, [tab]);

    // --- Handlers for Autocomplete ---
    const handleProvinceChange = (value: Province | null) => {
        setAddressForm(prev => ({
            ...prev,
            province: value ? value.name_th : "",
            district: "", sub_district: "", zipcode: ""
        }));
    };

    const handleAmphureChange = (value: Amphure | null) => {
        setAddressForm(prev => ({
            ...prev,
            district: value ? value.name_th : "",
            sub_district: "", zipcode: ""
        }));
    };

    const handleTambonChange = (value: Tambon | null) => {
        setAddressForm(prev => ({
            ...prev,
            sub_district: value ? value.name_th : "",
            zipcode: value ? String(value.zip_code) : ""
        }));
    };

    const handleOpenRedeem = (item: ProductItem) => {
        setSelectedItem(item);
        if (item.delivery_type === 'delivery') {
            setAddressForm({
                name: customer_info ? `${customer_info.fname} ${customer_info.lname}`.trim() : display_name,
                phone: customer_info?.tel || "",
                address: customer_info?.address || "",
                sub_district: customer_info?.subdistrict || "",
                district: customer_info?.district || "",
                province: customer_info?.province || "",
                zipcode: customer_info?.zipcode || "",
            });
            setUpdateProfile(false);
            setRedeemStep('address_input');
        } else {
            setRedeemStep('detail');
        }
        setMainDialog({ open: true, data: null });
    };

    const handleConfirmAddressInput = () => {
        if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.sub_district || !addressForm.district || !addressForm.province || !addressForm.zipcode) {
            Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูลให้ครบถ้วน', timer: 1500, showConfirmButton: false });
            return;
        }
        setRedeemStep('address_confirm');
    };

    const processRedeem = async () => {
        if (loading || !selectedItem) return;
        setLoading(true);

        const payload: any = {
            pid: selectedItem.pid,
            pname: selectedItem.pname,
            redeem_point: selectedItem.redeem_point,
            product_type: selectedItem.product_type,
            delivery_type: selectedItem.delivery_type,
            update_profile: updateProfile
        };

        if (selectedItem.delivery_type === 'delivery') {
            payload.customer_name = addressForm.name;
            payload.phone_number = addressForm.phone;
            payload.address = addressForm.address;
            payload.sub_district = addressForm.sub_district;
            payload.district = addressForm.district;
            payload.province = addressForm.province;
            payload.zipcode = addressForm.zipcode;
        }

        try {
            const res = await axios.post(route("redeem.store"), payload);
            if (res.data.success) {
                setMainDialog({
                    open: true,
                    data: {
                        pname: selectedItem.pname,
                        code: res.data.coupon?.code || "SUCCESS",
                        expired_at: res.data.coupon?.expired_at || "-",
                        image: selectedItem.image_url
                    }
                });
                setRedeemStep('result');
                router.reload({ only: ["point", "products", "customer_info"] });
            }
        } catch (err: any) {
            setMainDialog({ ...mainDialog, open: false });
            setTimeout(() => {
                Swal.fire({ title: "ขออภัย", text: err.response?.data?.message || "ไม่สามารถทำรายการได้", icon: "error", });
            }, 200);
        } finally {
            setLoading(false);
        }
    };

    let nextTier = ""; let nextTierGoal = 0;
    if (tier === "silver") { nextTier = "Gold"; nextTierGoal = 1001; }
    else if (tier === "gold") { nextTier = "Platinum"; nextTierGoal = 3001; }
    const remainingPoints = nextTierGoal > 0 ? Math.max(0, nextTierGoal - point) : 0;
    let progressPercent = 0;
    if (nextTierGoal > 0) {
        const prevTierGoal = tier === "gold" ? 1001 : 0;
        const totalRange = nextTierGoal - prevTierGoal;
        const currentProgress = point - prevTierGoal;
        progressPercent = Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
    } else {
        progressPercent = 100; // Max tier
    }

    const getExpiryText = (item: ProductItem) => {
        if (item.expiry_type === 'none') return "ไม่ระบุ";
        if (item.expiry_type === 'dynamic') return `รีบเลย! ใช้ได้นาน ${item.expiry_days} วัน หลังกดรับ`;
        if (item.expired_at) return `ใช้สิทธิ์ได้ถึง: ${dayjs(item.expired_at).format('D MMM YYYY')}`;
        return "ใช้ได้จนกว่าจะมีการเปลี่ยนแปลง";
    };

    return (
        <MobileAuthenticatedLayout title="สิทธิพิเศษ (Privilege)">
            <Head title="สิทธิพิเศษ (Privilege)" />
            <Container maxWidth={false} disableGutters sx={{ mt: 7.5, mb: 7 }}>

                {/* User Info & Tabs */}
                {/* <Card elevation={0} sx={{ backgroundColor: "#FFEEDB" }}>
                    <CardContent sx={{ p: { xs: 2, sm: 1.5 } }}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid size={{ xs: 3, sm: 2.3 }}>
                                <Avatar src={line_avatar || ""} onClick={() => setShowProfileQr(true)}
                                    sx={{ width: { xs: 64, sm: 72 }, height: { xs: 64, sm: 72 } }} /></Grid>
                            <Grid size={{ xs: 9, sm: 9 }}>
                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                    <Typography variant="body2" sx={{ color: "#F55014", fontWeight: 800, mb: 0.5, fontSize: 18 }}>{fmt.format(point)} คะแนน</Typography>
                                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#222", lineHeight: 1.3 }}>{display_name} <Chip label={tier[0].toUpperCase() + tier.slice(1)} size="small" sx={{ bgcolor: "#FF8A00", color: "white", fontWeight: 700, ml: 1, height: 22 }} /></Typography>
                                    {nextTier ? <Typography variant="body2" sx={{ mt: 0.7, color: "#444", fontSize: 13, lineHeight: 1.4 }}>คุณสามารถเพิ่มอีก {fmt.format(remainingPoints)} คะแนน เพื่อเลื่อนสถานะเป็น {nextTier}</Typography> : <Typography variant="body2" sx={{ mt: 1, color: "#444", fontSize: 13 }}>สถานะสมาชิกของคุณอยู่ในระดับสูงสุด</Typography>}
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card> */}
                <Box sx={{ px: isMobile ? 0.5 : 1.5, pt: 0.5 }}>
                    <Card sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", bgcolor: "transparent" }}>

                        {/* ส่วนบน: สีขาว (Avatar + Stats) */}
                        <Box sx={{ bgcolor: "white", p: 2 }}>
                            {/* Header: Avatar & Name */}
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 0 }}>
                                <Box sx={{ position: "relative" }}>
                                    <Avatar
                                        src={line_avatar || ""}
                                        // onClick={() => setShowProfileQr(true)}
                                        sx={{ width: 64, height: 64, border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                                    />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: "#333" }}>
                                        {display_name}
                                    </Typography>
                                    {/* <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: "pointer", mt: 0.5 }} onClick={() => setShowProfileQr(true)}>
                                        <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
                                            โปรไฟล์ของคุณ
                                        </Typography>
                                        <ChevronRightIcon color="#888" size={18} />
                                    </Stack> */}
                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                                        <Box sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #FF8A00 0%, #FF5500 100%)",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                            fontWeight: "bold"
                                        }}>
                                            P
                                        </Box>
                                        {/* ตัวเลขคะแนน สีส้ม */}
                                        <Typography variant="h6" fontWeight={900} sx={{ color: "#F55014", lineHeight: 1 }}>
                                            {fmt.format(point)}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="caption" sx={{ color: "#999", fontSize: 10, lineHeight: 1.2, display: "block", mt: 0.5 }}>
                                        หมดอายุ {tier_expired_at
                                            ? `${dayjs(tier_expired_at).format("D MMM")} ${dayjs(tier_expired_at).year() + 543}`
                                            : "-"
                                        }
                                    </Typography>
                                </Box>
                                <Grid size={4} sx={{ cursor: "pointer" }} onClick={() => setShowProfileQr(true)}>
                                    <Stack alignItems="center" spacing={0.5}>
                                        <QrCodeScannerIcon sx={{ color: "#555", fontSize: 24 }} />
                                        <Typography variant="caption" sx={{ color: "#555", fontWeight: 700, lineHeight: 1.2 }}>
                                            หมายเลข<br />สมาชิก
                                        </Typography>
                                    </Stack>
                                </Grid>
                            </Stack>
                            <Grid container alignItems="flex-start" sx={{ textAlign: "center" }}>
                                <Grid size={4} sx={{ position: "relative" }}>
                                    {/* <Divider orientation="vertical" absolute sx={{ right: 0, top: 4, bottom: 4 }} /> */}
                                </Grid>
                            </Grid>
                        </Box>

                        {/* ส่วนล่าง: สีส้มอ่อนไล่เฉด (Tier Status & Progress) */}
                        <Box sx={{
                            background: "linear-gradient(180deg, #FFF8F0 0%, #FFE6CC 100%)", // พื้นหลังไล่เฉดสีครีมส้ม
                            p: 1,
                            position: "relative"
                        }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                <Box sx={{ p: 0.5, borderRadius: "50%", bgcolor: "#fff" }}>
                                    {/* Icon Tier สีส้ม */}
                                    <EmojiEventsIcon sx={{ color: "#FF8A00", fontSize: 18 }} />
                                </Box>
                                {/* ชื่อ Tier สีส้ม */}
                                <Typography variant="h6" fontWeight={900} sx={{ color: "#F55014", letterSpacing: 0.5 }}>
                                    {tier.toUpperCase()}
                                </Typography>
                                {/* <IconButton size="small" sx={{ color: "#888" }}>
                                    <span style={{ fontSize: 14, border: "1px solid #888", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>i</span>
                                </IconButton> */}
                            </Stack>

                            <Typography variant="body2" sx={{ color: "#444", fontSize: 13, mb: 1, pl: 1 }}>
                                {nextTier
                                    ? <span>สะสมอีก <b>{fmt.format(remainingPoints)} คะแนน</b> เพื่อเลื่อนสถานะเป็น {nextTier}</span>
                                    : <span>สถานะสมาชิกของคุณอยู่ในระดับสูงสุด</span>
                                }
                            </Typography>

                            {/* Progress Bar Visual (Theme Orange) */}
                            <Box sx={{ position: "relative", mx: 1, mb: 1 }}>
                                {/* Background Line */}
                                <Box sx={{ position: "absolute", top: 12, left: 0, right: 0, height: 6, bgcolor: "white", borderRadius: 3 }} />

                                {/* Active Line (Orange Gradient) */}
                                <Box sx={{
                                    position: "absolute",
                                    top: 12,
                                    left: 0,
                                    width: `${progressPercent}%`,
                                    height: 6,
                                    background: "linear-gradient(90deg, #FF8A00 0%, #FF5500 100%)",
                                    borderRadius: 3,
                                    transition: "width 0.5s ease"
                                }} />

                                {/* Step Points */}
                                <Stack direction="row" justifyContent="space-between" sx={{ position: "relative" }}>
                                    {/* Start Point */}
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Box sx={{ width: 30, height: 30, borderRadius: "50%", bgcolor: "#FF8A00", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", zIndex: 1 }}>
                                            <CardGiftcardIcon sx={{ color: "white", fontSize: 16 }} />
                                        </Box>
                                    </Box>

                                    {/* Mid Points (Orange if Active) */}
                                    <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: progressPercent > 33 ? "#FF8A00" : "white", border: "2px solid white", mt: 0.5, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <CardGiftcardIcon sx={{ color: progressPercent > 33 ? "white" : "#ddd", fontSize: 14 }} />
                                    </Box>
                                    <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: progressPercent > 66 ? "#FF8A00" : "white", border: "2px solid white", mt: 0.5, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <CardGiftcardIcon sx={{ color: progressPercent > 66 ? "white" : "#ddd", fontSize: 14 }} />
                                    </Box>

                                    {/* End Point (Crown - Gold/Orange) */}
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            bgcolor: progressPercent >= 100 ? "#FFC107" : "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: `3px solid ${progressPercent >= 100 ? "#fff" : "#FFC107"}`,
                                            zIndex: 1
                                        }}>
                                            <EmojiEventsIcon sx={{ color: progressPercent >= 100 ? "white" : "#FFC107", fontSize: 18 }} />
                                        </Box>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Card>
                </Box>

                <Box sx={{ mt: 1.5, px: 1 }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="standard" sx={{ width: "100%", borderBottom: "1px solid #E0E0E0", "& .MuiTabs-flexContainer": { justifyContent: "space-between" }, "& .MuiTab-root": { minHeight: 44, color: "#8C8C8C", fontWeight: 700, fontSize: 16, textTransform: "none" }, "& .Mui-selected": { color: "#FF8A00" }, "& .MuiTabs-indicator": { backgroundColor: "#FF8A00", height: 3, borderRadius: 3 } }}>
                        <Tab label="รางวัล" /><Tab label="สิทธิพิเศษ" /><Tab label="คูปอง" /><Tab label="ประวัติ" />
                    </Tabs>
                </Box>

                {/* --- Tab Contents (Separated Lists) --- */}
                {
                    tab === 0 && (
                        <RewardList
                            products={products.reward}
                            point={point}
                            userTierLevel={userTierLevel}
                            onRedeem={handleOpenRedeem}
                        />
                    )
                }
                {
                    tab === 1 && (
                        <PrivilegeList
                            products={products.privilege}
                            point={point}
                            userTierLevel={userTierLevel}
                            onRedeem={handleOpenRedeem}
                        />
                    )
                }
                {
                    tab === 2 && (
                        <CouponList
                            products={products.coupon}
                            point={point}
                            userTierLevel={userTierLevel}
                            onRedeem={handleOpenRedeem}
                        />
                    )
                }
                {tab === 3 && <RedeemHistory data={redeemHistory} orders={orders} />}

                {/* Main Dialog */}
                <Dialog
                    open={mainDialog.open}
                    onClose={() => !loading && setMainDialog({ ...mainDialog, open: false })}
                    fullWidth
                    maxWidth="xs"
                    PaperProps={{ sx: { borderRadius: 5, position: 'relative', overflow: 'visible', mx: 2, p: 0, mt: 5 } }}
                >
                    <IconButton onClick={() => setMainDialog({ ...mainDialog, open: false })} sx={{ position: 'absolute', left: 16, top: 16, zIndex: 1, color: '#333' }}>
                        <CloseIcon />
                    </IconButton>

                    <DialogContent sx={{ px: 3, pb: 4, pt: 8 }}>
                        {/* STEP 1: DETAIL */}
                        {redeemStep === 'detail' && selectedItem && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ width: 130, height: 130, borderRadius: '50%', bgcolor: 'white', position: 'absolute', top: -65, left: '50%', transform: 'translateX(-50%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', p: 0.5, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <Avatar src={selectedItem.image_url} sx={{ width: '100%', height: '100%', bgcolor: '#fff' }} imgProps={{ style: { objectFit: 'cover' } }} />
                                </Box>
                                <Typography variant="h6" fontWeight={800} sx={{ color: '#000', lineHeight: 1.3, mt: 1, px: 1 }}>{selectedItem.pname}</Typography>
                                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                                    {/* <Box sx={{ bgcolor: '#FFC107', color: 'white', px: 1.5, py: 0.3, borderRadius: 20, fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        <span>👑</span> {selectedItem.tier_level === 3 ? 'Platinum' : (selectedItem.tier_level === 2 ? 'Gold' : 'Silver')}
                                    </Box> */}
                                    <Typography fontWeight={700} sx={{ color: '#444', fontSize: '0.95rem' }}>Ⓟ {selectedItem.product_type === 'privilege' ? `+${selectedItem.earn_point} Earn` : `${selectedItem.redeem_point} Points`}</Typography>
                                </Stack>
                                {/* <Typography variant="body2" sx={{ color: '#FF5722', mt: 1, fontWeight: 500 }}>Total {selectedItem.usage_limit_amount ? selectedItem.usage_limit_amount : '300'} Rewards</Typography> */}
                                <Divider sx={{ my: 3, borderColor: '#f0f0f0' }} />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#FF5722', mb: 1 }}>เงื่อนไข</Typography>
                                    <Box sx={{ textAlign: 'left', bgcolor: '', p: 0 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: '0.85rem', lineHeight: 1.7 }}>
                                            {selectedItem.remark ? selectedItem.remark : `1. เงื่อนไขเป็นไปตามที่บริษัทกำหนด`}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button fullWidth variant="contained" onClick={() => setRedeemStep('confirm')} sx={{ mt: 4, py: 1.5, borderRadius: '50px', background: '#FF5722', fontWeight: 900, fontSize: '1rem', boxShadow: '0 6px 20px rgba(255, 87, 34, 0.3)', '&:hover': { background: '#F4511E' } }}>Redeem</Button>
                            </Box>
                        )}

                        {/* STEP 2: ADDRESS INPUT */}
                        {redeemStep === 'address_input' && (
                            <Box>
                                <Typography variant="h6" fontWeight="bold" align="center" mb={1}>Delivery address</Typography>
                                <Stack spacing={2} mt={2}>
                                    <TextField label="ชื่อ-นามสกุล ผู้รับ" value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} fullWidth size="small" />
                                    <TextField label="เบอร์โทรศัพท์" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} fullWidth size="small" />
                                    <TextField label="ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)" value={addressForm.address} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} fullWidth size="small" multiline rows={2} />
                                    <Autocomplete
                                        options={provinces}
                                        getOptionLabel={(option) => option.name_th}
                                        value={provinces.find(p => p.name_th === addressForm.province) || null}
                                        onChange={(_, v) => handleProvinceChange(v)}
                                        renderInput={(params) => <TextField {...params} label="จังหวัด" size="small" fullWidth />}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Autocomplete
                                                options={amphures}
                                                getOptionLabel={(option) => option.name_th}
                                                value={amphures.find(a => a.name_th === addressForm.district) || null}
                                                onChange={(_, v) => handleAmphureChange(v)}
                                                disabled={!addressForm.province}
                                                renderInput={(params) => <TextField {...params} label="เขต/อำเภอ" size="small" fullWidth />}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Autocomplete
                                                options={tambons}
                                                getOptionLabel={(option) => option.name_th}
                                                value={tambons.find(t => t.name_th === addressForm.sub_district) || null}
                                                onChange={(_, v) => handleTambonChange(v)}
                                                disabled={!addressForm.district}
                                                renderInput={(params) => <TextField {...params} label="แขวง/ตำบล" size="small" fullWidth />}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField label="รหัสไปรษณีย์" value={addressForm.zipcode} size="small" fullWidth disabled />
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                                        <FormControlLabel control={<Checkbox checked={updateProfile} onChange={(e) => setUpdateProfile(e.target.checked)} color="primary" size="small" />} label={<Typography variant="body2" fontWeight={500} color="textSecondary">ใช้เป็นที่อยู่ปัจจุบัน (อัปเดตข้อมูลส่วนตัว)</Typography>} />
                                    </Box>
                                </Stack>
                                <Button fullWidth variant="contained" sx={{ mt: 3, bgcolor: '#FF5722', borderRadius: 8, py: 1.5, fontWeight: 'bold' }} onClick={handleConfirmAddressInput}>Next</Button>
                            </Box>
                        )}

                        {/* STEP 3: CONFIRM ADDRESS */}
                        {redeemStep === 'address_confirm' && (
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="bold" mb={3}>Confirm delivery address</Typography>
                                <Box sx={{ textAlign: 'left', bgcolor: '#F9FAFB', p: 2, borderRadius: 2, position: 'relative' }}>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>{addressForm.name} | {addressForm.phone}</Typography>
                                    <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>{addressForm.address} {addressForm.sub_district}, {addressForm.district},<br />{addressForm.province}, {addressForm.zipcode}</Typography>
                                    <Button size="small" startIcon={<EditIcon sx={{ fontSize: 14 }} />} sx={{ position: 'absolute', top: 8, right: 8, textTransform: 'none', color: '#999', fontSize: 12 }} onClick={() => setRedeemStep('address_input')}>Edit</Button>
                                </Box>
                                <Button fullWidth variant="contained" sx={{ mt: 4, bgcolor: '#FF5722', borderRadius: 8, py: 1.5, fontWeight: 'bold' }} onClick={() => setRedeemStep('confirm')}>Redeem</Button>
                            </Box>
                        )}

                        {/* STEP 4: FINAL CONFIRM */}
                        {redeemStep === 'confirm' && (
                            <Box sx={{ textAlign: 'center' }}>
                                {selectedItem?.delivery_type !== 'delivery' && (
                                    <Box sx={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #FF8A00 0%, #FF5722 100%)', mx: 'auto', mt: -1, mb: 3, border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={selectedItem?.image_url} style={{ width: '65%', objectFit: 'contain' }} />
                                    </Box>
                                )}
                                {selectedItem?.delivery_type === 'delivery' && (
                                    <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: '#fff', mx: 'auto', mt: -1, mb: 3, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={selectedItem?.image_url} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                    </Box>
                                )}
                                <Typography variant="h6" fontWeight={800} mb={1}>{selectedItem?.pname}</Typography>
                                <Chip label={selectedItem?.tier_level === 2 ? 'Gold' : (selectedItem?.tier_level === 3 ? 'Platinum' : 'Silver')} size="small" sx={{ bgcolor: '#FFC107', color: 'white', fontWeight: 'bold', mb: 2 }} />
                                <Typography variant="h5" color="#333" fontWeight={800} mb={3}>{selectedItem?.product_type === 'privilege' ? `+${selectedItem?.earn_point} Points` : `${selectedItem?.redeem_point.toLocaleString()} Points`}</Typography>
                                <Button fullWidth variant="contained" disabled={loading} onClick={() => processRedeem()} sx={{ bgcolor: '#FF5722', borderRadius: 8, py: 1.5, fontWeight: 'bold' }}>{loading ? "Processing..." : "Redeem"}</Button>
                            </Box>
                        )}

                        {/* STEP 5: RESULT */}
                        {/* {redeemStep === 'result' && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography variant="h6" fontWeight={800}>{selectedItem?.pname}</Typography>
                                <Divider sx={{ my: 3 }} />
                                {selectedItem?.delivery_type === 'delivery' ? (
                                    <Box sx={{ py: 2 }}><Box sx={{ fontSize: '60px', mb: 2 }}>🚚</Box><Typography variant="h6" fontWeight={800} color="success.main">บันทึกข้อมูลจัดส่งเรียบร้อย!</Typography></Box>
                                ) : (
                                    <Box sx={{ p: 2, bgcolor: '#fff', border: '1px solid #eee', borderRadius: 2 }}><QRCodeSVG value={mainDialog.data?.code || ""} size={180} /><Typography variant="h5" fontWeight={900} mt={2}>{mainDialog.data?.code}</Typography></Box>
                                )}
                                <Button fullWidth variant="contained" onClick={() => setMainDialog({ ...mainDialog, open: false })} sx={{ mt: 3, borderRadius: '50px', bgcolor: '#FF5722' }}>ปิดหน้าต่าง</Button>
                            </Box>
                        )} */}
                        {redeemStep === 'result' && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography variant="h6" fontWeight={800}>{selectedItem?.pname}</Typography>
                                <Divider sx={{ my: 3 }} />
                                {selectedItem?.delivery_type === 'delivery' ? (
                                    <Box sx={{ py: 2 }}>
                                        <Box sx={{ fontSize: '60px', mb: 2 }}>🚚</Box>
                                        <Typography variant="h6" fontWeight={800} color="success.main">บันทึกข้อมูลจัดส่งเรียบร้อย!</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 4, bgcolor: '#f9f9f9', border: '1px dashed #ddd', borderRadius: 2 }}>
                                        {/* --- ปิดการแสดงผล QR CODE ตามที่ต้องการ --- */}
                                        {/* <QRCodeSVG value={mainDialog.data?.code || ""} size={180} /> */}

                                        {/* แสดงเป็น Icon หรือข้อความ Success แทน */}
                                        <Box sx={{ fontSize: '50px', mb: 2 }}>🎉</Box>
                                        <Typography variant="h6" fontWeight={800} color="success.main" gutterBottom>แลกสิทธิ์สำเร็จ!</Typography>

                                        {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 0.5 }}>รหัสของคุณ</Typography>
                                        <Typography variant="h4" fontWeight={900} sx={{ color: '#FF5722', letterSpacing: 1 }}>
                                            {mainDialog.data?.code}
                                        </Typography> */}
                                    </Box>
                                )}
                                <Button fullWidth variant="contained" onClick={() => setMainDialog({ ...mainDialog, open: false })} sx={{ mt: 3, borderRadius: '50px', bgcolor: '#FF5722' }}>ปิดหน้าต่าง</Button>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Container >
            <ProfileQrModal
                open={showProfileQr}
                onClose={() => setShowProfileQr(false)}
                user={user}
                lineAvatar={line_avatar ?? null}
                customerCode={customer_code}
                referralUrl={referral_url}
            />
        </MobileAuthenticatedLayout >
    );
}