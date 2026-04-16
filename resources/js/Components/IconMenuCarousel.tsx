import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Badge,
  keyframes,
} from "@mui/material";
import { NotificationsActive } from "@mui/icons-material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { router, usePage } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";

const shakeAnimation = keyframes`
  0% { transform: rotate(0deg); }
  5% { transform: rotate(15deg); }
  10% { transform: rotate(-10deg); }
  15% { transform: rotate(15deg); }
  20% { transform: rotate(-10deg); }
  25% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

interface MenuItem {
  id: number;
  title: string;
  icon_url: string;
  link: string;
  color?: string;
}

interface IconMenuCarouselProps {
  onCheckinClick: () => void;
  notificationsCount?: number;
  onNotificationClick?: () => void;
}

export default function IconMenuCarousel({
  onCheckinClick,
  notificationsCount = 0,
  onNotificationClick,
}: IconMenuCarouselProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = usePage().props as any;
  const { language, t } = useLanguage();
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
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: 5.5,
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
    <Box key={language} sx={{ mt: 1, mb: 0, px: 0 }}>
      <Slider {...sliderSettings}>
        {menus.map((item) => {
          const isCheckinMenu = item.title === "checkin" || item.link === "checkin";
          const link = item.link.includes("warranty_check")
            ? `${item.link}${userPhone}`
            : item.link;

          const title = (t.iconMenu as any)[item.title] || item.title;

          return (
            <Box key={item.id} px={0}>
              <Box
                onClick={() => {
                  if (isCheckinMenu && onNotificationClick) {
                    onNotificationClick();
                  } else if (isCheckinMenu) {
                    onCheckinClick();
                  } else if (item.link.startsWith("/")) {
                    router.visit(item.link);
                  } else {
                    const finalLink = item.link.includes("warranty_check")
                      ? `${item.link}${userPhone}`
                      : item.link;
                    window.open(finalLink, "_blank");
                  }
                }}
                sx={{ cursor: "pointer" }}
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
                      py: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      minHeight: 100,
                    }}
                  >
                    {isCheckinMenu ? (
                      <Badge badgeContent={notificationsCount} color="error">
                        <Avatar
                          sx={{
                            bgcolor: "#ee5c3fff",
                            width: 42,
                            height: 42,
                            mb: 1,
                          }}
                        >
                          <NotificationsActive
                            sx={{
                              fontSize: 22,
                              color: "#fff",
                              animation:
                                notificationsCount > 0
                                  ? `${shakeAnimation} 2.5s infinite ease-in-out`
                                  : "none",
                              transformOrigin: "top center",
                            }}
                          />
                        </Avatar>
                      </Badge>
                    ) : (
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
                    )}
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
                        fontSize: "0.70rem",
                        maxWidth: 100,
                        lineHeight: 1.2,
                      }}
                    >
                      {title}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
}
