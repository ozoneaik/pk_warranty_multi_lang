import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Typography, Stack, Button, Container, Grid, Card, List, ListItemButton, ListItemIcon, ListItemText, Divider, CardContent, Avatar, Link } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Head, router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronRight, Gavel, Logout, Shield, Edit, Flare } from "@mui/icons-material";
import dayjs from "dayjs";

export default function ScorePage() {
    const { t } = useLanguage();
    const { auth, line_avatar, point, joined_at } = usePage().props as any;
    console.log("score", point);
    const user = auth.user;
    console.log("user", user);
    // const { user } = usePage().props.auth as any;
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
                    {/* User Profile Section */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={{ xs: 1, sm: 2 }}
                    >
                        <Avatar
                            src={line_avatar || "https://via.placeholder.com/64"}
                            sx={{
                                width: { xs: 56, sm: 64, md: 72 },
                                height: { xs: 56, sm: 64, md: 72 },
                            }}
                        />
                        <Box flex={1}>
                            <Box display={"flex"} gap={1} alignItems="center">
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

                            <Typography
                                color="text.secondary"
                                fontSize={{ xs: "0.9rem", sm: "1rem" }}
                                ml={1}
                                fontWeight={700}
                            >
                                {point ?? 0} P
                            </Typography>
                        </Box>
                    </Stack>
                    <Card
                        sx={{
                            mt: { xs: 2, sm: 2 },
                            borderRadius: 3,
                            border: "1px solid #d9d9d9",
                            background:
                                "linear-gradient(45deg, #999 5%, #fff 10%, #ccc 30%, #ddd 50%, #ccc 70%, #fff 80%, #999 95%)",
                            "&:hover": {
                                transform: "translateY(-2px)",
                            }
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                sx={{ pt: { xs: 0, sm: 1 }, pb: { xs: 2, sm: 4 } }}
                            >
                                <Box>
                                    <Typography
                                        fontSize={{ xs: "1rem", sm: "1.2rem", md: "1.4rem" }}
                                        fontWeight={700}
                                    >
                                        {point ?? 0} P
                                    </Typography>
                                    <Typography
                                        fontSize={{ xs: "0.7rem", sm: "0.8rem" }}
                                        color="text.secondary"
                                    >
                                        Member Since :{" "}
                                        {dayjs(joined_at).format("D MMM YYYY")}
                                    </Typography>
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

                    {/* Image Banner Section */}
                    <Box
                        sx={{
                            mt: { xs: 2, sm: 3 }, // เว้นระยะห่างด้านบนจาก Card คะแนน
                            mb: { xs: 1, sm: 1 }, // เว้นระยะห่างด้านล่างจาก Settings
                            borderRadius: 3,
                            overflow: "hidden", // เพื่อให้รูปภาพไม่เกินขอบโค้ง
                        }}
                    >
                        <Box
                            component="img"
                            src="https://rewarding-rocket.s3.ap-southeast-1.amazonaws.com/1743759942038-img_v3_02l1_6c9c4f8a-acb7-455a-9012-582d499e89fh.jpg"
                            alt="Reward Banner"
                            sx={{
                                width: "100%", // ให้รูปภาพเต็มความกว้างของ Box
                                height: "auto", // รักษาสัดส่วนของรูปภาพ
                                display: "block",
                            }}
                        />
                    </Box>
                    {/* End Image Banner Section */}

                    {/* Coupons & Privileges Cards */}
                    {/* <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mt: 2 }}
                    >
                        
                        <Card
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                textAlign: "center",
                                py: { xs: 1.5, sm: 2 },
                            }}
                        >
                            <Box
                                display="flex"
                                sx={{
                                    justifyContent: "left",
                                    alignItems: "flex-end",
                                    padding: { xs: "8px", sm: "10px" },
                                    paddingLeft: { xs: "10px", sm: "12px" },
                                    gap: "6px",
                                }}
                            >
                                <Typography
                                    color="#F54927"
                                    fontWeight={700}
                                    fontSize={{ xs: "1.8rem", sm: "2rem", md: "2.2rem" }}
                                    lineHeight={1}
                                >
                                    0
                                </Typography>
                                <Typography
                                    fontSize={{ xs: "0.9rem", sm: "1rem" }}
                                    sx={{ pb: 0.3 }}
                                >
                                    คูปอง
                                </Typography>
                            </Box>
                            <Typography
                                color="text.secondary"
                                fontSize={{ xs: "0.75rem", sm: "0.8rem" }}
                                display="flex"
                                justifyContent="left"
                                alignItems="center"
                                paddingLeft={2}
                                gap={0.3}
                                fontWeight={800}
                            >
                                <button
                                    onClick={() => alert("อยู่ระหว่างการพัฒนา")}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: 0,
                                        color: "inherit"
                                    }}
                                >
                                    ดูเพิ่มเติม <ChevronRight fontSize="small" />
                                </button>
                            </Typography>
                        </Card>

                    
                        <Card
                            sx={{
                                flex: 1,
                                borderRadius: 3,
                                textAlign: "center",
                                py: { xs: 1.5, sm: 2 },
                            }}
                        >
                            <Box
                                display="flex"
                                sx={{
                                    justifyContent: "left",
                                    alignItems: "flex-end",
                                    padding: { xs: "8px", sm: "10px" },
                                    paddingLeft: { xs: "10px", sm: "12px" },
                                    gap: "6px",
                                }}
                            >
                                <Typography
                                    color="#F54927"
                                    fontWeight={700}
                                    fontSize={{ xs: "1.8rem", sm: "2rem", md: "2.2rem" }}
                                    lineHeight={1}
                                >
                                    0
                                </Typography>
                                <Typography
                                    fontSize={{ xs: "0.9rem", sm: "1rem" }}
                                    sx={{ pb: 0.3 }}
                                >
                                    สิทธิพิเศษ
                                </Typography>
                            </Box>
                            <Typography
                                color="text.secondary"
                                fontSize={{ xs: "0.75rem", sm: "0.8rem" }}
                                display="flex"
                                justifyContent="left"
                                alignItems="center"
                                gap={0.3}
                                paddingLeft={2}
                                fontWeight={800}
                            >
                                <button
                                    onClick={() => alert("อยู่ระหว่างการพัฒนา")}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: 0,
                                        color: "inherit"
                                    }}
                                >
                                    ดูเพิ่มเติม <ChevronRight fontSize="small" />
                                </button>
                            </Typography>
                        </Card>
                    </Stack> */}

                    {/* Settings Section */}
                    <Box
                        sx={{
                            mt: { xs: 4, sm: 4 },
                            mb: { xs: 8, sm: 10 },
                            px: { xs: 2, sm: 1 },
                        }}
                    >
                        <Typography
                            fontWeight={700}
                            sx={{ mb: 1 }}
                            fontSize={{ xs: "0.95rem", sm: "1rem" }}
                        >
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
                                    onClick={() =>
                                        router.get(route("customer.profile.info.pdpa"))
                                    }
                                    sx={{ py: { xs: 1.5, sm: 2 } }}
                                >
                                    <ListItemIcon>
                                        <Shield
                                            sx={{
                                                color: "#F54927",
                                                fontSize: { xs: 22, sm: 24 },
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="PDPA"
                                        primaryTypographyProps={{
                                            fontSize: { xs: "0.9rem", sm: "1rem" },
                                        }}
                                    />
                                </ListItemButton>
                                <Divider />
                                <ListItemButton
                                    onClick={() =>
                                        router.get(route("customer.profile.info.term"))
                                    }
                                    sx={{ py: { xs: 1.5, sm: 2 } }}
                                >
                                    <ListItemIcon>
                                        <Gavel
                                            sx={{
                                                color: "#F54927",
                                                fontSize: { xs: 22, sm: 24 },
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Term And Condition"
                                        primaryTypographyProps={{
                                            fontSize: { xs: "0.9rem", sm: "1rem" },
                                        }}
                                    />
                                </ListItemButton>
                                <Divider />
                                <ListItemButton
                                    onClick={() => router.post(route("logout"))}
                                    sx={{ py: { xs: 1.5, sm: 2 } }}
                                >
                                    <ListItemIcon>
                                        <Logout
                                            sx={{
                                                color: "#F54927",
                                                fontSize: { xs: 22, sm: 24 },
                                            }}
                                        />
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