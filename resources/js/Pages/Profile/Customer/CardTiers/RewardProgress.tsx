import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Fade } from "@mui/material";
import dayjs from "dayjs";
import { useLanguage } from "@/context/LanguageContext";
import { keyframes, styled } from "@mui/system";
import { WorkspacePremium } from "@mui/icons-material";

interface RewardProgressProps {
    cardColors: Record<string, string>;
    point?: number;
    joined_at?: string;
    tier_expired_at?: string;
    tier?: string;
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

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

export default function RewardProgress({
    cardColors,
    point = 0,
    joined_at,
    tier = "silver",
    tier_expired_at,
}: RewardProgressProps) {
    const { t } = useLanguage();
    const [level, setLevel] = useState<string>(tier);

    useEffect(() => {
        // ✅ ถ้ามี tier จาก backend ให้ใช้เลย ไม่ต้องคำนวณเอง
        setLevel(tier.charAt(0).toUpperCase() + tier.slice(1));

        const now = dayjs();
        const expiredAt = tier_expired_at ? dayjs(tier_expired_at) : null;

        // ✅ ตรวจวันหมดอายุ — แต่ไม่ downgrade
        if (expiredAt) {
            const remainingDays = expiredAt.diff(now, "day");
            if (remainingDays < 0) {
                console.log(`⚠️ Tier ${tier} หมดอายุแล้ว (Expired ${expiredAt.format("YYYY-MM-DD")})`);
            } else {
                console.log(
                    `📅 Tier ${tier} จะหมดอายุอีก ${remainingDays} วัน (${expiredAt.format("YYYY-MM-DD")})`
                );
            }
        }

        // === วงกลมด้านบน ===
        const fmt = (n: number) => Number(n || 0).toLocaleString("th-TH");
        const r = 52,
            C = 2 * Math.PI * r;
        const pctAll = Math.min(100, (point / 3000) * 100);
        const dash = (pctAll / 100) * C;
        const arc = document.getElementById("arc");
        const pctText = document.getElementById("pctText");
        const centerText = document.getElementById("centerText");
        const linearBar = document.getElementById("linearBar");

        if (arc) arc.setAttribute("stroke-dasharray", `${dash} ${C}`);
        if (pctText) pctText.textContent = `${Math.round(pctAll)}%`;
        if (centerText) centerText.textContent = `${fmt(point)} ${t.Score.pts}`;

        // === Linear Progress ของระดับปัจจุบัน ===
        const tiers = [
            { key: "silver", min: 0, max: 1000 },
            { key: "gold", min: 1001, max: 3000 },
            { key: "platinum", min: 3001, max: Infinity },
        ];
        const currentTier = tiers.find((item) => item.key === tier) || tiers[0];
        const span = currentTier.max === Infinity ? 1000 : currentTier.max - currentTier.min;
        const base = Math.max(0, point - currentTier.min);
        const pct = Math.min(100, (base / span) * 100);

        if (linearBar) {
            linearBar.style.setProperty("--pct", pct + "%");
            linearBar.style.animation = "none";
            void linearBar.offsetWidth;
            linearBar.style.animation = "grow .9s cubic-bezier(.2,.7,.2,1) forwards";
        }
    }, [point, tier, tier_expired_at]);

    return (
        <Card
            sx={{
                mt: 2,
                borderRadius: 3,
                border: "1px solid #eee",
                boxShadow: 0,
                overflow: "hidden",
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box className="reward-progress">
                    <style>
                        {`
              .reward-progress {
                --accent1:#7c5cff; --accent2:#22d3ee; --accent3:#34d399;
                --track:#e5e7eb; --muted:#6b7280;
              }
              .reward-progress svg {
                width: 100%; max-width: 160px; display: block; margin: 0 auto;
              }
              .progress {position:relative;height:12px;background:var(--track);border-radius:999px;overflow:hidden;margin-top:8px}
              .bar{position:absolute;inset:0;background:linear-gradient(90deg,var(--accent1),var(--accent2) 40%,var(--accent3) 80%);width:0;border-radius:inherit}
              @keyframes grow { from{width:0%} to{width:var(--pct,0%)} }
              .tiers{display:grid;gap:12px;margin-top:12px}
              .tier{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:12px;border-radius:8px;border:1px solid #eee;background:#fafafa}
              .tier.active{border-color:#10b98155;background:linear-gradient(180deg,rgba(16,185,129,.08),transparent)}
              .tier .name{font-weight:700;font-size:15px;color:#111}
              .tier .need{font-size:12px;color:var(--muted);margin-top:2px}
              .tier .muted{font-size:13px;color:var(--muted);font-weight:600}
            `}
                    </style>

                    {/* Circular Progress */}
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--track)" strokeWidth="10" />
                            <defs>
                                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="var(--accent1)" />
                                    <stop offset="45%" stopColor="var(--accent2)" />
                                    <stop offset="90%" stopColor="var(--accent3)" />
                                </linearGradient>
                            </defs>
                            <circle
                                id="arc"
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="url(#g)"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray="0 999"
                                transform="rotate(-90 60 60)"
                            />
                            <text id="pctText" x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="700">
                                0%
                            </text>
                            <text id="centerText" x="60" y="78" textAnchor="middle" fontSize="8" fill="#666">
                                0 {t.Score.pts}
                            </text>
                        </svg>
                        <Typography mt={1} fontWeight={700} fontSize="1rem" color="text.primary">
                            {t.Score.currentLevel}: {t.Score.tiers[tier as keyof typeof t.Score.tiers]}
                        </Typography>
                    </Box>

                    {/* Tier Section */}
                    <Box>
                        <Typography fontWeight={700} mb={1}>
                            {t.Score.allLevels}
                        </Typography>

                        <Box className="tiers">
                            {["silver", "gold", "platinum"].map((tierKey) => (
                                <div key={tierKey} className={`tier ${tierKey === tier ? "active" : ""}`}>
                                    <Box>
                                        <Card
                                            sx={{
                                                width: 100,
                                                minHeight: 60,
                                                borderRadius: "12px",
                                                background: (() => {
                                                    const themes: any = {
                                                        silver: "linear-gradient(135deg, #757575 0%, #C2C2C2 35%, #FDFDFD 50%, #D9D9D9 65%, #757575 100%)",
                                                        gold: "linear-gradient(135deg, #8B660F 0%, #CFA525 20%, #FFF8E1 40%, #D4AF37 50%, #C8A02E 60%, #B8860B 80%, #996515 100%)",
                                                        platinum: "linear-gradient(135deg, #004d40 0%, #00796b 25%, #26a69a 50%, #00796b 75%, #004d40 100%)"
                                                    };
                                                    return themes[tierKey] || themes.silver;
                                                })(),
                                                color: tierKey === "platinum" ? "white" : (tierKey === "gold" ? "#463300" : "#2c3e50"),
                                                position: "relative",
                                                overflow: "hidden",
                                                boxShadow: "0 4px 10px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.3)",
                                                border: "none",
                                                display: "flex",
                                                flexDirection: "column",
                                                p: 1,
                                                transition: "all 0.3s ease",

                                                "&::before": {
                                                    content: '""',
                                                    position: "absolute",
                                                    inset: 0,
                                                    background: tierKey === "platinum" 
                                                        ? "radial-gradient(at 0% 0%, rgba(255,255,255,0.3) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0,0,0,0.4) 0, transparent 50%)"
                                                        : (tierKey === "gold" 
                                                            ? "radial-gradient(at 0% 0%, rgba(255,255,255,0.4) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(255,215,0,0.3) 0, transparent 50%)"
                                                            : (tierKey === "silver" 
                                                                ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"), radial-gradient(at 0% 0%, rgba(255,255,255,0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(0,0,0,0.05) 0, transparent 50%)`
                                                                : "radial-gradient(at 0% 0%, rgba(255,255,255,0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(255,255,255,0.05) 0, transparent 50%)")),
                                                    opacity: tierKey === "silver" ? 0.2 : 1,
                                                    backgroundSize: tierKey === "silver" ? "100px, 200% 200%, 200% 200%" : "200% 200%",
                                                    animation: tierKey === "silver" ? "none" : `${meshMove} 10s ease infinite`,
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
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: "0.4rem",
                                                    fontWeight: 900,
                                                    opacity: 0.8,
                                                    letterSpacing: 0.5,
                                                    position: "relative",
                                                    zIndex: 2,
                                                    lineHeight: 1
                                                }}
                                            >
                                                {t.Score.membershipTitle.split(' ')[1]}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: "0.55rem",
                                                    fontWeight: 950,
                                                    position: "relative",
                                                    zIndex: 2,
                                                    lineHeight: 1.2,
                                                    mt: 0.2
                                                }}
                                            >
                                                {tierKey.toUpperCase()}
                                            </Typography>

                                            <Box
                                                component="img"
                                                src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
                                                alt="Pumpkin"
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 4,
                                                    right: 4,
                                                    height: 8,
                                                    opacity: 0.9,
                                                    zIndex: 2,
                                                }}
                                            />
                                        </Card>
                                    </Box>

                                    <div>
                                        <div className="name">
                                            {t.Score.tiers[tierKey as keyof typeof t.Score.tiers]}
                                        </div>
                                        <div className="need">
                                            {tierKey === "silver" && t.Score.pointRange.replace("{min}", "0").replace("{max}", "1,000")}
                                            {tierKey === "gold" && t.Score.pointRange.replace("{min}", "1,001").replace("{max}", "3,000")}
                                            {tierKey === "platinum" && t.Score.pointAbove.replace("{min}", "3,001")}
                                        </div>
                                    </div>

                                    <div className="muted" style={{ textAlign: "right", minWidth: 80 }}>
                                        {tierKey === tier ? (
                                            <Fade in={true}>
                                                <Box
                                                    sx={{
                                                        bgcolor: (tierKey === "platinum") ? "#fff" : (tierKey === "silver" ? "#2c3e50" : "#463300"),
                                                        color: "#fff",
                                                        px: 1,
                                                        py: 0.3,
                                                        borderRadius: "10px",
                                                        fontSize: "0.6rem",
                                                        fontWeight: 900,
                                                        textTransform: "uppercase",
                                                        animation: `${pulse} 2s ease-in-out infinite`,
                                                        display: "inline-block"
                                                    }}
                                                >
                                                    {t.Score.current}
                                                </Box>
                                            </Fade>
                                        ) : ""}
                                    </div>
                                </div>
                            ))}
                        </Box>
                    </Box>

                    {/* Linear Progress */}
                    {/* <Box mt={3}>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            ความคืบหน้าในระดับปัจจุบัน
                        </Typography>
                        <Box className="progress">
                            <div id="linearBar" className="bar"></div>
                        </Box>
                    </Box> */}
                </Box>
            </CardContent>
        </Card>
    );
}
