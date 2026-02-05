import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, TextField, MenuItem, Chip, Pagination, Stack, InputAdornment, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// --- Types ---
interface ReferralItem {
    id: number;
    referrer_uid: string;
    referrer_name: string;
    status_referrer: 'pending' | 'success' | 'failed' | string;
    points_referrer: number;
    referee_uid: string;
    referee_name: string;
    registered_at: string;
    created_at: string;
}

interface PageProps {
    items: {
        data: ReferralItem[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

// --- Status Helper ---
const getStatusChip = (status: string) => {
    switch (status) {
        case 'success': return <Chip label="ได้รับรางวัลแล้ว" color="success" size="small" variant="filled" />;
        case 'pending': return <Chip label="รอตรวจสอบ" color="warning" size="small" variant="outlined" />;
        case 'failed': return <Chip label="ไม่ผ่านเงื่อนไข" color="error" size="small" variant="outlined" />;
        default: return <Chip label={status} size="small" />;
    }
};

export default function ReportFGF({ items, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [typingTimeout, setTypingTimeout] = useState<any>(0);

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route('reports.fgf'),
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true }
        );
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(setTimeout(() => handleFilterChange('search', val), 500));
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        router.get(
            route('reports.fgf'),
            { ...filters, search, status, page: value },
            { preserveState: true }
        );
    };

    const goBack = () => {
        router.get(route('admin.reports.index'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <button
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">รายงาน Friend Get Friend (FGF)</h2>
                </div>
            }
        >
            <Head title="รายงาน FGF" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* <div className="mb-4">
                        <button
                            onClick={goBack}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                        >
                            ← กลับไปหน้ารายงาน
                        </button>
                    </div> */}
                    {/* --- Filter Bar --- */}
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #eee' }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                            <TextField
                                label="ค้นหา (ชื่อ/ID ผู้เชิญ หรือ ผู้ถูกเชิญ)"
                                variant="outlined"
                                size="small"
                                value={search}
                                onChange={onSearchChange}
                                sx={{ flexGrow: 1 }}
                                InputProps={{
                                    startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
                                }}
                            />
                            <TextField
                                select
                                label="สถานะรางวัล (ผู้เชิญ)"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    handleFilterChange('status', e.target.value);
                                }}
                                size="small"
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="all">ทั้งหมด</MenuItem>
                                <MenuItem value="success">ได้รับรางวัลแล้ว</MenuItem>
                                <MenuItem value="pending">รอตรวจสอบ</MenuItem>
                                <MenuItem value="failed">ไม่ผ่านเงื่อนไข</MenuItem>
                            </TextField>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => router.visit(route('reports.fgf'))}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Paper>

                    {/* --- Data Table --- */}
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #eee' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>วันที่สมัครสมาชิก</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID ผู้ถูกเชิญ</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อสมาชิก (ผู้ถูกเชิญ)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID ผู้เชิญ</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ชื่อผู้เชิญ</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะการรับรางวัล</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.data.length > 0 ? (
                                    items.data.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>
                                                {row.registered_at
                                                    ? dayjs(row.registered_at).locale('th').add(543, 'year').format('D MMM YY HH:mm')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: '#f5f5f5', px: 1, borderRadius: 1, display: 'inline-block' }}>
                                                    {row.referee_uid}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{row.referee_name}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: '#f0f7ff', px: 1, borderRadius: 1, display: 'inline-block', color: '#1976d2' }}>
                                                    {row.referrer_uid}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{row.referrer_name}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {getStatusChip(row.status_referrer)}
                                                {row.points_referrer > 0 && (
                                                    <Typography variant="caption" display="block" color="success.main" mt={0.5} fontWeight={600}>
                                                        +{row.points_referrer} Points
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                            <Typography color="text.secondary">ไม่พบข้อมูล Friend Get Friend</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                แสดง {items.data.length} จากทั้งหมด {items.total} รายการ
                            </Typography>
                            <Pagination
                                count={items.last_page}
                                page={items.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    </TableContainer>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}