import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal, Box, Typography, Button, CircularProgress,
    Stack, keyframes, Grid, IconButton, useTheme, Divider, Paper
} from '@mui/material';
import {
    CheckCircle, Stars, LocalFireDepartment,
    Close, EmojiEvents, CardGiftcard
} from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { MonetizationOn } from '@mui/icons-material';
import { useLanguage } from '@/context/LanguageContext';

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const coinBounce = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-4px) rotate(10deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-2px) rotate(-10deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

interface CheckinModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (points: number) => void;
    currentStreak: number;
    hasCheckedInToday: boolean;
    checkedDays: string[];
}

export default function CheckinModal({ open, onClose, onSuccess, currentStreak = 0, hasCheckedInToday, checkedDays = [] }: CheckinModalProps) {
    const theme = useTheme();
    const { t, currentLocale } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // 🏆 Milestones: กำหนดเป้าหมายวัน
    const milestones = [10, 20];

    // 📅 Logic การคำนวณวันที่จะถึง Milestone (ถ้าเช็คอินต่อเนื่องทุกวัน)
    const milestoneDates = useMemo(() => {
        const results: { [key: number]: number } = {};
        const today = dayjs();

        milestones.forEach(target => {
            // คำนวณวันที่ต้องใช้อีกกี่วัน
            // ถ้าวันนี้ยังไม่เช็ค: ต้องเช็ควันนี้ (1) + วันที่เหลือ
            // ถ้าวันนี้เช็คแล้ว: ต้องเช็คเริ่มตั้งแต่วันพรุ่งนี้
            if (currentStreak < target) {
                const daysNeeded = target - currentStreak;
                const projectedDate = hasCheckedInToday
                    ? today.add(daysNeeded, 'day')
                    : today.add(daysNeeded - 1, 'day');

                // แสดงเฉพาะเป้าหมายที่อยู่ในเดือนปัจจุบัน
                if (projectedDate.month() === today.month()) {
                    results[projectedDate.date()] = target;
                }
            }
        });
        return results;
    }, [currentStreak, hasCheckedInToday]);

    // สร้างข้อมูลวันที่สำหรับเดือนปัจจุบัน
    const calendarDays = useMemo(() => {
        const startOfMonth = dayjs().startOf('month');
        const daysInMonth = startOfMonth.daysInMonth();
        const startDayOfWeek = startOfMonth.day();

        const days = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    }, []);

    const handleCheckin = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/checkin');
            if (res.data.status === 'success') {
                setSuccessData(res.data);
                onSuccess(res.data.points);
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: t.Checkin.errorTitle,
                text: error.response?.data?.message || t.Checkin.errorMsg,
                target: document.getElementById('checkin-modal-container') || 'body'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={loading ? undefined : onClose}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Box id="checkin-modal-container"
                sx={{
                    position: 'relative',
                    width: '92%', // กว้างเกือบเต็มจอแต่เหลือขอบเล็กน้อย
                    maxWidth: '360px', // ขนาดที่เหมาะสมที่สุดสำหรับ Mobile UI
                    maxHeight: '90vh', // ไม่ให้สูงเกินหน้าจอ
                    bgcolor: '#F8F9FA',
                    borderRadius: 4,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    overflowY: 'auto', // ถ้าจอมือถือเล็กมากจะเลื่อนดูได้
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column'
                }}>

                {/* Header - ปรับให้ Compact มากขึ้น */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)',
                    p: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white'
                }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                            <Close fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" fontWeight="bold">{t.Checkin.title}</Typography>
                    </Stack>
                    {/* <Box sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        px: 1.2, py: 0.4, borderRadius: 5,
                        display: 'flex', alignItems: 'center', gap: 0.5
                    }}>
                        <LocalFireDepartment sx={{ color: '#FFD700', fontSize: 16 }} />
                        <Typography variant="caption" fontWeight="bold">{currentStreak} วัน</Typography>
                    </Box> */}
                </Box>

                <Box sx={{ p: 2 }}>
                    {!successData ? (
                        <Grid>
                            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, mb: 2, bgcolor: 'white', border: '1px solid #EDF2F7' }}>
                                <Typography variant="body2" align="center" fontWeight="bold" sx={{ mb: 1.5, color: '#2D3748' }}>
                                    {currentLocale === 'th' 
                                        ? dayjs().locale('th').format('MMMM') + ' ' + (dayjs().year() + 543)
                                        : dayjs().format('MMMM YYYY')}
                                </Typography>

                                {/* ปรับแต่ง Grid ปฏิทินให้พอดีมือถือ */}
                                <Grid container columns={7} spacing={0.5}>
                                    {t.Checkin.daysOfWeek.map(d => (
                                        <Grid size={1} key={d}>
                                            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ fontSize: '0.6rem', fontWeight: 700, mb: 0.5 }}>
                                                {d}
                                            </Typography>
                                        </Grid>
                                    ))}
                                    {calendarDays.map((day, idx) => {
                                        if (day === null) return <Grid size={1} key={idx} />;

                                        const dateStr = dayjs()
                                            .date(day)
                                            .format('YYYY-MM-DD');

                                        const isToday = dateStr === dayjs().format('YYYY-MM-DD');
                                        const isChecked = checkedDays.includes(dateStr);
                                        const isFuture = dayjs(dateStr).isAfter(dayjs(), 'day');

                                        return (
                                            <Grid size={1} key={idx}>
                                                <Box
                                                    sx={{
                                                        aspectRatio: '1/1',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: 1.5,
                                                        position: 'relative',
                                                        bgcolor: isChecked
                                                            ? 'transparent'
                                                            : isToday
                                                                ? '#FFF4E6'
                                                                : '#F7FAFC',
                                                        background: isChecked
                                                            ? 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)'
                                                            : undefined,
                                                        border: isToday && !isChecked
                                                            ? '2px solid #FF6A00'
                                                            : '1px solid #EDF2F7',
                                                        color: isChecked ? '#FFF' : '#4A5568',
                                                        opacity: isFuture ? 0.5 : 1
                                                    }}
                                                >
                                                    <Typography fontSize="0.75rem" fontWeight={isToday || isChecked ? 700 : 500}>
                                                        {day}
                                                    </Typography>

                                                    {isChecked && (
                                                        <MonetizationOn
                                                            sx={{
                                                                fontSize: 10,
                                                                color: '#FFD700',
                                                                position: 'absolute',
                                                                top: 2,
                                                                right: 2
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>

                                <Button
                                    fullWidth variant="contained" disableElevation onClick={handleCheckin}
                                    disabled={loading || hasCheckedInToday}
                                    sx={{
                                        mt: 2, borderRadius: 3, py: 1.2,
                                        background: hasCheckedInToday ? '#E2E8F0' : 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)',
                                        fontWeight: 'bold', fontSize: '0.95rem',
                                        textTransform: 'none',
                                        '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#A0AEC0' }
                                    }}
                                >
                                    {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : (hasCheckedInToday ? t.Checkin.checkedIn : t.Checkin.checkinNow)}
                                </Button>
                            </Paper>

                            <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 3, border: '1px solid #EDF2F7', mb: 1 }}>
                                <Box sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    px: 1, py: 0.4, borderRadius: 5,
                                    display: 'flex', alignItems: 'center', gap: 0.5
                                }}>
                                    <LocalFireDepartment sx={{ color: '#FFD700', fontSize: 16 }} />
                                    <Typography variant="caption" fontWeight="bold">{t.Checkin.streakMsg.replace('{days}', currentStreak.toString())}</Typography>
                                </Box>
                            </Box>
                            {/* Milestones - ออกแบบใหม่ให้แนวนอนประหยัดพื้นที่ */}
                            <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 3, border: '1px solid #EDF2F7' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" sx={{ mb: 1, fontSize: '0.65rem' }}>
                                    {t.Checkin.specialRewards}
                                </Typography>

                                <Stack spacing={1}>
                                    {milestones.map(m => (
                                        <MilestoneRow
                                            key={m} days={m} points={m === 10 ? 50 : 100}
                                            progress={currentStreak} current={currentStreak >= m}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>
                    ) : (
                        /* Success View */
                        <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                            <Box sx={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Stars sx={{ fontSize: 50, color: '#FF6A00' }} />
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h6" fontWeight="bold">{t.Checkin.checkinSuccess}</Typography>
                                {/* <Typography variant="h4" fontWeight="900" sx={{ color: '#FF6A00' }}>
                                    +{successData.points} <span style={{ fontSize: '1rem' }}>แต้ม</span>
                                </Typography> */}
                            </Box>
                            {/* <Button
                                fullWidth
                                variant="contained"
                                // onClick={onClose}
                                onClick={() => {
                                    onClose();
                                    window.location.reload();
                                }}
                                sx={{ borderRadius: 3, py: 1.2, background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)' }}
                            >
                                ตกลง
                            </Button> */}
                            <Button
                                fullWidth
                                variant="contained"
                                disabled={isRefreshing} // 1. ห้ามกดซ้ำถ้ารีเฟรชอยู่
                                onClick={() => {
                                    setIsRefreshing(true); // 2. เริ่มแสดง Loading

                                    // 3. หน่วงเวลาเล็กน้อยเพื่อให้ User เห็น Loading ก่อนรีเฟรชจริง
                                    setTimeout(() => {
                                        onClose();
                                        window.location.reload();
                                    }, 500);
                                }}
                                sx={{
                                    borderRadius: 3,
                                    py: 1.2,
                                    background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)',
                                    // ปรับสีตอน Disabled ให้ดูจางลง
                                    '&.Mui-disabled': {
                                        background: '#e0e0e0',
                                        color: '#9e9e9e'
                                    }
                                }}
                            >
                                {/* 4. เงื่อนไขการแสดงผล: ถ้ากำลังรีเฟรช ให้โชว์วงกลมหมุนๆ */}
                                {isRefreshing ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CircularProgress size={20} color="inherit" />
                                        <Typography variant="body2" fontWeight="bold">{t.Checkin.loading}</Typography>
                                    </Stack>
                                ) : (
                                    t.Checkin.confirm
                                )}
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Box>
        </Modal>
    );
}

function MilestoneRow({ days, points, progress, current }: any) {
    const { t } = useLanguage();
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: '#F8F9FA', p: 1, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                    width: 28, height: 28, borderRadius: 1,
                    background: current ? '#FF6A00' : '#EDF2F7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {current ? <CheckCircle sx={{ color: 'white', fontSize: 16 }} /> : <CardGiftcard sx={{ color: '#A0AEC0', fontSize: 16 }} />}
                </Box>
                <Box>
                    <Typography variant="caption" fontWeight="700" display="block" sx={{ lineHeight: 1 }}>{t.Checkin.days.replace('{days}', days.toString())}</Typography>
                    <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.6rem' }}>{t.Checkin.earnPoints.replace('{points}', points.toString())}</Typography>
                </Box>
            </Stack>
            <Typography variant="caption" fontWeight="bold" sx={{ color: current ? '#FF6A00' : '#A0AEC0' }}>
                {current ? t.Checkin.success : `${progress}/${days}`}
            </Typography>
        </Stack>
    );
}