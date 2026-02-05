import React, { useEffect, useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Avatar,
    Typography,
    Paper,
    Button,
    Stack,
    Divider,
    TextField,
    InputAdornment,
    Tooltip
} from "@mui/material";
import {
    Close,
    ContentCopy,
    Share,
    Download as DownloadIcon,
    CheckCircle // ✅ เพิ่มไอคอนเครื่องหมายถูก
} from "@mui/icons-material";
import { QRCodeCanvas } from 'qrcode.react';
import Swal from 'sweetalert2';

// Import Logo
import PumpkinLogo from '../../assets/logo/pumpkin.png';

interface ProfileQrModalProps {
    open: boolean;
    onClose: () => void;
    user: {
        name: string;
    };
    lineAvatar: string | null;
    customerCode: string | null;
    referralUrl: string | null;
}

export default function ProfileQrModal({
    open,
    onClose,
    user,
    lineAvatar,
    customerCode,
    referralUrl
}: ProfileQrModalProps) {

    const [logoBase64, setLogoBase64] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false); // State สำหรับแสดงสถานะว่าคัดลอกแล้ว
    const inputRef = useRef<HTMLInputElement>(null); // Ref เพื่ออ้างอิง Input ใน Modal

    useEffect(() => {
        const convertToBase64 = async () => {
            try {
                const response = await fetch(PumpkinLogo);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        setLogoBase64(reader.result);
                    }
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error("Error converting logo to base64:", error);
            }
        };
        convertToBase64();
    }, []);

    // 1. ฟังก์ชันคัดลอกลิงก์ (แบบทำงานใน Modal)
    const handleCopy = async () => {
        if (!referralUrl) return;

        try {
            // วิธีที่ 1: ใช้ API มาตรฐาน
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(referralUrl);
            } else {
                // วิธีที่ 2: Fallback แบบทำงานกับ Input ใน Modal โดยตรง
                if (inputRef.current) {
                    inputRef.current.select();
                    inputRef.current.setSelectionRange(0, 99999); // สำหรับมือถือ
                    document.execCommand('copy');
                }
            }

            // แสดง Visual Feedback ภายในปุ่ม
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // คืนค่าเดิมหลัง 2 วิ

        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    // ... (handleShare และ handleDownload คงเดิม) ...
    const handleShare = async () => {
        if (navigator.share && referralUrl) {
            try {
                await navigator.share({
                    title: 'สมัครสมาชิก Pumpkin',
                    text: `สมัครสมาชิก Pumpkin วันนี้ รับสิทธิพิเศษมากมาย! ผ่านลิงก์นี้`,
                    url: referralUrl,
                });
            } catch (error) { }
        } else {
            handleCopy();
        }
    };

    const handleDownload = () => {
        const canvas = document.getElementById('profile-qr-code') as HTMLCanvasElement;
        if (canvas) {
            try {
                const pngUrl = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = `pumpkin-referral-${user.name}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกรูปภาพแล้ว',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                });
            } catch (error) { }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, overflow: 'visible' }
            }}
        >
            <DialogContent sx={{ p: 0, textAlign: 'center', position: 'relative', pb: 3 }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', zIndex: 10, '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' } }}
                >
                    <Close fontSize="small" />
                </IconButton>

                <Box sx={{ bgcolor: '#F54927', pt: 4, pb: 8, px: 3, borderTopLeftRadius: 16, borderTopRightRadius: 16, color: 'white' }}>
                    <Avatar
                        src={lineAvatar || "https://via.placeholder.com/64"}
                        sx={{ width: 80, height: 80, border: '3px solid white', mx: 'auto', mb: 1.5, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                    />
                    <Typography variant="h6" fontWeight="bold">{user.name}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Member ID: {customerCode || '-'}</Typography>
                </Box>

                <Box sx={{ mt: -6, px: 3 }}>
                    <Paper
                        elevation={4}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                            สแกนเพื่อสมัครสมาชิก
                        </Typography>

                        <Box
                            sx={{
                                p: 1.5,
                                border: '2px dashed #F54927',
                                borderRadius: 3,
                                bgcolor: '#fff',
                                mb: 2
                            }}
                        >
                            {referralUrl ? (
                                <QRCodeCanvas
                                    id="profile-qr-code"
                                    value={referralUrl}
                                    size={200}
                                    level={"H"}
                                    includeMargin={true}
                                    imageSettings={logoBase64 ? {
                                        src: logoBase64,
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    } : undefined}
                                />
                            ) : (
                                <Box sx={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">No Link</Typography>
                                </Box>
                            )}
                        </Box>

                        {/* ✅ ช่องแสดง Link ที่ปรับปรุงแล้ว */}
                        <TextField
                            inputRef={inputRef} // เชื่อม Ref เข้ากับ Input
                            fullWidth
                            size="small"
                            value={referralUrl || ''}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title={isCopied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}>
                                            <IconButton
                                                onClick={handleCopy}
                                                edge="end"
                                                color={isCopied ? "success" : "default"} // เปลี่ยนสีเมื่อกด
                                            >
                                                {/* เปลี่ยนไอคอนเมื่อกด */}
                                                {isCopied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 2,
                                    fontSize: '0.8rem',
                                    bgcolor: isCopied ? '#F0FDF4' : '#F9FAFB', // เปลี่ยนสีพื้นหลังเล็กน้อยเมื่อ copy
                                    transition: 'background-color 0.3s',
                                    '& input': { color: '#666' }
                                }
                            }}
                            sx={{ mb: 3 }}
                        />

                        <Divider flexItem sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">ตัวเลือกการแชร์</Typography>
                        </Divider>

                        <Stack direction="row" spacing={2} width="100%">
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<Share />}
                                onClick={handleShare}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: '#F54927',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#D83A1E', boxShadow: 'none' }
                                }}
                            >
                                แชร์
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<DownloadIcon />}
                                onClick={handleDownload}
                                sx={{
                                    borderRadius: 2,
                                    color: '#F54927',
                                    borderColor: '#F54927',
                                    '&:hover': { borderColor: '#D83A1E', bgcolor: '#FFF5F2' }
                                }}
                            >
                                บันทึก
                            </Button>
                        </Stack>

                    </Paper>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    เพื่อนของคุณจะได้รับสิทธิพิเศษเมื่อสมัครผ่านลิงก์นี้
                </Typography>
            </DialogContent>
        </Dialog>
    );
}