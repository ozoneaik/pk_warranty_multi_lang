import * as React from "react";
import {
    Box,
    Card,
    CardContent,
    Dialog,
    IconButton,
    MobileStepper,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
    Fade,
} from "@mui/material";
import { Close, ChevronLeft, ChevronRight, WorkspacePremium, Stars } from "@mui/icons-material";
import dayjs from "dayjs";
import { keyframes, styled } from "@mui/system";

type Tier = "silver" | "gold" | "platinum";

interface CardPreviewDialogProps {
    open: boolean;
    onClose: () => void;
    activeTier: Tier;
    point: number;
    joined_at: string;
    cardColors: Record<Tier, string>;
}

/** ===== Animations ===== */
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

const stepBump = keyframes`
  0%   { transform: scale(0.95); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const GlassBox = styled(Box)(({ theme }) => ({
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(8px)",
    borderRadius: "12px",
    padding: "4px 12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
}));

const CardPreviewDialog: React.FC<CardPreviewDialogProps> = ({
    open,
    onClose,
    activeTier,
    point,
    joined_at,
    cardColors,
}) => {
    const tiers: Tier[] = ["silver", "gold", "platinum"];
    const startIndex = Math.max(0, tiers.indexOf(activeTier));
    const [step, setStep] = React.useState(startIndex);

    React.useEffect(() => {
        if (open) setStep(startIndex);
    }, [activeTier, open, startIndex]);

    const theme = useTheme();
    const maxSteps = tiers.length;

    const touchRef = React.useRef<{ x: number | null }>({ x: null });
    const onTouchStart = (e: React.TouchEvent) => {
        touchRef.current.x = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchRef.current.x == null) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        if (Math.abs(dx) > 50) {
            if (dx < 0 && step < maxSteps - 1) setStep(step + 1);
            if (dx > 0 && step > 0) setStep(step - 1);
        }
        touchRef.current.x = null;
    };

    const TierCard = (tierKey: Tier) => {
        const isOwnTier = tierKey === activeTier;
        const isSilver = tierKey === "silver";

        // Colors configuration
        const colors = {
            silver: {
                main: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%)",
                mesh: "radial-gradient(at 0% 0%, rgba(0,0,0,0.05) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0,0,0,0.02) 0, transparent 50%)",
                text: "#2c3e50",
                accent: "#7f8c8d",
                badgeBg: "rgba(0,0,0,0.05)",
                label: "Silver Member",
                iconColor: "#7f8c8d"
            },



            gold: {
                main: "linear-gradient(135deg, #8B660F 0%, #CFA525 20%, #FFF8E1 40%, #D4AF37 50%, #C8A02E 60%, #B8860B 80%, #996515 100%)",
                mesh: "radial-gradient(at 0% 0%, rgba(255,255,255,0.4) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(255,215,0,0.3) 0, transparent 50%)",
                text: "#463300",
                accent: "#fff",
                badgeBg: "rgba(0,0,0,0.15)",
                label: "Gold Member",
                iconColor: "#8B660F"
            },
            platinum: {
                main: "linear-gradient(135deg, #004d40 0%, #00796b 25%, #26a69a 50%, #00796b 75%, #004d40 100%)",
                mesh: "radial-gradient(at 0% 0%, rgba(255,255,255,0.3) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0,0,0,0.4) 0, transparent 50%)",
                text: "#ffffff",
                accent: "#e0f2f1",
                badgeBg: "rgba(255,255,255,0.1)",
                label: "Platinum Member",
                iconColor: "#b2dfdb"
            }
        }[tierKey];


        return (
            <Card
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "24px",
                    background: colors.main,
                    minHeight: { xs: 200, sm: 220 },
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15), inset 0 0 100px rgba(255,255,255,0.5)",
                    border: (tierKey === "platinum") ? "none" : "1px solid rgba(0,0,0,0.05)",


                    transition: "all 0.3s ease",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: colors.mesh,
                        backgroundSize: "200% 200%",
                        animation: `${meshMove} 10s ease infinite`,
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
                    }
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 4 }, position: "relative", zIndex: 1 }}>
                    <Stack spacing={3}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: colors.text,
                                        opacity: 0.7,
                                        fontWeight: 700,
                                        letterSpacing: 1.5,
                                        display: "block",
                                        mb: -0.5
                                    }}
                                >
                                    PUMPKIN MEMBERSHIP
                                </Typography>
                                <Typography
                                    variant="h5"
                                    fontWeight={900}
                                    sx={{
                                        color: colors.text,
                                        textShadow: isSilver ? "none" : "0 2px 4px rgba(0,0,0,0.2)",
                                        fontSize: { xs: "1.5rem", sm: "1.75rem" }
                                    }}
                                >
                                    {colors.label}
                                </Typography>
                            </Box>

                            <Box
                                component="img"
                                src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
                                alt="Pumpkin"
                                sx={{
                                    height: { xs: 28, sm: 32 },
                                    filter: (tierKey === "platinum") ? "brightness(0) invert(1)" : (isSilver ? "grayscale(1) brightness(0.2)" : "none"),
                                    opacity: 0.9
                                }}
                            />
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                            <Box
                                sx={{
                                    bgcolor: colors.badgeBg,
                                    px: 2,
                                    py: 1,
                                    borderRadius: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    border: isSilver ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.1)"
                                }}
                            >
                                <WorkspacePremium sx={{ color: colors.iconColor, fontSize: 24 }} />
                                <Typography fontWeight={800} sx={{ color: colors.text, fontSize: "1.1rem" }}>
                                    {point.toLocaleString()} <Box component="span" sx={{ fontSize: "0.8rem", opacity: 0.7 }}>Pts</Box>
                                </Typography>
                            </Box>

                            {isOwnTier && (
                                <Fade in={true}>
                                    <Box
                                        sx={{
                                            bgcolor: (tierKey === "platinum") ? "#fff" : (isSilver ? "#2c3e50" : "#463300"),
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
                                </Fade>
                            )}
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                            <Box>
                                <Typography
                                    sx={{
                                        color: colors.text,
                                        opacity: 0.6,
                                        fontSize: "0.65rem",
                                        fontWeight: 600,
                                        mb: 0.2
                                    }}
                                >
                                    MEMBER SINCE
                                </Typography>
                                <Typography
                                    sx={{
                                        color: colors.text,
                                        fontWeight: 700,
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    {dayjs(joined_at).format("DD/MM/YYYY")}
                                </Typography>
                            </Box>

                            {!isSilver && (
                                <Box sx={{ opacity: 0.8 }}>
                                    <Stars sx={{ color: colors.accent, fontSize: 32 }} />
                                </Box>
                            )}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0,0,0,0.3)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                },
            }}
            PaperProps={{
                sx: {
                    background: "transparent",
                    boxShadow: "none",
                    overflow: "visible",
                    m: 2
                }
            }}
        >
            <Box sx={{ position: "relative" }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: -10,
                        top: -10,
                        zIndex: 10,
                        bgcolor: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                    size="small"
                >
                    <Close fontSize="small" />
                </IconButton>

                <Box
                    sx={{ pb: 1 }}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <Box
                        sx={{
                            animation: `${stepBump} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
                        }}
                        key={tiers[step]}
                    >
                        {TierCard(tiers[step])}
                    </Box>

                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={3}
                        sx={{ mt: 3 }}
                    >
                        <IconButton
                            onClick={() => setStep((s) => Math.max(s - 1, 0))}
                            disabled={step === 0}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "white",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                                "&.Mui-disabled": { opacity: 0.3, color: "white" }
                            }}
                        >
                            <ChevronLeft />
                        </IconButton>

                        <MobileStepper
                            variant="dots"
                            steps={maxSteps}
                            position="static"
                            activeStep={step}
                            sx={{
                                background: "transparent",
                                p: 0,
                                "& .MuiMobileStepper-dot": {
                                    width: 8,
                                    height: 8,
                                    bgcolor: "rgba(255,255,255,0.3)",
                                    mx: 0.5
                                },
                                "& .MuiMobileStepper-dotActive": {
                                    width: 24,
                                    borderRadius: 4,
                                    bgcolor: "white"
                                },
                            }}
                            nextButton={null}
                            backButton={null}
                        />

                        <IconButton
                            onClick={() => setStep((s) => Math.min(s + 1, maxSteps - 1))}
                            disabled={step === maxSteps - 1}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "white",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                                "&.Mui-disabled": { opacity: 0.3, color: "white" }
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    </Stack>
                </Box>
            </Box>
        </Dialog>
    );
};

export default CardPreviewDialog;