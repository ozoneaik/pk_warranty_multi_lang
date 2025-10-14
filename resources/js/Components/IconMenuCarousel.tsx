import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    CircularProgress,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { usePage } from "@inertiajs/react";

interface MenuItem {
    id: number;
    title: string;
    icon_url: string;
    link: string;
    color?: string;
}

export default function IconMenuCarousel() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { auth } = usePage().props as any;
    const userPhone = auth?.user?.phone ?? "";

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await fetch("/data/menu-icons.json");
                const data = await res.json();
                setMenus(data);
            } catch (error) {
                console.error("❌ โหลดเมนูไม่สำเร็จ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenus();
    }, []);

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 400,
        slidesToShow: 4, 
        slidesToScroll: 1,
        swipeToSlide: true,
        arrows: false,
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 1, mb: 0, px: 0.5 }}>
            <Slider {...sliderSettings}>
                {menus.map((item) => {
                    const link = item.link.includes("warranty_check")
                        ? `${item.link}${userPhone}`
                        : item.link;

                    return (
                        <Box key={item.id} px={0.5}> {/* ✅ ลดระยะห่างซ้ายขวา */}
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <Card
                                    elevation={0}
                                    sx={{
                                        cursor: "pointer",
                                        textAlign: "center",
                                        boxShadow: "none",
                                        py: 0.5, // ✅ ลดความสูงภายในการ์ด
                                        borderRadius: 2,
                                        transition: "all 0.2s ease",
                                        "&:hover": { transform: "translateY(-1px)" },
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            py: 1, // ✅ ลด padding ภายใน
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 0.6, // ✅ ระยะ icon กับ title แคบลง
                                        }}
                                    >
                                        <Avatar
                                            src={item.icon_url}
                                            alt={item.title}
                                            sx={{
                                                bgcolor: item.color || "#F54927",
                                                width: 48, // ✅ ขนาด icon เล็กลง
                                                height: 48,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            fontWeight="600"
                                            textAlign="center"
                                            sx={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                fontSize: "0.8rem", // ✅ ขนาดตัวอักษรเล็กลง
                                                maxWidth: 80, // ✅ จำกัดความกว้างข้อความ
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </a>
                        </Box>
                    );
                })}
            </Slider>
        </Box>
    );
}
