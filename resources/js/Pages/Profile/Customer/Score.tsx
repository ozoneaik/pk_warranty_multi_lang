import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Typography, Stack, Button, Container, Grid, Card, List, ListItemButton, ListItemIcon, ListItemText, Divider, CardContent, Avatar, Link } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Head, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronRight, Gavel, Logout, Shield, Edit, Flare } from "@mui/icons-material";
import dayjs from "dayjs";


export default function ScorePage() {
    const { t } = useLanguage();
    const { user } = usePage().props.auth as any;
    return (
        <MobileAuthenticatedLayout title={t.Score.title}>
            <Head title={t.Score.title} />
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    // background: "#fbe9e7",
                    pt: 2,
                    marginTop: 0
                }}
            >
                <Container maxWidth="md" sx={{ py: 2, mt: 10, mb: 10, borderRadius: 3, background: "#fafafa", padding: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                            src={user.avatar || "https://via.placeholder.com/64"}
                            sx={{ width: 64, height: 64, border: "2px solid #F54927" }}
                        />
                        <Box flex={1}>
                            <Box
                                display={"flex"}
                                gap={1}
                            >
                                <Typography fontWeight={700} fontSize={"1.2rem"} ml={1}>{user.name}</Typography>
                                <Link href={route('customer.profile.edit')}>
                                    <Edit />
                                </Link>
                            </Box>

                            <Typography color="text.secondary" fontSize="1rem" ml={1} fontWeight={700}>
                                {/* {user.points}  */}
                                999 คะแนน
                            </Typography>
                        </Box>
                    </Stack>

                    <Card
                        sx={{
                            mt: 3,
                            borderRadius: 3,
                            background:
                                "linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)",
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                sx={{ pt: 3, pb: 10 }}
                            >
                                <Box>
                                    <Typography fontSize="1.2rem" fontWeight={700}>
                                        999 P
                                    </Typography>
                                    <Typography fontSize="0.8rem" color="text.secondary">
                                        Member Since : {dayjs(user.created_at).format("D MMM YYYY")}
                                    </Typography>
                                </Box>
                                <Box
                                    component="img"
                                    src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
                                    alt="Pumpkin"
                                    sx={{ height: 35, opacity: 0.8 }}
                                />
                            </Stack>
                        </CardContent>
                    </Card>

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        {/* 🔹 คูปอง */}
                        <Card
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                textAlign: "center",
                                py: 1.5,
                            }}
                        >
                            <Box
                                display="flex"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "flex-end",
                                    padding: "10px",
                                    gap: "6px",
                                }}
                            >
                                <Typography
                                    color="#F54927"
                                    fontWeight={700}
                                    fontSize="2rem"
                                    lineHeight={1}
                                >
                                    0
                                </Typography>
                                <Typography fontSize="1rem" sx={{ pb: 0.3 }}>
                                    คูปอง
                                </Typography>
                            </Box>
                            <Typography
                                color="text.secondary"
                                fontSize="0.8rem"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                gap={0.3}
                            >
                                <button onClick={() => alert("อยู่ระหว่างการพัฒนา")}>ดูเพิ่มเติม <ChevronRight fontSize="small" /></button>
                            </Typography>
                        </Card>

                        {/* 🔹 สิทธิพิเศษ */}
                        <Card
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                textAlign: "center",
                                py: 1.5,
                            }}
                        >
                            <Box
                                display="flex"
                                sx={{
                                    justifyContent: "center",
                                    alignItems: "flex-end",
                                    padding: "10px",
                                    gap: "6px",
                                }}
                            >
                                <Typography
                                    color="#F54927"
                                    fontWeight={700}
                                    fontSize="2rem"
                                    lineHeight={1}
                                >
                                    0
                                </Typography>
                                <Typography fontSize="1rem" sx={{ pb: 0.3 }}>
                                    สิทธิพิเศษ
                                </Typography>
                            </Box>
                            <Typography
                                color="text.secondary"
                                fontSize="0.8rem"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                gap={0.3}
                            >
                                <button onClick={() => alert("อยู่ระหว่างการพัฒนา")}>ดูเพิ่มเติม <ChevronRight fontSize="small" /></button>
                            </Typography>
                        </Card>
                    </Stack>

                    <Box sx={{ mt: 6 }}>
                        <Typography fontWeight={700} sx={{ mb: 1 }}>
                            ตั้งค่า
                        </Typography>
                        <Card
                            sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            <List disablePadding>
                                <ListItemButton onClick={() => alert("อยู่ระหว่างการพัฒนา")}>
                                    <ListItemIcon>
                                        <Shield sx={{ color: "#F54927" }} />
                                    </ListItemIcon>
                                    <ListItemText primary="PDPA" />
                                </ListItemButton>
                                <Divider />
                                <ListItemButton onClick={() => alert("อยู่ระหว่างการพัฒนา")}>
                                    <ListItemIcon>
                                        <Gavel sx={{ color: "#F54927" }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Term And Condition" />
                                </ListItemButton>
                                <Divider />

                                <ListItemButton onClick={() => router.post(route('logout'))}>
                                    <ListItemIcon>
                                        <Logout sx={{ color: "#F54927" }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="ออกจากระบบ"
                                        primaryTypographyProps={{ color: "#F54927", fontWeight: 600 }}
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
