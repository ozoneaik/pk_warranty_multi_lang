import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import dayjs from "dayjs";

interface RewardProgressProps {
    cardColors: Record<string, string>;
    point?: number;
    joined_at?: string;
    tier_expired_at?: string;
    tier?: string; // ✅ เพิ่ม tier ปัจจุบันจาก backend
}

export default function RewardProgress({
    cardColors,
    point = 0,
    joined_at,
    tier = "silver",
    tier_expired_at,
}: RewardProgressProps) {
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
        if (centerText) centerText.textContent = `${fmt(point)} คะแนน`;

        // === Linear Progress ของระดับปัจจุบัน ===
        const tiers = [
            { key: "silver", min: 0, max: 1000 },
            { key: "gold", min: 1001, max: 3000 },
            { key: "platinum", min: 3001, max: Infinity },
        ];
        const currentTier = tiers.find((t) => t.key === tier) || tiers[0];
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
                                0 คะแนน
                            </text>
                        </svg>
                        <Typography mt={1} fontWeight={700} fontSize="1rem" color="text.primary">
                            ระดับปัจจุบัน: {level}
                        </Typography>
                    </Box>

                    {/* Tier Section */}
                    <Box>
                        <Typography fontWeight={700} mb={1}>
                            ระดับสมาชิกทั้งหมด
                        </Typography>

                        <Box className="tiers">
                            {["silver", "gold", "platinum"].map((t) => (
                                <div key={t} className={`tier ${t === tier ? "active" : ""}`}>
                                    <Box>
                                        <Card
                                            sx={{
                                                width: 80,
                                                height: 50,
                                                background: cardColors[t],
                                                borderRadius: 2,
                                                color: "#333",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 500,
                                                fontSize: "0.7rem",
                                                textAlign: "center",
                                                overflow: "hidden",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                                position: "relative",
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src="https://pumpkin.co.th/wp-content/uploads/2022/02/Rectangle.png"
                                                alt="Pumpkin"
                                                sx={{
                                                    position: "absolute",
                                                    top: 22,
                                                    right: 4,
                                                    height: 14,
                                                    opacity: 0.9,
                                                }}
                                            />
                                        </Card>
                                    </Box>

                                    <div>
                                        <div className="name">
                                            {t === "silver"
                                                ? "Silver Member"
                                                : t === "gold"
                                                    ? "Gold Member"
                                                    : "Platinum Member"}
                                        </div>
                                        <div className="need">
                                            {t === "silver" && "Point 0 - 1,000 แต้ม"}
                                            {t === "gold" && "Point 1,001 - 3,000 แต้ม"}
                                            {t === "platinum" && "Point 3,001 แต้มขึ้นไป"}
                                        </div>
                                    </div>

                                    <div className="muted" style={{ textAlign: "right", minWidth: 80 }}>
                                        {t === tier ? "ปัจจุบัน" : ""}
                                    </div>
                                </div>
                            ))}
                        </Box>
                    </Box>

                    {/* Linear Progress */}
                    <Box mt={3}>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                            ความคืบหน้าในระดับปัจจุบัน
                        </Typography>
                        <Box className="progress">
                            <div id="linearBar" className="bar"></div>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
