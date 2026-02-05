import React, { useState } from 'react';
import MobileAuthenticatedLayout from '@/Layouts/MobileAuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Box, Card, CardContent, Typography, Stack, Chip,
    Stepper, Step, StepLabel, StepConnector,
    IconButton, Divider, Container, styled
} from '@mui/material';
import {
    stepConnectorClasses
} from '@mui/material/StepConnector';

// Icons
import {
    Package, Truck, CheckCircle, Clock,
    Copy, ChevronLeft, MapPin
} from 'lucide-react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// --- Components ---

// 1. Custom Stepper Connector (เส้นเชื่อม)
const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#FF7B00', // สีส้มเมื่อผ่านแล้ว
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#FF7B00',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? '#878787' : '#eaeaf0',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

// 2. Custom Step Icon
const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
    ({ theme, ownerState }) => ({
        color: theme.palette.mode === 'dark' ? '#878787' : '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
        ...(ownerState.active && {
            color: '#FF7B00',
        }),
        '& .QontoStepIcon-completedIcon': {
            color: '#FF7B00',
            zIndex: 1,
            fontSize: 18,
        },
        '& .QontoStepIcon-circle': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
    }),
);

function QontoStepIcon(props: any) {
    const { active, completed, className } = props;
    return (
        <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
            {completed ? (
                <CheckCircle className="QontoStepIcon-completedIcon" size={20} fill="#FF7B00" color="white" />
            ) : (
                <div className="QontoStepIcon-circle" />
            )}
        </QontoStepIconRoot>
    );
}

// 3. Copy Button Helper
const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <IconButton size="small" onClick={handleCopy} sx={{ ml: 0.5, p: 0.5, bgcolor: copied ? '#e8f5e9' : 'transparent' }}>
            {copied ? <CheckIcon sx={{ fontSize: 14, color: 'green' }} /> : <ContentCopyIcon sx={{ fontSize: 14, color: '#999' }} />}
        </IconButton>
    );
};

// --- Main Page ---
export default function OrderTracking({ orders }: { orders: any[] }) {

    // แปลงสถานะ DB เป็น Step Index (0-3)
    const getActiveStep = (status: string) => {
        switch (status) {
            case 'pending': return 0;
            case 'processing': return 1;
            case 'shipped': return 2;
            case 'completed': return 3;
            case 'cancelled': return -1;
            default: return 0;
        }
    };

    const steps = ['รับคำสั่งซื้อ', 'เตรียมสินค้า', 'จัดส่งแล้ว', 'สำเร็จ'];

    return (
        <MobileAuthenticatedLayout title="ติดตามพัสดุ">
            <Head title="ติดตามพัสดุ" />

            <Container maxWidth={false} disableGutters sx={{ mt: 7, pb: 4, px: 2 }}>

                {/* Header Back Button */}
                <Box sx={{ mb: 2 }}>
                    <Link href={route('privilege.index')} className="inline-flex items-center text-gray-600 no-underline hover:text-orange-500 transition-colors">
                        <ChevronLeft size={20} />
                        <Typography variant="body2" fontWeight={600}>กลับไปหน้าสิทธิพิเศษ</Typography>
                    </Link>
                </Box>

                {/* Title */}
                <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
                    <Box sx={{ p: 1, bgcolor: '#FFF3E0', borderRadius: '12px' }}>
                        <Truck className="text-orange-500" size={24} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} lineHeight={1.2}>ติดตามพัสดุ</Typography>
                        <Typography variant="caption" color="text.secondary">รายการของรางวัลที่รอจัดส่ง</Typography>
                    </Box>
                </Stack>

                {/* Orders List */}
                {orders.length > 0 ? (
                    <Stack spacing={2.5}>
                        {orders.map((order) => {
                            const activeStep = getActiveStep(order.status);
                            const isCancelled = order.status === 'cancelled';

                            return (
                                <Card key={order.id} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'visible' }}>
                                    <CardContent sx={{ p: 2.5 }}>

                                        {/* Header: Order No & Date */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                                    <Clock size={12} /> {dayjs(order.created_at).locale('th').add(543, 'year').format('D MMM YY HH:mm')}
                                                </Typography>
                                                <Stack direction="row" alignItems="center" mt={0.5}>
                                                    <Typography variant="subtitle2" fontWeight={700} color="primary">
                                                        #{order.order_number}
                                                    </Typography>
                                                    <CopyButton text={order.order_number} />
                                                </Stack>
                                            </Box>
                                            {isCancelled ? (
                                                <Chip label="ยกเลิก" size="small" color="error" variant="filled" sx={{ fontWeight: 700 }} />
                                            ) : (
                                                <Chip
                                                    label={order.status === 'completed' ? 'สำเร็จ' : (order.status === 'shipped' ? 'ส่งแล้ว' : 'กำลังดำเนินการ')}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: order.status === 'completed' ? '#E8F5E9' : '#FFF3E0',
                                                        color: order.status === 'completed' ? '#2E7D32' : '#E65100',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            )}
                                        </Stack>

                                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                                        {/* Product Details */}
                                        <Stack direction="row" spacing={2} mb={3}>
                                            <Box sx={{
                                                width: 60, height: 60, borderRadius: 2, bgcolor: '#f5f5f5',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <Package size={24} className="text-gray-400" />
                                                {/* ถ้ามีรูปสินค้าจริง ให้ใช้ <img /> แทน */}
                                            </Box>
                                            <Box flex={1}>
                                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4, mb: 0.5 }}>
                                                    {order.product_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ใช้คะแนน: {order.points_redeemed?.toLocaleString()} คะแนน
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {/* Stepper Status */}
                                        {!isCancelled && (
                                            <Box sx={{ width: '100%', mb: 2 }}>
                                                <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
                                                    {steps.map((label) => (
                                                        <Step key={label}>
                                                            <StepLabel StepIconComponent={QontoStepIcon}>
                                                                <Typography variant="caption" sx={{ fontWeight: 500, color: '#666' }}>{label}</Typography>
                                                            </StepLabel>
                                                        </Step>
                                                    ))}
                                                </Stepper>
                                            </Box>
                                        )}

                                        {/* Tracking Number Section */}
                                        {order.status === 'shipped' && order.tracking_number && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                    เลขพัสดุ (Tracking No.)
                                                </Typography>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Typography variant="body1" fontWeight={700} sx={{ letterSpacing: 1, color: '#333' }}>
                                                        {order.tracking_number}
                                                    </Typography>
                                                    <CopyButton text={order.tracking_number} />
                                                </Stack>
                                            </Box>
                                        )}

                                        {/* Address Preview */}
                                        {/* <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'start' }}>
                                            <MapPin size={14} className="text-gray-400 mt-0.5" />
                                            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                                                {order.address} {order.sub_district} {order.district} {order.province} {order.zipcode}
                                            </Typography>
                                        </Box> */}

                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                        <Package size={64} className="mx-auto mb-4 text-gray-300" />
                        <Typography variant="h6" color="text.secondary">ไม่มีรายการคำสั่งซื้อ</Typography>
                    </Box>
                )}

            </Container>
        </MobileAuthenticatedLayout>
    );
}