import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Typography, Stack, Button, Container, Grid, Card, List,
    ListItemButton, ListItemIcon, ListItemText, Divider, CardContent, Avatar, Link, Fade
} from "@mui/material";
import { ChevronRight, Gavel, Logout, Shield, Edit, WorkspacePremium, Stars } from "@mui/icons-material";

import { Head, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import dayjs from "dayjs";
import RewardProgress from "./CardTiers/RewardProgress";
import CardPreviewDialog from "./CardTiers/CardPreviewDialog";
import React from "react";
import PointExpiryModal from "../Partials/PointExpiryModal";
import { ChevronRightIcon } from "lucide-react";
import { keyframes, styled } from "@mui/system";

/** ===== Animations for Premium Card ===== */
const sheenMove = keyframes`
  0%   { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
  20%  { opacity: 0.5; }
  50%  { opacity: 0.8; }
  80%  { opacity: 0.5; }
  100% { transform: translateX(250%) skewX(-20deg); opacity: 0; }
`;

const meshMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

export default function ScorePage() {
    const { t } = useLanguage();
    const { auth, line_avatar, point, joined_at, tier, tier_expired_at } = usePage().props as any;
    const user = auth.user;
    const [openPreview, setOpenPreview] = React.useState(false);
    const [openPointModal, setOpenPointModal] = React.useState(false);
    const cardThemes: Record<string, { main: string, mesh: string, text: string, accent: string, badgeBg: string, label: string, iconColor: string }> = {
        silver: {
            main: "linear-gradient(135deg, #757575 0%, #C2C2C2 35%, #FDFDFD 50%, #D9D9D9 65%, #757575 100%)",
            mesh: "radial-gradient(at 0% 0%, rgba(255,255,255,0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0,0,0,0.05) 0, transparent 50%)",
            text: "#2c3e50",
            accent: "#757575",
            badgeBg: "rgba(0,0,0,0.05)",
            label: t.Score.tiers.silver,
            iconColor: "#757575"
        },

        gold: {
            main: "linear-gradient(135deg, #8B660F 0%, #CFA525 20%, #FFF8E1 40%, #D4AF37 50%, #C8A02E 60%, #B8860B 80%, #996515 100%)",
            mesh: "radial-gradient(at 0% 0%, rgba(255,255,255,0.4) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(255,215,0,0.3) 0, transparent 50%)",
            text: "#111",
            accent: "#D4AF37",
            badgeBg: "rgba(0,0,0,0.1)",
            label: t.Score.tiers.gold,
            iconColor: "#D4AF37"
        },
        platinum: {
            main: "linear-gradient(135deg, #004d40 0%, #00796b 25%, #26a69a 50%, #00796b 75%, #004d40 100%)",
            mesh: "radial-gradient(at 0% 0%, rgba(255,255,255,0.3) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0,0,0,0.4) 0, transparent 50%)",
            text: "white",
            accent: "#26a69a",
            badgeBg: "rgba(255,255,255,0.1)",
            label: t.Score.tiers.platinum,
            iconColor: "#26a69a"
        },
    };

    return (
        <MobileAuthenticatedLayout title={t.Score.title}>
            <Head title={t.Score.title} />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    bgcolor: "#fafafa",
                }}
            >
                <Container
                    maxWidth="sm"
                    sx={{
                        flexGrow: 1,
                        py: { xs: 1, sm: 1 },
                        mt: { xs: 8, sm: 8 },
                        borderRadius: 3,
                        px: { xs: 1, sm: 1 },
                    }}
                >
                    {/* Profile Section */}
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
                        <Avatar
                            src={line_avatar || "https://via.placeholder.com/64"}
                            sx={{
                                width: { xs: 56, sm: 64, md: 72 },
                                height: { xs: 56, sm: 64, md: 72 },
                            }}
                        />
                        <Box flex={1}>
                            <Box display="flex" gap={1} alignItems="center">
                                <Typography
                                    fontWeight={700}
                                    fontSize={{ xs: "1rem", sm: "1.2rem", md: "1.3rem" }}
                                    ml={1}
                                >
                                    {user.name}
                                </Typography>
                                <Link href={route("customer.profile.edit")}>
                                    <Edit sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                </Link>
                            </Box>

                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                ml={1}
                                onClick={() => setOpenPointModal(true)}
                            >
                                {/* วงกลม P พร้อม Gradient */}
                                <Box
                                    sx={{ display: "flex", alignItems: "center", paddingTop: 0.5 }}
                                >
                                    <Typography
                                        variant="caption"
                                        fontWeight={900}
                                        sx={{
                                            // color: '#fff',
                                            color: "black",
                                            fontSize: { xs: "0.9rem", sm: "0.9rem" },
                                            lineHeight: 1,
                                            userSelect: 'none',
                                        }}
                                    >
                                        <WorkspacePremium sx={{ color: "#F5B301" }} />
                                    </Typography>
                                    {/* คะแนน */}
                                    <Typography
                                        sx={{ color: "#F5B301" }}
                                        fontSize={{ xs: "0.9rem", sm: "1rem" }}
                                        fontWeight={800}
                                    >
                                        {point ?? 0} {t.Score.pts}
                                    </Typography>
                                    {/* <ChevronRightIcon size={20} color="#F55014" /> */}
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* ✅ Member Card */}
                    <Card
                        onClick={() => setOpenPreview(true)}
                        sx={{
                            mt: { xs: 3, sm: 3 },
                            borderRadius: 4,
                            position: "relative",
                            overflow: "hidden",
                            background: cardThemes[tier].main,
                            color: cardThemes[tier].text,
                            transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.15), inset 0 0 100px rgba(255,255,255,0.5)",
                            border: "none",

                            "&::before": {
                                content: '""',
                                position: "absolute",
                                inset: 0,
                                background: tier === "silver" 
                                    ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"), ${cardThemes[tier].mesh}`
                                    : cardThemes[tier].mesh,
                                opacity: tier === "silver" ? 0.2 : 1,
                                backgroundSize: tier === "silver" ? "150px, 200% 200%" : "200% 200%",
                                animation: tier === "silver" ? "none" : `${meshMove} 10s ease infinite`,
                                pointerEvents: "none",
                            },

                            "&::after": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 80%)",
                                backgroundSize: "200% 100%",
                                animation: `${sheenMove} 4s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                                pointerEvents: "none",
                            },
                            "&:hover": {
                                transform: "translateY(-6px)",
                                boxShadow: "0 15px 30px rgba(0,0,0,0.25)",
                            },
                        }}
                    >

                        <CardContent sx={{ p: { xs: 2, sm: 2 }, position: "relative", zIndex: 1 }}>
                            <Stack spacing={3}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography
                                            variant="overline"
                                            sx={{
                                                color: cardThemes[tier].text,
                                                opacity: 0.7,
                                                fontWeight: 700,
                                                letterSpacing: 1.5,
                                                display: "block",
                                                mb: -0.5
                                            }}
                                        >
                                            {t.Score.membershipTitle}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            fontWeight={900}
                                            sx={{
                                                color: cardThemes[tier].text,
                                                textShadow: tier === "silver" ? "none" : "0 2px 4px rgba(0,0,0,0.2)",
                                                fontSize: { xs: "1.5rem", sm: "1.75rem" }
                                            }}
                                        >
                                            {cardThemes[tier].label}
                                        </Typography>
                                    </Box>

                                    <Box
                                        component="img"
                                        src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
                                        alt="Pumpkin"
                                        sx={{
                                            height: { xs: 28, sm: 32 },
                                            opacity: 0.9
                                        }}
                                    />
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                                    <Box
                                        sx={{
                                            bgcolor: cardThemes[tier].badgeBg,
                                            px: 2,
                                            py: 1,
                                            borderRadius: "16px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            border: tier === "silver" ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.1)"
                                        }}
                                    >
                                        <WorkspacePremium sx={{ color: cardThemes[tier].iconColor, fontSize: 24 }} />
                                        <Typography fontWeight={800} sx={{ color: cardThemes[tier].text, fontSize: "1.1rem" }}>
                                            {point?.toLocaleString() ?? 0} <Box component="span" sx={{ fontSize: "0.8rem", opacity: 0.7 }}>{t.Score.pts}</Box>
                                        </Typography>
                                    </Box>

                                    {/* <Fade in={true}>
                                        <Box
                                            sx={{
                                                bgcolor: (tier === "platinum") ? "#fff" : (tier === "silver" ? "#2c3e50" : "#463300"),
                                                color: "#fff",
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: "20px",
                                                fontSize: "0.65rem",
                                                fontWeight: 900,
                                                textTransform: "uppercase",
                                                letterSpacing: 0.5,
                                                animation: `${pulse} 2s ease-in-out infinite`
                                            }}
                                        >
                                            Active Level
                                        </Box>
                                    </Fade> */}
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                                    <Box>
                                        <Typography
                                            sx={{
                                                color: cardThemes[tier].text,
                                                opacity: 0.6,
                                                fontSize: "0.65rem",
                                                fontWeight: 600,
                                                mb: 0.2
                                            }}
                                        >
                                            {t.Score.memberSince}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: cardThemes[tier].text,
                                                fontWeight: 700,
                                                fontSize: "0.85rem"
                                            }}
                                        >
                                            {dayjs(joined_at).format("D MMM YYYY")}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                            sx={{
                                                color: cardThemes[tier].text,
                                                opacity: 0.6,
                                                fontSize: "0.65rem",
                                                fontWeight: 600,
                                                mb: 0.2
                                            }}
                                        >
                                           {t.Score.expireDate}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: cardThemes[tier].text,
                                                fontWeight: 700,
                                                fontSize: "0.85rem"
                                            }}
                                        >
                                            {tier_expired_at ? dayjs(tier_expired_at).format("D MMM YYYY") : "-"}
                                        </Typography>
                                    </Box>

                                    {tier !== "silver" && (
                                        <Box sx={{ opacity: 0.8 }}>
                                            <Stars sx={{ color: cardThemes[tier].accent, fontSize: 32 }} />
                                        </Box>
                                    )}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Progress Section */}
                    <RewardProgress
                        cardColors={{
                            silver: cardThemes.silver.main,
                            gold: cardThemes.gold.main,
                            platinum: cardThemes.platinum.main
                        }}
                        point={point}
                        joined_at={joined_at}
                        tier_expired_at={tier_expired_at}
                        tier={tier}
                    />

                    {/* Reward Banner */}
                    <Box
                        sx={{
                            mt: { xs: 2, sm: 3 },
                            mb: { xs: 1, sm: 1 },
                            borderRadius: 3,
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            component="img"
                            src="https://rewarding-rocket.s3.ap-southeast-1.amazonaws.com/1743759942038-img_v3_02l1_6c9c4f8a-acb7-455a-9012-582d499e89fh.jpg"
                            alt="Reward Banner"
                            sx={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                            }}
                        />
                    </Box>

                    {/* Settings */}
                    <Box sx={{ mt: { xs: 4 }, mb: { xs: 8, sm: 10 }, px: { xs: 2, sm: 1 } }}>
                        <Typography fontWeight={700} sx={{ mb: 1 }} fontSize={{ xs: "0.95rem", sm: "1rem" }}>
                            {t.Score.settings}
                        </Typography>
                        <Card
                            sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: 0,
                                border: "1px solid #eee",
                            }}
                        >
                            <List disablePadding>
                                <ListItemButton
                                    onClick={() => router.get(route("customer.profile.info.pdpa"))}
                                    sx={{ py: { xs: 1.5, sm: 2 } }}
                                >
                                    <ListItemIcon>
                                        <Shield sx={{ color: "#F54927", fontSize: { xs: 22, sm: 24 } }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t.Score.pdpa}
                                        primaryTypographyProps={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                                    />
                                </ListItemButton>
                                <Divider />
                                <ListItemButton
                                    onClick={() => router.get(route("customer.profile.info.term"))}
                                    sx={{ py: { xs: 1.5, sm: 2 } }}
                                >
                                    <ListItemIcon>
                                        <Gavel sx={{ color: "#F54927", fontSize: { xs: 22, sm: 24 } }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t.Score.terms}
                                        primaryTypographyProps={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                                    />
                                </ListItemButton>
                                <Divider />
                                <ListItemButton
                                    onClick={() => router.post(route("logout"))}
                                    sx={{ py: { xs: 1.5, sm: 2 } }}
                                >
                                    <ListItemIcon>
                                        <Logout sx={{ color: "#F54927", fontSize: { xs: 22, sm: 24 } }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t.Score.logout}
                                        primaryTypographyProps={{
                                            color: "#F54927",
                                            fontWeight: 600,
                                            fontSize: { xs: "0.9rem", sm: "1rem" },
                                        }}
                                    />
                                </ListItemButton>
                            </List>
                        </Card>
                    </Box>
                </Container>
            </Box>
            <CardPreviewDialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                activeTier={tier as "silver" | "gold" | "platinum"}
                point={point ?? 0}
                joined_at={joined_at}
                cardColors={{
                    silver: cardThemes.silver.main,
                    gold: cardThemes.gold.main,
                    platinum: cardThemes.platinum.main
                }}
            />
            <PointExpiryModal
                open={openPointModal}
                onClose={() => setOpenPointModal(false)}
            />
        </MobileAuthenticatedLayout>
    );
}
