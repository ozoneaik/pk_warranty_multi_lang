// import React, { useState, useEffect } from 'react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head, router } from '@inertiajs/react';
// import {
//     Box,
//     Paper,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Typography,
//     TextField,
//     MenuItem,
//     Chip,
//     Pagination,
//     Stack,
//     IconButton,
//     InputAdornment,
//     Button
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import dayjs from 'dayjs';
// import 'dayjs/locale/th';

// // --- Types ---
// interface Order {
//     id: number;
//     order_number: string;
//     customer_name: string;
//     phone_number: string;
//     product_name: string;
//     quantity: number;
//     points_redeemed: number;
//     status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
//     tracking_number: string | null;
//     created_at: string;
// }

// interface PageProps {
//     orders: {
//         data: Order[];
//         current_page: number;
//         last_page: number;
//         total: number;
//         per_page: number;
//     };
//     filters: {
//         search?: string;
//         status?: string;
//     };
// }

// // --- Status Helper ---
// const getStatusChip = (status: string) => {
//     switch (status) {
//         case 'pending': return <Chip label="รอตรวจสอบ" color="warning" size="small" variant="outlined" />;
//         case 'processing': return <Chip label="กำลังเตรียม" color="info" size="small" variant="outlined" />;
//         case 'shipped': return <Chip label="จัดส่งแล้ว" color="primary" size="small" icon={<LocalShippingIcon />} />;
//         case 'completed': return <Chip label="สำเร็จ" color="success" size="small" />;
//         case 'cancelled': return <Chip label="ยกเลิก" color="error" size="small" />;
//         default: return <Chip label={status} size="small" />;
//     }
// };

// export default function OrderReport({ orders, filters }: PageProps) {
//     // State for filters
//     const [search, setSearch] = useState(filters.search || '');
//     const [status, setStatus] = useState(filters.status || 'all');
//     const [typingTimeout, setTypingTimeout] = useState<any>(0);

//     // Function to handle filter change
//     const handleFilterChange = (key: string, value: string) => {
//         router.get(
//             route('admin.reports.orders.index'),
//             { ...filters, [key]: value, page: 1 }, // Reset to page 1 on filter
//             { preserveState: true, replace: true }
//         );
//     };

//     // Debounce Search Input
//     const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const val = e.target.value;
//         setSearch(val);

//         if (typingTimeout) clearTimeout(typingTimeout);

//         setTypingTimeout(setTimeout(() => {
//             handleFilterChange('search', val);
//         }, 500));
//     };

//     // Pagination Handler
//     const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
//         router.get(
//             route('admin.reports.orders.index'),
//             { ...filters, search, status, page: value },
//             { preserveState: true }
//         );
//     };
//     //go back
//     const goBack = () => {
//         router.get(route('admin.reports.index'));
//     };
//     return (
//         <AuthenticatedLayout
//             header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">รายงานคำสั่งซื้อ (Order Report)</h2>}
//         >
//             <Head title="รายงานคำสั่งซื้อ" />

//             <div className="py-7">
//                 <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//                     {/* go back button */}
//                     <div className="mb-4">
//                         <button
//                             onClick={goBack}
//                             className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
//                         >
//                             ← กลับไปหน้ารายงาน
//                         </button>
//                     </div>
//                     {/* --- Filter Section --- */}
//                     <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #eee' }}>
//                         <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
//                             <TextField
//                                 label="ค้นหา (เลข Order, ชื่อ, เบอร์โทร)"
//                                 variant="outlined"
//                                 size="small"
//                                 value={search}
//                                 onChange={onSearchChange}
//                                 sx={{ flexGrow: 1, width: { xs: '100%', md: 'auto' } }}
//                                 InputProps={{
//                                     startAdornment: (
//                                         <InputAdornment position="start">
//                                             <SearchIcon color="action" />
//                                         </InputAdornment>
//                                     ),
//                                 }}
//                             />

//                             <TextField
//                                 select
//                                 label="สถานะ"
//                                 value={status}
//                                 onChange={(e) => {
//                                     setStatus(e.target.value);
//                                     handleFilterChange('status', e.target.value);
//                                 }}
//                                 size="small"
//                                 sx={{ minWidth: 150, width: { xs: '100%', md: 'auto' } }}
//                             >
//                                 <MenuItem value="all">ทั้งหมด</MenuItem>
//                                 <MenuItem value="pending">รอตรวจสอบ</MenuItem>
//                                 <MenuItem value="processing">กำลังเตรียมสินค้า</MenuItem>
//                                 <MenuItem value="shipped">จัดส่งแล้ว</MenuItem>
//                                 <MenuItem value="completed">สำเร็จ</MenuItem>
//                                 <MenuItem value="cancelled">ยกเลิก</MenuItem>
//                             </TextField>

