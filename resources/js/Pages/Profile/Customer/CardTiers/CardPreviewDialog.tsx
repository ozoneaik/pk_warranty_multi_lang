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
import { Close, ChevronLeft, ChevronRight, WorkspacePremium } from "@mui/icons-material";
import dayjs from "dayjs";
import { keyframes } from "@mui/system";

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
const popIn = keyframes`
  0%   { opacity: 0; transform: translateY(12px) scale(0.98); filter: saturate(0.9); }
  60%  { opacity: 1; transform: translateY(0) scale(1.005); }
  100% { transform: translateY(0) scale(1); filter: saturate(1); }
`;

const sheenMove = keyframes`
  0%   { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
  40%  { opacity: .45; }
  60%  { opacity: .25; }
  100% { transform: translateX(180%) skewX(-12deg); opacity: 0; }
`;

const stepBump = keyframes`
  0%   { transform: scale(1); }
  35%  { transform: scale(1.015); }
  100% { transform: scale(1); }
`;

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

    React.useEffect(() => setStep(startIndex), [activeTier, open]);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const maxSteps = tiers.length;

    const touchRef = React.useRef<{ x: number | null }>({ x: null });
    const onTouchStart = (e: React.TouchEvent) => {
        touchRef.current.x = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchRef.current.x == null) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        if (Math.abs(dx) > 50) {
            if (dx < 0 && step < maxSteps - 1) setStep(step + 1); // ปัดซ้าย -> ถัดไป
            if (dx > 0 && step > 0) setStep(step - 1); // ปัดขวา -> ก่อนหน้า
        }
        touchRef.current.x = null;
    };

    // const TierCard = (tierKey: Tier) => (
    //     <Card
    //         sx={{
    //             position: "relative",
    //             overflow: "hidden",
    //             borderRadius: 3,
    //             border: "1px solid #d9d9d9",
    //             background: cardColors[tierKey],
    //             color: "#111",
    //             boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
    //             transform: "translateZ(0)",
    //             willChange: "transform, filter",

    //             // --- แสงวิ้งหนึ่งครั้งหลังเปิด ---
    //             "&::before": {
    //                 content: '""',
    //                 position: "absolute",
    //                 top: 0,
    //                 bottom: 0,
    //                 left: 0,
    //                 width: "35%",
    //                 background:
    //                     "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.65) 50%, rgba(255,255,255,0) 100%)",
    //                 mixBlendMode: "screen",
    //                 pointerEvents: "none",
    //                 animation: `${sheenMove} 1850ms ease-in-out 450ms`, // run once
    //             },

    //             // --- ถ้า hover/focus ให้วิ่ง loop ตลอด ---
    //             "&:hover::before, &:focus-within::before": {
    //                 animation: `${sheenMove} 1600ms linear 0ms infinite`,

    //             },
    //         }}
    //     >
    //         <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
    //             <Stack
    //                 direction="row"
    //                 justifyContent="space-between"
    //                 alignItems="flex-start"
    //                 sx={{ pb: { xs: 2, sm: 4 } }}
    //                 color={"white"}
    //             >
    //                 <Box>
    //                     <Stack direction="row" alignItems="center" spacing={0.5}>
    //                         <Box
    //                             sx={{
    //                                 width: 22,
    //                                 height: 22,
    //                                 borderRadius: "50%",
    //                                 background: "radial-gradient(#FFF, #FFF6B4)",
    //                                 border: "2px solid #FFE970",
    //                                 display: "grid",
    //                                 placeItems: "center",
    //                                 color: "#8A8200",
    //                                 fontWeight: 900,
    //                                 fontSize: 12,
    //                             }}
    //                         >
    //                             <Typography
    //                                 variant="caption"
    //                                 fontWeight={900}
    //                                 sx={{
    //                                     color: "black",
    //                                     fontSize: { xs: "0.9rem", sm: "0.9rem" },
    //                                     lineHeight: 1,
    //                                 }}
    //                             >
    //                                 P
    //                             </Typography>
    //                         </Box>
    //                         <Typography
    //                             fontSize={{ xs: "1rem", sm: "1rem" }}
    //                             fontWeight={800}
    //                             sx={{
    //                                 color: "#fff",
    //                                 textShadow:
    //                                     "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
    //                             }}
    //                         >
    //                             {point ?? 0}
    //                         </Typography>
    //                     </Stack>

    //                     <Typography
    //                         fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
    //                         sx={{ color: "#222", mt: 0.5 }}
    //                     >
    //                         Member Since : {dayjs(joined_at).format("D MMM YYYY")}
    //                     </Typography>

    //                     <Typography
    //                         mt={1}
    //                         fontWeight={800}
    //                         sx={{
    //                             color: "#fff",
    //                             textShadow: "0 1px 2px rgba(0,0,0,.6)",
    //                         }}
    //                     >
    //                         {tierKey === "silver"
    //                             ? "Silver Member"
    //                             : tierKey === "gold"
    //                                 ? "Gold Member"
    //                                 : "Platinum Member"}
    //                     </Typography>
    //                 </Box>

    //                 <Box
    //                     component="img"
    //                     src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
    //                     alt="Pumpkin"
    //                     sx={{ height: { xs: 34, sm: 40 }, opacity: 1, mt: { xs: 10, sm: 12 } }}
    //                 />
    //             </Stack>
    //         </CardContent>
    //     </Card>
    // );

    const TierCard = (tierKey: Tier) => {
        const isOwnTier = tierKey === activeTier;

        // Mock point ถ้าไม่ใช่ tier ตัวเอง
        const displayPoint = isOwnTier
            ? point
            : tierKey === "silver"
                ? Math.floor(Math.random() * 1000) + 1              // 1 - 1000
                : tierKey === "gold"
                    ? Math.floor(Math.random() * 2000) + 1001        // 1001 - 3000
                    : Math.floor(Math.random() * 3000) + 3001;       // 3001 - 6000

        return (
            <Card
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 3,
                    border: "1px solid #d9d9d9",
                    background: cardColors[tierKey],
                    color: "#111",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
                    transform: "translateZ(0)",
                    willChange: "transform, filter",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: "35%",
                        background:
                            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.65) 50%, rgba(255,255,255,0) 100%)",
                        mixBlendMode: "screen",
                        pointerEvents: "none",
                        animation: `${sheenMove} 1850ms ease-in-out 450ms`,
                    },
                    "&:hover::before, &:focus-within::before": {
                        animation: `${sheenMove} 1600ms linear 0ms infinite`,
                    },
                }}
            >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ pb: { xs: 2, sm: 4 } }}
                        color={"white"}
                    >
                        <Box>
                            {/* ✅ คะแนน */}
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Box
                                    sx={{ display: "flex", alignItems: "center", paddingTop: 0.5 }}
                                >
                                    <Typography
                                        variant="caption"
                                        fontWeight={900}
                                        sx={{
                                            color: "black",
                                            fontSize: { xs: "0.9rem", sm: "0.9rem" },
                                            lineHeight: 1,
                                            userSelect: 'none',
                                        }}
                                    >
                                        <WorkspacePremium sx={{ color: "text.secondary" }} />
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        fontSize={{ xs: "1rem", sm: "1rem" }}
                                        fontWeight={800}
                                    >
                                        {point ?? 0}
                                    </Typography>
                                </Box>

                                {/* <Box
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: "50%",
                                        background: "radial-gradient(#FFF, #FFF6B4)",
                                        border: "2px solid #FFE970",
                                        display: "grid",
                                        placeItems: "center",
                                        color: "#8A8200",
                                        fontWeight: 900,
                                        fontSize: 12,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        fontWeight={900}
                                        sx={{
                                            color: "black",
                                            fontSize: { xs: "0.9rem", sm: "0.9rem" },
                                            lineHeight: 1,
                                        }}
                                    >
                                        P
                                    </Typography>
                                </Box> */}
                                {/* 
                                <Typography
                                    fontSize={{ xs: "1rem", sm: "1rem" }}
                                    fontWeight={800}
                                    sx={{
                                        color: "#fff",
                                        textShadow:
                                            "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                                    }}
                                >
                                    {displayPoint.toLocaleString()}
                                </Typography> */}
                            </Stack>

                            {/* ✅ วันที่สมัคร */}
                            <Typography
                                fontSize={{ xs: "0.70rem", sm: "0.9rem" }}
                                sx={{ color: "#222", mt: 1 }}
                            >
                                Member Since : {dayjs(joined_at).format("D MMM YYYY")}
                            </Typography>

                            {/* ✅ แสดง tier + สถานะ */}
                            <Typography
                                mt={1}
                                fontWeight={800}
                                sx={{
                                    color: "#fff",
                                    textShadow: "0 1px 2px rgba(0,0,0,.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                {tierKey === "silver"
                                    ? "Silver Member"
                                    : tierKey === "gold"
                                        ? "Gold Member"
                                        : "Platinum Member"}

                                {/* ✅ ป้ายบอกสถานะ */}
                                <Box
                                    component="span"
                                    sx={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: isOwnTier ? "#00e676" : "#ffe082",
                                        background: "rgba(0,0,0,0.35)",
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: 1,
                                        textTransform: "uppercase",
                                        mt: 1
                                    }}
                                >
                                    {isOwnTier ? "Your current level" : "Example"}
                                </Box>
                            </Typography>
                        </Box>

                        <Box
                            component="img"
                            src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
                            alt="Pumpkin"
                            sx={{ height: { xs: 34, sm: 40 }, opacity: 1, mt: { xs: 10, sm: 12 } }}
                        />
                    </Stack>
                </CardContent>
            </Card>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            BackdropProps={{
                sx: {
                    backgroundColor: "transparent", // ไม่มีสีทับ
                    backdropFilter: "blur(10px)",   // ยังเบลอได้
                    WebkitBackdropFilter: "blur(10px)",
                },
            }}
            PaperProps={{ sx: { background: "transparent", boxShadow: "none", p: 0 } }}
        >
            <Box sx={{ position: "relative" }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 6,
                        top: 6,
                        zIndex: 2,
                        bgcolor: "rgba(255,255,255,.75)",
                        backdropFilter: "blur(2px)",
                        "&:hover": { bgcolor: "rgba(255,255,255,.95)" },
                    }}
                    aria-label="close"
                >
                    <Close />
                </IconButton>
                <Box
                    sx={{ pt: 5, pb: 1, px: { xs: 1, sm: 1.5 } }}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <Box
                        sx={{
                            willChange: "transform",
                            animation: `${stepBump} 220ms ease`,
                            transition: "transform 260ms cubic-bezier(.2,.8,.2,1)",
                        }}
                        key={tiers[step]}
                    >
                        {TierCard(tiers[step])}
                    </Box>
                    <MobileStepper
                        variant="dots"
                        steps={maxSteps}
                        position="static"
                        activeStep={step}
                        sx={{
                            mt: 1,
                            background: "transparent",
                            justifyContent: "center",
                            "& .MuiMobileStepper-dot": { width: 6, height: 6 },
                            "& .MuiMobileStepper-dotActive": { width: 16, borderRadius: 999 },
                        }}
                        nextButton={
                            <IconButton
                                onClick={() => setStep((s) => Math.min(s + 1, maxSteps - 1))}
                                disabled={step === maxSteps - 1}
                                aria-label="next"
                            >
                                <ChevronRight />
                            </IconButton>
                        }
                        backButton={
                            <IconButton
                                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                                disabled={step === 0}
                                aria-label="back"
                            >
                                <ChevronLeft />
                            </IconButton>
                        }
                    />
                </Box>
            </Box>
        </Dialog>
    );
};

export default CardPreviewDialog;