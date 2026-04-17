import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { router, usePage } from "@inertiajs/react";
import * as MuiIcons from "@mui/icons-material";
import { useLanguage } from "@/context/LanguageContext";

interface MenuItem {
    id: number;
    label: string;
    route: string;
    url?: string;
    icon: string;
}

export default function FooterCarousel() {
    const { t, language } = useLanguage();
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { url } = usePage();

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await fetch("/data/menu-footer.json");
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
        slidesToShow: 5,
        slidesToScroll: 1,
        swipeToSlide: true,
        arrows: false,
    };

    if (loading) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    bottom: 0,
                    width: "100%",
                    maxWidth: 500,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#F54927",
                    py: 2,
                    textAlign: "center",
                }}
            >
                <CircularProgress size={20} sx={{ color: "#fff" }} />
            </Box>
        );
    }

    return (
        <Box
            key={language}
            sx={{
                position: "fixed",
                bottom: 0,
                width: "100%",
                maxWidth: 500,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#F54927",
                borderTopLeftRadius: { md: "25px" },
                borderTopRightRadius: { md: "25px" },
                boxShadow: "0 -3px 8px rgba(0,0,0,0.1)",
                zIndex: (theme) => theme.zIndex.drawer + 1,
                py: 0,
            }}
        >
            <Slider {...sliderSettings}>
                {menus.map((item) => {
                    const isActive = item.route ? route().current(item.route) : false;
                    const IconComponent = MuiIcons[item.icon as keyof typeof MuiIcons];

                    return (
                        <Box
                            key={item.id}
                            onClick={() => {
                                if (item.url) {
                                    window.open(item.url, "_blank");
                                } else if (item.route) {
                                    router.get(route(item.route));
                                }
                            }}
                            sx={{
                                textAlign: "center",
                                cursor: "pointer",
                                color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                                transition: "0.2s",
                                "&:hover": { color: "#fff" },
                                // เพิ่มส่วนนี้เพื่อให้แน่ใจว่า content ภายในกึ่งกลางจริงๆ
                                display: "flex !important",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                outline: "none", // ลบเส้นขอบเวลาคลิก (slick-slide)
                                minHeight: "60px", // กำหนดความสูงขั้นต่ำให้เท่ากันทุกเมนู
                            }}
                        >
                            {IconComponent ? (
                                <IconComponent
                                    sx={{
                                        fontSize: 26,
                                        mb: 0.5,
                                        color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: 26,
                                        height: 26,
                                        mb: 0.3,
                                        backgroundColor: "rgba(255,255,255,0.3)",
                                        borderRadius: "50%",
                                    }}
                                />
                            )}
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: "0.62rem",
                                    fontWeight: isActive ? 700 : 500,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    wordBreak: "break-word",
                                    lineHeight: 1.2,
                                    px: 0.1,
                                }}
                            >
                                {item.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Slider>
        </Box>
    );
}