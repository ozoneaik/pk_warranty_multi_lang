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
import { useLanguage } from "@/context/LanguageContext";

interface MenuItem {
  id: number;
  title: {
    th: string;
    en: string;
    lao: string;
    myanmar: string;
  };
  icon_url: string;
  link: string;
  color?: string;
}

export default function IconMenuCarousel() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = usePage().props as any;
  const { language } = useLanguage();
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
    <Box sx={{ mt: 1, mb: 0, px: 0 }}>
      <Slider {...sliderSettings}>
        {menus.map((item) => {
          const link = item.link.includes("warranty_check")
            ? `${item.link}${userPhone}`
            : item.link;

          const title = item.title?.[language] || item.title.th; 

          return (
            <Box key={item.id} px={0}>
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
                    py: 0,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": { transform: "translateY(-1px)" },
                  }}
                >
                  <CardContent
                    sx={{
                      py: 1.6,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      minHeight: 100,
                    }}
                  >
                    <Avatar
                      src={item.icon_url}
                      alt={title}
                      sx={{
                        bgcolor: item.color || "#F54927",
                        width: 42,
                        height: 42,
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      textAlign="center"
                      sx={{
                        whiteSpace: "normal",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        fontSize: "0.73rem",
                        maxWidth: 80,
                        lineHeight: 1.2,
                      }}
                    >
                      {title}
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
