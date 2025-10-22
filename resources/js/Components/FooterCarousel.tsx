import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { router, usePage } from "@inertiajs/react";
import * as MuiIcons from "@mui/icons-material";

interface MenuItem {
    id: number;
    label: string;
    route: string;
    icon: string;
}

export default function FooterCarousel() {
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
                py: 0.8,
            }}
        >
            <Slider {...sliderSettings}>
                {menus.map((item) => {
                    const isActive = route().current(item.route);
                    const IconComponent = MuiIcons[item.icon as keyof typeof MuiIcons];

                    return (
                        <Box
                            key={item.id}
                            onClick={() => router.get(route(item.route))}
                            sx={{
                                textAlign: "center",
                                cursor: "pointer",
                                color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                                transition: "0.2s",
                                "&:hover": { color: "#fff" },
                            }}
                        >
                            {IconComponent ? (
                                <IconComponent
                                    sx={{
                                        fontSize: 26,
                                        mb: 0.3,
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
                                    fontSize: "0.75rem",
                                    fontWeight: isActive ? 700 : 500,
                                    display: "block",
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