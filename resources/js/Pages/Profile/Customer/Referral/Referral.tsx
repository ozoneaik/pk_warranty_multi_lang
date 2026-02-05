// import React from 'react';
// import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
// import { Box, Typography, Paper, Button, Stack, IconButton, Grid } from "@mui/material";
// import { Head, router, usePage } from "@inertiajs/react";
// import { QRCodeCanvas } from 'qrcode.react';
// import { ArrowBack, ContentCopy, Share } from "@mui/icons-material"; // เพิ่มไอคอน Share
// import Swal from 'sweetalert2';

// export default function Referral() {
//     const { auth, referral_url, referral_code } = usePage().props as any;
//     const shareLink = referral_url;

//     const handleCopy = async () => {
//         if (!shareLink) return;

//         try {
//             if (navigator.clipboard && navigator.clipboard.writeText) {
//                 await navigator.clipboard.writeText(shareLink);
//             } else {
//                 // Fallback สำหรับ Browser เก่า หรือ HTTP
//                 const textArea = document.createElement("textarea");
//                 textArea.value = shareLink;
//                 document.body.appendChild(textArea);
//                 textArea.select();
//                 document.execCommand('copy');
//                 document.body.removeChild(textArea);
//             }

//             Swal.fire({
//                 icon: 'success',
//                 title: 'คัดลอกลิงก์สำเร็จ',
//                 showConfirmButton: false,
//                 timer: 1500
//             });
//         } catch (err) {
//             console.error('Failed to copy: ', err);
//         }
//     };

//     const handleShare = async () => {
//         if (navigator.share) {
//             try {
//                 await navigator.share({
//                     title: 'แนะนำเพื่อนรับแต้มฟรีจาก Pumpkin!',
//                     text: `สมัครสมาชิก Pumpkin วันนี้ รับแต้มสะสมทันที! รหัสแนะนำ: ${referral_code}`,
//                     url: shareLink,
//                 });
//             } catch (error) {
//                 // กรณีผู้ใช้กดยกเลิกการแชร์ (AbortError) ไม่ต้องทำอะไร
//                 // แต่ถ้าเป็น Error อื่นให้แจ้งเตือน
//                 if ((error as Error).name !== 'AbortError') {
//                     console.error('Error sharing:', error);
//                     handleCopy(); // ถ้าแชร์มีปัญหา ให้เปลี่ยนเป็นคัดลอกแทน
//                 }
//             }
//         } else {
//             // ถ้าเบราว์เซอร์ไม่รองรับ navigator.share ให้ทำการคัดลอกลิงก์แทนทันที
//             handleCopy();
//         }
//     };

//     const goBack = () => {
//         router.visit(route('warranty.home'));
//     };

//     return (
//         <MobileAuthenticatedLayout title="แนะนำเพื่อน">
//             <Head title="แนะนำเพื่อน" />
//             <Box
//                 sx={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     px: 1,
//                     py: 12,
//                     gap: 1,
//                 }}
//             >
//                 <Typography
//                     variant="h5"
//                     fontWeight={900}
//                     align="center"
//                     sx={{ color: '#F54927' }}
//                 >
//                     ชวนเพื่อนมาเป็นครอบครัวเดียวกัน 🧡
//                 </Typography>

//                 <Typography
//                     variant="body2"
//                     align="center"
//                     color="text.secondary"
//                     sx={{ maxWidth: 320 }}
//                 >
//                     แชร์ลิงก์ให้เพื่อนสมัครสมาชิก Pumpkin
//                     รับแต้มสะสมพิเศษทั้งคุณและเพื่อน
//                 </Typography>

//                 {/* QR Code Section */}
//                 <Paper
//                     elevation={0}
//                     sx={{
//                         p: 3,
//                         borderRadius: 4,
//                         border: '2px dashed #F54927',
//                         bgcolor: '#FFF',
//                         textAlign: 'center',
//                     }}
//                 >
//                     <QRCodeCanvas 
//                     value={shareLink} 
//                     size={180} 
//                     />
//                     <Typography
//                         variant="caption"
//                         fontWeight="bold"
//                         sx={{ mt: 1, display: 'block', color: '#F54927' }}
//                     >
//                         Scan to Join us
//                     </Typography>
//                 </Paper>

