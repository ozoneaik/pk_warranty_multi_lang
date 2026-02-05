import React from 'react';
import {
    Dialog, DialogContent, Typography, Box, Button, IconButton, keyframes,
    Divider,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'; // หรือใช้รูปเหรียญของคุณ

// Animation ให้เหรียญเด้งๆ
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
`;

interface PointItem {
    id: number;
    title: string;
    point: number;
    date: string;
}

interface EarnPointModalProps {
    open: boolean;
    onClose: () => void;
    points: number;
    title?: string;
    items: PointItem[];
    message?: string;
}

export default function EarnPointModal({ open, onClose, points, items = [], title = "ยินดีด้วย! คุณได้รับคะแนน", message = "คุณได้รับคะแนนสะสม" }: EarnPointModalProps) {
    const totalPoints = items.reduce((sum, item) => sum + item.point, 0);
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: 20,
                    overflow: 'visible',
                    padding: '20px',
                    textAlign: 'center'
                }
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ px: 2, pb: 4, pt: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Icon / Image */}
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: '#FFF8E1',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            animation: `${bounce} 2s infinite`,
                            boxShadow: '0 0 20px rgba(255, 193, 7, 0.4)'
                        }}
                    >
                        <WorkspacePremiumIcon sx={{ fontSize: 60, color: '#FFC107' }} />
                    </Box>

                    <Typography variant="h5" fontWeight="800" sx={{ color: '#333', mb: 1 }}>
                        {title}
                    </Typography>
                    {/* ✅ ส่วนแสดงรายการ (List Area) */}
                    <Box sx={{
                        width: '100%',
                        maxHeight: '250px',
                        overflowY: 'auto',
                        mb: 2,
                        pr: 0.5,
                        // Custom Scrollbar
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#ddd', borderRadius: '4px' }
                    }}>
                        <Stack spacing={1.5}>
                            {items.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        bgcolor: 'white',
                                        p: 1.5,
                                        borderRadius: 3,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                        border: '1px solid #f0f0f0'
                                    }}
                                >
                                    <Box textAlign="left">
                                        <Typography variant="body2" fontWeight="700" color="#333">
                                            {item.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.date}
                                        </Typography>
                                    </Box>

                                    <Typography variant="h6" fontWeight="900" sx={{ color: '#F54927' }}>
                                        +{item.point}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    {/* สรุปยอดรวม (ถ้ามีหลายรายการ) */}
                    {items.length > 1 && (
                        <>
                            <Divider sx={{ width: '100%', my: 1, borderStyle: 'dashed' }} />
                            <Box display="flex" justifyContent="space-between" width="100%" px={1} mb={1}>
                                <Typography variant="body2" fontWeight="bold" color="text.secondary">รวมทั้งหมด</Typography>
                                <Typography variant="h6" fontWeight="900" color="#F54927">+{totalPoints} แต้ม</Typography>
                            </Box>
                        </>
                    )}
                    {/* <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {message}
                    </Typography>

                    <Typography
                        variant="h2"
                        fontWeight="900"
                        sx={{
                            color: '#F54927',
                            textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                            mb: 1
                        }}
                    >
                        +{points}
                    </Typography>

                    <Typography variant="h6" color="text.secondary" fontWeight="bold">
                        POINTS
                    </Typography> */}

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onClose}
                        sx={{
                            mt: 4,
                            bgcolor: '#F54927',
                            color: 'white',
                            borderRadius: '50px',
                            py: 1.5,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(245, 73, 39, 0.4)',
                            '&:hover': {
                                bgcolor: '#d63a1b'
                            }
                        }}
                    >
                        ตกลง
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}