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
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 106, 0, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(255, 106, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 106, 0, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const confettiRotate = keyframes`
  0% { transform: rotate(0deg) translateY(0); opacity: 1; }
  100% { transform: rotate(360deg) translateY(100vh); opacity: 0; }
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
                    width: '94%',
                    maxWidth: '335px',
                    maxHeight: '92vh',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 5,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflowY: 'auto',
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                }}>


                {/* Header - Premium Design */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 50%, #FF3D00 100%)',
                    backgroundSize: '200% 200%',
                    animation: `${shimmer} 5s linear infinite`,
                    p: 1.4,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white',
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(rgba(255,255,255,0.1), transparent)',
                        pointerEvents: 'none'
                    }
                }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            p: 0.5,
                            backdropFilter: 'blur(10px)'
                        }}>
                            <IconButton onClick={onClose} size="small" sx={{ color: 'white', p: 0.5 }}>
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                        <Typography variant="subtitle1" fontWeight="800" sx={{ letterSpacing: 0.5 }}>{t.Checkin.title}</Typography>
                    </Stack>
                </Box>


                <Box sx={{ p: 1.2 }}>
                    {!successData ? (
                        <Grid>
                            <Paper elevation={0} sx={{ p: 1, borderRadius: 3, mb: 1.2, bgcolor: 'white', border: '1px solid #EDF2F7' }}>
                                <Typography variant="body2" align="center" fontWeight="bold" sx={{ mb: 1, color: '#2D3748' }}>
                                    {currentLocale === 'th' 
                                        ? dayjs().locale('th').format('MMMM') + ' ' + (dayjs().year() + 543)
                                        : dayjs().format('MMMM YYYY')}
                                </Typography>

                                {/* ปรับแต่ง Grid ปฏิทินให้พอดีมือถือ */}
                                <Grid container columns={7} spacing={0.5}>
                                    {t.Checkin.daysOfWeek.map(d => (
                                        <Grid size={1} key={d}>
                                            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ fontSize: '0.6rem', fontWeight: 800, mb: 0.5 }}>
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
                                                        borderRadius: 2,
                                                        position: 'relative',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        bgcolor: isChecked
                                                            ? 'transparent'
                                                            : isToday
                                                                ? '#FFF4E6'
                                                                : 'white',
                                                        background: isChecked
                                                            ? 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)'
                                                            : undefined,
                                                        border: isToday && !isChecked
                                                            ? '2px solid #FF6A00'
                                                            : '1px solid #EDF2F7',
                                                        boxShadow: isChecked 
                                                            ? '0 4px 12px rgba(255, 106, 0, 0.3)' 
                                                            : isToday 
                                                                ? '0 0 10px rgba(255, 106, 0, 0.1)'
                                                                : 'none',
                                                        color: isChecked ? '#FFF' : '#4A5568',
                                                        opacity: isFuture ? 0.4 : 1,
                                                        '&:active': { transform: !isFuture ? 'scale(0.92)' : 'none' },
                                                        cursor: isFuture ? 'default' : 'pointer'
                                                    }}
                                                >
                                                    <Typography fontSize="0.8rem" fontWeight={isToday || isChecked ? 800 : 500}>
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
                                        mt: 1.5, borderRadius: 4, py: 1.2,
                                        background: hasCheckedInToday 
                                            ? '#E2E8F0' 
                                            : 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)',
                                        boxShadow: hasCheckedInToday ? 'none' : '0 8px 20px -6px rgba(255, 106, 0, 0.5)',
                                        fontWeight: '800', fontSize: '1rem',
                                        textTransform: 'none',
                                        animation: !hasCheckedInToday ? `${pulse} 2s infinite` : 'none',
                                        '&:active': { transform: 'scale(0.98)' },
                                        '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#A0AEC0' }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (hasCheckedInToday ? t.Checkin.checkedIn : t.Checkin.checkinNow)}
                                </Button>

                            </Paper>

                            <Box sx={{ 
                                bgcolor: 'white', 
                                p: 1, 
                                borderRadius: 3, 
                                border: '1px solid #EDF2F7', 
                                mb: 1,
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{
                                        p: 0.5,
                                        borderRadius: '50%',
                                        bgcolor: '#FFF5F5',
                                        display: 'flex'
                                    }}>
                                        <LocalFireDepartment sx={{ color: '#FF6A00', fontSize: 18, animation: `${float} 2s ease-in-out infinite` }} />
                                    </Box>
                                    <Typography variant="body2" fontWeight="800" color="#2D3748">
                                        {t.Checkin.streakMsg.replace('{days}', currentStreak.toString())}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Milestones - ออกแบบใหม่ให้แนวนอนประหยัดพื้นที่ */}
                            <Box sx={{ bgcolor: 'white', p: 1.2, borderRadius: 4, border: '1px solid #EDF2F7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="800" display="block" sx={{ mb: 0.8, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                        <Stack spacing={3} alignItems="center" sx={{ py: 4, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                {[...Array(12)].map((_, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            position: 'absolute',
                                            top: -20,
                                            left: `${Math.random() * 100}%`,
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: ['#FF6A00', '#FF9A8B', '#FFD700', '#4CAF50', '#2196F3'][i % 5],
                                            animation: `${confettiRotate} ${2 + Math.random() * 2}s linear infinite`,
                                            animationDelay: `${Math.random() * 2}s`
                                        }}
                                    />
                                ))}
                            </Box>
                            
                            <Box sx={{
                                width: 100, height: 100, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 20px -5px rgba(255, 106, 0, 0.3)',
                                animation: `${pulse} 2s infinite`
                            }}>
                                <Stars sx={{ fontSize: 60, color: '#FF6A00' }} />
                            </Box>
                            
                            <Box textAlign="center">
                                <Typography variant="h5" fontWeight="900" sx={{ mb: 1, color: '#2D3748' }}>{t.Checkin.checkinSuccess}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    ยินดีด้วย! คุณได้รับรางวัลจากการเช็คอินวันนี้แล้ว
                                </Typography>
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
    const progressPercent = Math.min((progress / days) * 100, 100);

    return (
        <Box sx={{ width: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 32, height: 32, borderRadius: 1.5,
                        background: current ? 'linear-gradient(135deg, #FF9A8B 0%, #FF6A00 100%)' : '#F7FAFC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: current ? '0 4px 8px rgba(255, 106, 0, 0.2)' : 'none',
                        border: '1px solid',
                        borderColor: current ? 'transparent' : '#EDF2F7'
                    }}>
                        {current ? <EmojiEvents sx={{ color: 'white', fontSize: 18 }} /> : <CardGiftcard sx={{ color: '#A0AEC0', fontSize: 18 }} />}
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="800" sx={{ lineHeight: 1.2, color: '#2D3748' }}>
                            {t.Checkin.days.replace('{days}', days.toString())}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#FF6A00', fontWeight: '700', fontSize: '0.65rem' }}>
                            {t.Checkin.earnPoints.replace('{points}', points.toString())}
                        </Typography>
                    </Box>
                </Stack>
                <Typography variant="caption" fontWeight="900" sx={{ color: current ? '#FF6A00' : '#A0AEC0', bgcolor: current ? '#FFF5F5' : '#F7FAFC', px: 1, py: 0.5, borderRadius: 2 }}>
                    {current ? t.Checkin.success : `${progress}/${days}`}
                </Typography>
            </Stack>
            {!current && (
                <Box sx={{ width: '100%', height: 6, bgcolor: '#EDF2F7', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ 
                        width: `${progressPercent}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #FF9A8B 0%, #FF6A00 100%)',
                        borderRadius: 'inherit',
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                </Box>
            )}
        </Box>
    );
}