//                 <Stack spacing={2}>
//                     {/* Display Referral Code */}
//                     <Paper
//                         sx={{
//                             width: '100%',
//                             p: 2,
//                             borderRadius: 3,
//                             bgcolor: '#FFF8E1',
//                             border: '1px solid #FFE082',
//                             textAlign: 'center',
//                             position: 'relative',
//                         }}
//                     >
//                         <Typography variant="caption" color="text.secondary">
//                             รหัสแนะนำของคุณ
//                         </Typography>

//                         <Typography
//                             variant="h4"
//                             fontWeight={900}
//                             sx={{ color: '#E65100', letterSpacing: 2 }}
//                         >
//                             {referral_code}
//                         </Typography>

//                         <IconButton
//                             size="small"
//                             onClick={handleCopy}
//                             sx={{ position: 'absolute', top: 8, right: 8 }}
//                         >
//                             <ContentCopy fontSize="small" />
//                         </IconButton>
//                     </Paper>

//                     {/* --- ส่วนที่เพิ่มใหม่: แสดง Referral Link --- */}
//                     <Box sx={{ width: '100%' }}>
//                         <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
//                             ลิงก์แนะนำของคุณ
//                         </Typography>

//                         <Paper
//                             onClick={handleCopy}
//                             sx={{
//                                 p: 1.5,
//                                 borderRadius: 2,
//                                 bgcolor: '#f5f5f5',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 cursor: 'pointer',
//                             }}
//                         >
//                             <Typography
//                                 noWrap
//                                 sx={{
//                                     flex: 1,
//                                     fontFamily: 'monospace',
//                                     fontSize: 12,
//                                     color: '#666',
//                                 }}
//                             >
//                                 {shareLink}
//                             </Typography>
//                             <ContentCopy sx={{ fontSize: 16, color: '#999', ml: 1 }} />
//                         </Paper>
//                     </Box>
//                     {/* ---------------------------------- */}

//                     {/* Share Buttons */}
//                     <Grid container spacing={1.5}>
//                         {/* <Grid size={6}>
//                             <Button
//                                 variant="outlined"
//                                 fullWidth
//                                 size="large"
//                                 startIcon={<ContentCopy />}
//                                 onClick={handleCopy}
//                                 sx={{
//                                     borderRadius: 3, py: 1.5, color: '#F54927',
//                                     borderColor: '#F54927', fontWeight: 'bold'
//                                 }}
//                             >
//                                 คัดลอกลิงก์
//                             </Button>
//                         </Grid> */}
//                         <Grid size={6}>
//                             <Button
//                                 fullWidth
//                                 size="large"
//                                 variant="contained"
//                                 startIcon={<Share />}
//                                 onClick={handleShare}
//                                 sx={{
//                                     bgcolor: '#F54927',
//                                     borderRadius: 3,
//                                     py: 1.6,
//                                     fontWeight: 'bold',
//                                     '&:hover': { bgcolor: '#d83d1f' },
//                                 }}
//                             >
//                                 แชร์ให้เพื่อน
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </Stack>

//                 <Box sx={{ mt: 1, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
//                     <Typography
//                         variant="caption"
//                         align="center"
//                         color="text.secondary"
//                         sx={{ mt: 1 }}
//                     >
//                         * คุณจะได้รับแต้มเมื่อเพื่อนสมัครผ่านลิงก์นี้และสมัครสมาชิกสำเร็จ
//                     </Typography>
//                 </Box>
//             </Box>
//         </MobileAuthenticatedLayout>
//     );
// }
import React, { useEffect, useState } from 'react';
import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Typography, Paper, Button, Stack, IconButton, Grid } from "@mui/material";
import { Head, router, usePage } from "@inertiajs/react";
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowBack, ContentCopy, Share } from "@mui/icons-material";
import Swal from 'sweetalert2';

import PumpkinLogo from '../../../../assets/logo/pumpkin.png';

