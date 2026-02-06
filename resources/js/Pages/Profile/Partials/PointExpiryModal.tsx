import React from 'react';
import { Dialog, DialogContent, Typography, Stack, Box, IconButton, Divider, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

interface PointExpiryModalProps {
    open: boolean;
    onClose: () => void;
}

export default function PointExpiryModal({ open, onClose }: PointExpiryModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (open) {
            setLoading(true);
            axios.get(route('privilege.point-expiry'))
                .then(res => {
                    setData(res.data.data);
                })
                .finally(() => setLoading(false));
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4, px: 1, pb: 1 } }}>
            <DialogContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight={900}>แต้มที่จะหมดอายุ</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>

                {loading ? (
                    <Box textAlign="center" py={4}><CircularProgress size={30} sx={{ color: '#FF8A00' }} /></Box>
                ) : (
                    <Stack spacing={1.5} sx={{ maxHeight: '50vh', overflowY: 'auto', py: 1 }}>
                        {data.length > 0 ? data.map((item, idx) => (
                            <Box key={idx} sx={{ p: 2, borderRadius: 3, bgcolor: item.is_urgent ? '#FFF5F5' : '#F8F9FA', border: `1px solid ${item.is_urgent ? '#FFC1C1' : '#EEE'}` }}>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" fontWeight={800}>{item.pname}</Typography>
                                    <Typography variant="body2" fontWeight={900} color="#F55014">+{item.points} P</Typography>
                                </Stack>
                                <Typography variant="caption" display="block" color="text.secondary">ได้รับ: {item.earned_at}</Typography>
                                <Typography variant="caption" fontWeight={700} color={item.is_urgent ? 'error.main' : 'text.secondary'}>
                                    หมดอายุ: {item.expired_at} {item.is_urgent && `(เหลืออีก ${item.days_left} วัน)`}
                                </Typography>
                            </Box>
                        )) : (
                            <Typography textAlign="center" color="text.secondary" py={2}>ไม่มีแต้มที่ใกล้หมดอายุ</Typography>
                        )}
                    </Stack>
                )}

                <Button fullWidth onClick={onClose} sx={{ mt: 2, bgcolor: '#EEE', color: '#333', borderRadius: 8, fontWeight: 700 }}>ปิด</Button>
            </DialogContent>
        </Dialog>
    );
}