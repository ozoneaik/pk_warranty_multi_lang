import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box, Typography, Stack, Button, Container, Grid, Card, List,
    ListItemButton, ListItemIcon, ListItemText, Divider, CardContent, Avatar, Link
} from "@mui/material";
import { ChevronRight, Gavel, Logout, Shield, Edit } from "@mui/icons-material";
import { Head, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import dayjs from "dayjs";
import RewardProgress from "./RewardProgress";

export default function ScorePage() {
    const { t } = useLanguage();
    const { auth, line_avatar, point, joined_at } = usePage().props as any;
    const user = auth.user;

    // ✅ กำหนดระดับสมาชิกตาม point
    const tier =
        point > 3000
            ? "platinum"
            : point > 1000
                ? "gold"
                : "silver";

    const cardColors: Record<string, string> = {
        silver: "linear-gradient(45deg, #707070 0%, #a8a8a8 20%, #e8e8e8 40%, #ffffff 50%, #e8e8e8 60%, #a8a8a8 80%, #707070 100%)",
        gold: "linear-gradient(45deg, #8B660F 0%, #CFA525 25%, #FFF8E1 45%, #CFA525 65%, #8B660F 100%)",
        platinum: "linear-gradient(45deg, #004D40 0%, #00796B 30%, #4DB6AC 50%, #00796B 70%, #004D40 100%)",
    };

    const tierName: Record<string, string> = {
        silver: "Silver Member",
        gold: "gold Member",
        platinum: "platinum Member",
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
                        mt: { xs: 0, sm: 1 },
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
                            >
                                {/* วงกลม P พร้อม Gradient */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: { xs: 22, sm: 26 },
                                        height: { xs: 22, sm: 26 },
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'radial-gradient(circle at center, #FFEFBA 0%, #E0B45F 70%, #9F7928 100%)',
                                        // border: '2px solid transparent',
                                        backgroundImage: 'linear-gradient(#222, #222), linear-gradient(45deg, #FFEFBA 0%, #8B660F 100%)',
                                        backgroundOrigin: 'border-box',
                                        backgroundClip: 'padding-box, border-box',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        fontWeight={900}
                                        sx={{
                                            color: '#fff',
                                            fontSize: { xs: "0.9rem", sm: "1.1rem" },
                                            lineHeight: 1,
                                            userSelect: 'none',
                                        }}
                                    >
                                        P
                                    </Typography>
                                </Box>

                                {/* คะแนน */}
                                <Typography
                                    color="text.secondary"
                                    fontSize={{ xs: "0.9rem", sm: "1rem" }}
                                    fontWeight={800}
                                >
                                    {point ?? 0}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* ✅ Member Card */}
                    <Card
                        sx={{
                            mt: { xs: 2, sm: 2 },
                            borderRadius: 3,
                            border: "1px solid #d9d9d9",
                            background: cardColors[tier],
                            color: "#111",
                            transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            "&:hover": {
                                transform: "translateY(-6px) scale(1.02)",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                            },
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                sx={{ pt: { xs: 0, sm: 1 }, pb: { xs: 2, sm: 4 } }}
                                color={"white"}
                            >
                                <Box>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.5}
                                        ml={0}
                                    >
                                        {/* วงกลม P พร้อม Gradient */}
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: { xs: 22, sm: 26 }, 
                                                height: { xs: 22, sm: 26 }, 
                                                borderRadius: '50%', 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'radial-gradient(circle at center, #FFEFBA 0%, #E0B45F 70%, #9F7928 100%)',
                                                // border: '2px solid transparent',
                                                backgroundImage: 'linear-gradient(#222, #222), linear-gradient(45deg, #FFEFBA 0%, #8B660F 100%)',
                                                backgroundOrigin: 'border-box',
                                                backgroundClip: 'padding-box, border-box',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                fontWeight={900}
                                                sx={{
                                                    color: '#fff',
                                                    fontSize: { xs: "0.9rem", sm: "1.1rem" },
                                                    lineHeight: 1,
                                                    userSelect: 'none',
                                                }}
                                            >
                                                P
                                            </Typography>
                                        </Box>

                                        {/* คะแนน */}
                                        <Typography
                                            color="text.secondary"
                                            fontSize={{ xs: "1rem", sm: "1rem" }}
                                            fontWeight={800}
                                            sx={{
                                                color: '#fff',
                                                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                                            }}
                                        >
                                            {point ?? 0}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        fontSize={{ xs: "0.7rem", sm: "0.8rem" }}
                                        color="text.secondary"
                                        sx={{
                                            color: '#333',
                                        }}
                                    >
                                        Member Since :{" "}
                                        {dayjs(joined_at).format("D MMM YYYY")}
                                    </Typography>
                                    {/* <Typography
                                        mt={1}
                                        fontWeight={700}
                                        fontSize={{ xs: "0.9rem", sm: "1rem" }}
                                        color="#000"
                                    >
                                        {tierName[tier]}
                                    </Typography> */}
                                </Box>
                                <Box
                                    component="img"
                                    src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
                                    alt="Pumpkin"
                                    sx={{
                                        height: { xs: 30, sm: 35, md: 40 },
                                        opacity: 1,
                                        mt: { xs: 10, sm: 12 },
                                    }}
                                />
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Progress Section */}
                    <RewardProgress
                        cardColors={{
                            silver: "linear-gradient(45deg, #707070 0%, #a8a8a8 20%, #e8e8e8 40%, #ffffff 50%, #e8e8e8 60%, #a8a8a8 80%, #707070 100%)",
                            gold: "linear-gradient(45deg, #8B660F 0%, #CFA525 25%, #FFF8E1 45%, #CFA525 65%, #8B660F 100%)", 
                            platinum: "linear-gradient(45deg, #004D40 0%, #00796B 30%, #4DB6AC 50%, #00796B 70%, #004D40 100%)", 

                        }}
                        point={point}
                        joined_at={joined_at}
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
                            ตั้งค่า
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
                                        primary="PDPA"
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
                                        primary="Term And Condition"
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
                                        primary="ออกจากระบบ"
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
        </MobileAuthenticatedLayout>
    );
}