export default function Referral() {
    const { auth, referral_url, referral_code } = usePage().props as any;
    const shareLink = referral_url;

    // State เก็บ Base64 Logo
    const [logoBase64, setLogoBase64] = useState<string>("");

    // แปลง Logo เป็น Base64 เมื่อโหลดหน้าเว็บ
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

    const handleCopy = async () => {
        if (!shareLink) return;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareLink);
            } else {
                // Fallback สำหรับ Browser เก่า หรือ HTTP
                const textArea = document.createElement("textarea");
                textArea.value = shareLink;
                textArea.style.position = "fixed"; // กันจอกระตุก
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                    return;
                }
                document.body.removeChild(textArea);
            }

            Swal.fire({
                icon: 'success',
                title: 'คัดลอกลิงก์สำเร็จ',
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top',
            });
        } catch (err) {
            console.error('Failed to copy: ', err);
            Swal.fire({
                icon: 'error',
                title: 'คัดลอกไม่สำเร็จ',
                toast: true,
                position: 'top',
                timer: 2000
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'แนะนำเพื่อนรับแต้มฟรีจาก Pumpkin!',
                    text: `สมัครสมาชิก Pumpkin วันนี้ รับแต้มสะสมทันที! รหัสแนะนำ: ${referral_code}`,
                    url: shareLink,
                });
            } catch (error) {
                // ถ้ากดแชร์แล้วยกเลิก ไม่ต้องทำอะไร
            }
        } else {
            handleCopy();
        }
    };

    const goBack = () => {
        router.visit(route('warranty.home'));
    };

    return (
        <MobileAuthenticatedLayout title="แนะนำเพื่อน">
            <Head title="แนะนำเพื่อน" />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    px: 2,
                    py: 7,
                    gap: 2,
                    mt: 5
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={900}
                    align="center"
                    sx={{ color: '#F54927' }}
                >
                    ชวนเพื่อนมาเป็นครอบครัวเดียวกัน 🧡
                </Typography>

                <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                    sx={{ maxWidth: 320, mb: 2 }}
                >
                    แชร์ลิงก์ให้เพื่อนสมัครสมาชิก Pumpkin
                    รับแต้มสะสมพิเศษทั้งคุณและเพื่อน
                </Typography>

                {/* QR Code Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        border: '2px dashed #F54927',
                        bgcolor: '#FFF',
                        textAlign: 'center',
                        mb: 2
                    }}
                >
                    <QRCodeCanvas
                        value={shareLink}
                        size={200}
                        level={"H"} // High Error Correction (สำคัญสำหรับใส่ Logo)
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
                    <Typography
                        variant="caption"
                        fontWeight="bold"
                        sx={{ mt: 1, display: 'block', color: '#F54927' }}
                    >
                        Scan to Join us
                    </Typography>
                </Paper>

                <Stack spacing={2} width="100%" maxWidth={400}>
                    {/* Display Referral Code */}
                    <Paper
                        sx={{
                            width: '100%',
                            p: 2,
                            borderRadius: 3,
                            bgcolor: '#FFF8E1',
                            border: '1px solid #FFE082',
                            textAlign: 'center',
                            position: 'relative',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            รหัสแนะนำของคุณ
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={900}
                            sx={{ color: '#E65100', letterSpacing: 2, my: 1 }}
                        >
                            {referral_code}
                        </Typography>

                        <IconButton
                            size="small"
                            onClick={() => {
                                // Copy เฉพาะรหัส
                                if (navigator.clipboard) navigator.clipboard.writeText(referral_code);
                                Swal.fire({ icon: 'success', title: 'คัดลอกรหัสแล้ว', toast: true, position: 'top', timer: 1000, showConfirmButton: false });
                            }}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                        >
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Paper>

                    {/* Display Referral Link */}
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            ลิงก์แนะนำของคุณ
                        </Typography>

                        <Paper
                            onClick={handleCopy}
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                border: '1px solid #eee'
                            }}
                        >
                            <Typography
                                noWrap
                                sx={{
                                    flex: 1,
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    color: '#666',
                                }}
                            >
                                {shareLink}
                            </Typography>
                            <ContentCopy sx={{ fontSize: 16, color: '#999', ml: 1 }} />
                        </Paper>
                    </Box>

                    {/* Share Buttons */}
                    <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        startIcon={<Share />}
                        onClick={handleShare}
                        sx={{
                            bgcolor: '#F54927',
                            borderRadius: 3,
                            py: 1.6,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(245, 73, 39, 0.3)',
                            '&:hover': { bgcolor: '#d83d1f' },
                        }}
                    >
                        แชร์ให้เพื่อน
                    </Button>
                </Stack>

                <Box sx={{ mt: 1, p: 2, bgcolor: '#f9f9f9', borderRadius: 2, width: '100%', maxWidth: 400 }}>
                    <Typography
                        variant="caption"
                        align="center"
                        color="text.secondary"
                        display="block"
                    >
                        * คุณจะได้รับแต้มเมื่อเพื่อนสมัครผ่านลิงก์นี้และสมัครสมาชิกสำเร็จ
                    </Typography>
                </Box>
            </Box>
        </MobileAuthenticatedLayout>
    );
}