//                             <Button
//                                 variant="outlined"
//                                 startIcon={<RefreshIcon />}
//                                 onClick={() => router.visit(route('admin.reports.orders.index'))}
//                             >
//                                 Reset
//                             </Button>
//                         </Stack>
//                     </Paper>

//                     {/* --- Table Section --- */}
//                     <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #eee' }}>
//                         <Table sx={{ minWidth: 650 }}>
//                             <TableHead sx={{ bgcolor: '#F9FAFB' }}>
//                                 <TableRow>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>วันที่สั่งซื้อ</TableCell>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>Order No.</TableCell>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>ลูกค้า</TableCell>
//                                     <TableCell sx={{ fontWeight: 'bold' }}>สินค้า</TableCell>
//                                     <TableCell align="center" sx={{ fontWeight: 'bold' }}>คะแนนที่ใช้</TableCell>
//                                     <TableCell align="center" sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
//                                     {/* <TableCell align="center" sx={{ fontWeight: 'bold' }}>จัดการ</TableCell> */}
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {orders.data.length > 0 ? (
//                                     orders.data.map((row) => (
//                                         <TableRow key={row.id} hover>
//                                             <TableCell>
//                                                 {dayjs(row.created_at).locale('th').add(543, 'year').format('D MMM YY HH:mm')}
//                                             </TableCell>
//                                             <TableCell>
//                                                 <Typography variant="body2" fontWeight={600} color="primary">{row.order_number}</Typography>
//                                             </TableCell>
//                                             <TableCell>
//                                                 <Typography variant="body2">{row.customer_name}</Typography>
//                                                 <Typography variant="caption" color="text.secondary">{row.phone_number}</Typography>
//                                             </TableCell>
//                                             <TableCell>
//                                                 <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{row.product_name}</Typography>
//                                                 <Typography variant="caption" color="text.secondary">x {row.quantity}</Typography>
//                                             </TableCell>
//                                             <TableCell align="center">
//                                                 {row.points_redeemed.toLocaleString()}
//                                             </TableCell>
//                                             <TableCell align="center">
//                                                 {getStatusChip(row.status)}
//                                                 {row.tracking_number && (
//                                                     <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
//                                                         {row.tracking_number}
//                                                     </Typography>
//                                                 )}
//                                             </TableCell>
//                                             {/* <TableCell align="center">
//                                                 <IconButton size="small" color="primary">
//                                                     <VisibilityIcon fontSize="small" />
//                                                 </IconButton>
//                                             </TableCell> */}
//                                         </TableRow>
//                                     ))
//                                 ) : (
//                                     <TableRow>
//                                         <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
//                                             <Typography color="text.secondary">ไม่พบข้อมูลคำสั่งซื้อ</Typography>
//                                         </TableCell>
//                                     </TableRow>
//                                 )}
//                             </TableBody>
//                         </Table>

//                         {/* Pagination */}
//                         <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <Typography variant="caption" color="text.secondary">
//                                 แสดง {orders.data.length} จากทั้งหมด {orders.total} รายการ
//                             </Typography>
//                             <Pagination
//                                 count={orders.last_page}
//                                 page={orders.current_page}
//                                 onChange={handlePageChange}
//                                 color="primary"
//                                 shape="rounded"
//                             />
//                         </Box>
//                     </TableContainer>

//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }

import React, { useState, FormEvent } from 'react';
import { Head, router, Link } from '@inertiajs/react';

// MUI Icons
import {
    Search as MagnifyingGlassIcon,
    FilterList,
    Visibility as EyeIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    LocalShipping as ShippingIcon,
    HourglassEmpty as PendingIcon,
    Refresh as RefreshIcon,
    CloudSync as SyncIcon
} from '@mui/icons-material';

// Lucide Icons
import { ArrowLeft, Calendar, CheckIcon, CopyIcon, Package } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Tooltip
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// --- Interfaces ---
interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    phone_number: string;
    product_code: string;
    product_name: string;
    quantity: number;
    points_redeemed: number;
    status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    tracking_number: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}

interface Props {
    orders: PaginatedResponse<Order>;
    filters: Filters;
}

// --- Component ---
export default function OrderReport({ orders, filters }: Props) {

    // 1. Filter State
    const [searchValues, setSearchValues] = useState({
        search: filters.search || '',
        status: filters.status || 'all',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    // 2. State for Status Update Dialog
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    // 3. Handle Search
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const queryParams = Object.fromEntries(
            Object.entries(searchValues).filter(([_, v]) => v !== '' && v !== 'all')
        );

        router.get(route('admin.reports.orders.index'), queryParams as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // 4. Handle Status Change Request
    const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>, order: Order) => {
        setSelectedOrder(order);
        setStatusMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setStatusMenuAnchor(null);
    };

    const handleSelectStatus = (status: string) => {
        setNewStatus(status);
        setConfirmDialogOpen(true);
        handleMenuClose();
    };

    const confirmStatusUpdate = () => {
        if (selectedOrder && newStatus) {
            router.post(route('admin.reports.orders.updateStatus', selectedOrder.id), {
                status: newStatus,
                _method: 'PATCH' // Force PATCH method
            }, {
                onSuccess: () => {
                    setConfirmDialogOpen(false);
                    setSelectedOrder(null);
                }
            });
        }
    };

    // Helper: Status Chip
    const getStatusChip = (status: string) => {
        const config: any = {
            pending: { label: 'รอตรวจสอบ', color: 'warning', icon: <PendingIcon fontSize="small" /> },
            processing: { label: 'กำลังเตรียม', color: 'info', icon: <Package size={16} /> },
            shipped: { label: 'จัดส่งแล้ว', color: 'primary', icon: <ShippingIcon fontSize="small" /> },
            completed: { label: 'สำเร็จ', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
            cancelled: { label: 'ยกเลิก', color: 'error', icon: <CancelIcon fontSize="small" /> },
        };
        const item = config[status] || { label: status, color: 'default' };

        return (
            <Chip
                label={item.label}
                color={item.color}
                size="small"
                icon={item.icon}
                variant="outlined"
                sx={{ fontWeight: 500 }}
            />
        );
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).locale('th').add(543, 'year').format('D MMM YY HH:mm');
    };

    const goBack = () => {
        router.get(route('admin.reports.index'));
    };

    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);

        const handleCopy = async (e: React.MouseEvent) => {
            e.stopPropagation();

            // ฟังก์ชันจัดการ Success State
            const onCopySuccess = () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            };

            // 1. ลองใช้วิธีใหม่ (Modern API) - ใช้ได้เฉพาะ HTTPS หรือ Localhost
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    onCopySuccess();
                    return;
                } catch (err) {
                    console.error("Clipboard API failed, trying fallback...", err);
                }
            }

            // 2. วิธีสำรอง (Fallback) - ใช้ได้กับ HTTP ทั่วไป
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;

                // ซ่อน TextArea ไม่ให้ User เห็น
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    onCopySuccess();
                } else {
                    console.error("Fallback copy failed.");
                }
            } catch (err) {
                console.error("Unable to copy", err);
            }
        };

        return (
            <Tooltip title={copied ? "คัดลอกเรียบร้อย!" : "คัดลอกเลข Order"}>
                <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{
                        ml: 1,
                        color: copied ? 'success.main' : 'action.active',
                        bgcolor: copied ? 'success.light' : 'transparent',
                        '&:hover': { bgcolor: copied ? 'success.light' : 'rgba(0, 0, 0, 0.04)' },
                        transition: 'all 0.2s',
                        width: 24,
                        height: 24,
                    }}
                >
                    {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                </IconButton>
            </Tooltip>
        );
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
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">จัดการคำสั่งซื้อ</h2>
                </div>
            }
        >
            <Head title="จัดการคำสั่งซื้อ" />
            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Header */}
                        <div className="mb-8">
                            {/* <Link href={route('admin.reports.index')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group text-sm">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            กลับไปหน้ารายงาน
                            </Link> */}

                            <div className="flex items-center justify-between">
                                <div>
                                    {/* <h1 className="text-3xl font-bold text-gray-800 mb-1">จัดการคำสั่งซื้อ</h1> */}
                                    {/* <p className="text-gray-500 text-sm">ตรวจสอบและอัปเดตสถานะการแลกของรางวัล</p> */}
                                </div>
                                <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm text-gray-600">ข้อมูลล่าสุด</span>
                                </div>
                            </div>
                        </div>

                        {/* Filter Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center gap-2 mb-4 text-gray-700">
                                <FilterList fontSize="small" />
                                <span className="font-semibold">ค้นหาและกรอง</span>
                            </div>

                            <form onSubmit={handleSearch}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    {/* Search Text */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MagnifyingGlassIcon className="text-gray-400" fontSize="small" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="เลข Order, ชื่อลูกค้า, เบอร์โทร"
                                                value={searchValues.search}
                                                onChange={(e) => setSearchValues({ ...searchValues, search: e.target.value })}
                                                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                        <select
                                            value={searchValues.status}
                                            onChange={(e) => setSearchValues({ ...searchValues, status: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="all">ทั้งหมด</option>
                                            <option value="pending">รอตรวจสอบ</option>
                                            <option value="processing">กำลังเตรียม</option>
                                            <option value="shipped">จัดส่งแล้ว</option>
                                            <option value="completed">สำเร็จ</option>
                                            <option value="cancelled">ยกเลิก</option>
                                        </select>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            ค้นหา
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.visit(route('admin.reports.orders.index'))}
                                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors shadow-sm"
                                        >
                                            <RefreshIcon fontSize="small" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Order No.</th>
                                            <th className="px-6 py-4 font-semibold">วันที่สั่งซื้อ</th>
                                            <th className="px-6 py-4 font-semibold">ลูกค้า</th>
                                            <th className="px-6 py-4 font-semibold">รหัสสินค้า</th>
                                            <th className="px-6 py-4 font-semibold">สินค้า</th>
                                            <th className="px-6 py-4 font-semibold text-center">แต้มที่ใช้</th>
                                            <th className="px-6 py-4 font-semibold text-center">สถานะ</th>
                                            <th className="px-6 py-4 font-semibold text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.data.length > 0 ? (
                                            orders.data.map((order) => (
                                                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-blue-600">
                                                        {order.order_number}
                                                        <CopyButton text={order.order_number} />
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{order.customer_name}</div>
                                                        <div className="text-xs text-gray-500">{order.phone_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{order.product_code}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-900 line-clamp-1">{order.product_name}</div>
                                                        <div className="text-xs text-gray-500">จำนวน: {order.quantity}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-medium text-orange-600">
                                                        {order.points_redeemed.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusChip(order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Tooltip title="เช็คสถานะจากระบบภายนอก">
                                                                <IconButton
                                                                    size="small"
                                                                    color="info"
                                                                    onClick={() => {
                                                                        // ใช้ router.post เพื่อยิงไปที่ route sync
                                                                        router.post(route('admin.reports.orders.sync', order.id), {}, {
                                                                            preserveScroll: true,
                                                                            onSuccess: () => {
                                                                                // อาจจะใส่ Swal.fire แจ้งเตือนก็ได้
                                                                            }
                                                                        });
                                                                    }}
                                                                    disabled={order.status === 'cancelled' || order.status === 'completed'} // ปิดถ้าจบงานแล้ว
                                                                >
                                                                    <SyncIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={(e) => handleStatusClick(e, order)}
                                                                disabled={order.status === 'cancelled' || order.status === 'completed'}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                                    ไม่พบข้อมูลคำสั่งซื้อ
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {orders.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        แสดง {orders.from} ถึง {orders.to} จาก {orders.total} รายการ
                                    </span>
                                    <div className="flex gap-1">
                                        {orders.links.map((link, key) => (
                                            link.url ? (
                                                <Link
                                                    key={key}
                                                    href={link.url}
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                                        }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={key}
                                                    className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Update Menu */}
                    <Menu
                        anchorEl={statusMenuAnchor}
                        open={Boolean(statusMenuAnchor)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => handleSelectStatus('processing')} disabled={selectedOrder?.status === 'processing'}>กำลังเตรียมสินค้า</MenuItem>
                        <MenuItem onClick={() => handleSelectStatus('shipped')} disabled={selectedOrder?.status === 'shipped'}>จัดส่งแล้ว</MenuItem>
                        <MenuItem onClick={() => handleSelectStatus('completed')} sx={{ color: 'green' }}>ทำรายการสำเร็จ (จบงาน)</MenuItem>
                        <MenuItem onClick={() => handleSelectStatus('cancelled')} sx={{ color: 'red' }}>ยกเลิก (คืนแต้ม)</MenuItem>
                    </Menu>

                    {/* Confirmation Dialog */}
                    <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                        <DialogTitle>ยืนยันการเปลี่ยนสถานะ</DialogTitle>
                        <DialogContent>
                            <Typography>
                                คุณต้องการเปลี่ยนสถานะ Order <strong>{selectedOrder?.order_number}</strong> เป็น
                                <strong> {newStatus.toUpperCase()}</strong> ใช่หรือไม่?
                            </Typography>
                            {newStatus === 'cancelled' && (
                                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                    * ระบบจะทำการคืนแต้มให้กับลูกค้าโดยอัตโนมัติ
                                </Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">ยกเลิก</Button>
                            <Button onClick={confirmStatusUpdate} variant="contained" color={newStatus === 'cancelled' ? 'error' : 'primary'}>
                                ยืนยัน
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}