import React, { useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
    Card, CardContent, Typography, TextField, Button, Grid,
    InputAdornment, Box, Divider, CircularProgress, Chip, Stack, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { Search, QrCode, UserSearch, History, Coins, Info, CloudUpload, XCircle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

export default function PointManagement() {
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);

    // States สำหรับเก็บข้อมูลที่ค้นหาเจอ
    const [customer, setCustomer] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    // States สำหรับฟอร์มปรับแต่งคะแนน
    const [adjustAction, setAdjustAction] = useState('add');
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustRemark, setAdjustRemark] = useState('');
    const [adjusting, setAdjusting] = useState(false);

    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ฟังก์ชันจัดการอัปโหลดไฟล์
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                return Swal.fire('ไฟล์ไม่ถูกต้อง', 'รับเฉพาะรูปภาพ JPG, PNG เท่านั้น', 'warning');
            }
            if (file.size > 5 * 1024 * 1024) {
                return Swal.fire('ขนาดไฟล์เกิน', 'ขนาดรูปภาพต้องไม่เกิน 5MB', 'warning');
            }
            setEvidenceFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    // ฟังก์ชันค้นหาลูกค้า
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchInput.trim()) return;

        setLoading(true);
        setCustomer(null);
        setHistory([]);

        try {
            const { data } = await axios.post(route('admin.member-points.search'), { search: searchInput });
            setCustomer(data.customer);
            setHistory(data.history);
        } catch (error: any) {
            Swal.fire({
                title: 'ไม่พบข้อมูล',
                text: error.response?.data?.message || 'ไม่พบลูกค้าระบบจากข้อมูลที่ระบุ',
                icon: 'warning',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันบันทึกการปรับคะแนน
    const handleAdjustPoint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustAmount || Number(adjustAmount) <= 0) return Swal.fire('ข้อมูลไม่ถูกต้อง', 'กรุณาระบุจำนวนที่ถูกต้อง', 'warning');
        if (!adjustRemark.trim()) return Swal.fire('ข้อมูลไม่ถูกต้อง', 'กรุณาระบุเหตุผลการทำรายการ', 'warning');

        setAdjusting(true);
        try {
            const formData = new FormData();
            formData.append('cust_line', customer.cust_line);
            formData.append('action', adjustAction);
            formData.append('amount', adjustAmount);
            formData.append('remark', adjustRemark);
            if (evidenceFile) {
                formData.append('evidence_image', evidenceFile);
            }

            const { data } = await axios.post(route('admin.member-points.adjust'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Swal.fire({ title: 'สำเร็จ', text: data.message, icon: 'success', timer: 3000, showConfirmButton: false });

            // รีเซ็ตฟอร์ม และ อัปเดตข้อมูล State ทันที
            setCustomer(data.customer);
            setHistory([data.new_transaction, ...history]);
            setAdjustAmount('');
            setAdjustRemark('');
            setEvidenceFile(null);
            setFilePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (error: any) {
            let errorMsg = error.response?.data?.message || 'ไม่สามารถปรับคะแนนได้';
            if (error.response?.status === 422 && error.response?.data?.errors) {
                errorMsg = Object.values(error.response.data.errors).flat().join('\n');
            }
            Swal.fire('ข้อผิดพลาด', errorMsg, 'error');
        } finally {
            setAdjusting(false);
        }
    };

    const getPreviewPoints = () => {
        const val = Number(adjustAmount) || 0;
        if (adjustAction === 'add') return `จะได้รับ: +${val} Points`;
        if (adjustAction === 'deduct') return `จะถูกหัก: -${val} Points`;

        // คำนวณแบบยอดสั่งซื้อ
        const tier = (customer?.tier_key || 'silver').toLowerCase();
        let multiplier = 1;
        if (tier === 'platinum') multiplier = 4;
        else if (tier === 'gold') multiplier = 2;

        const earned = Math.floor(val / 100) * multiplier;
        return `คำนวณจาก Tier ${tier.toUpperCase()} จะได้รับ: +${earned} Points`;
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                        แก้ไข Points ของสมาชิก <Info className="w-5 h-5 text-gray-400" />
                    </h2>
                </div>
            }
        >
            <Head title="แก้ไข Points ของสมาชิก" />

            <Grid container spacing={4} sx={{ px: { xs: 2, md: 4 }, py: 4 }}>

                {/* ฝั่งซ้าย: ค้นหา และ ปรับ Point */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight="bold" mb={3} color="text.primary">
                                ค้นหาสมาชิก
                            </Typography>

                            {/* ฟอร์มค้นหา */}
                            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="ค้นหา เบอร์โทร หรือ S/N"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    disabled={loading}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <span className="text-xl">🇹🇭</span>
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                                <Button
                                    type="submit"
                                    variant="outlined"
                                    disabled={loading}
                                    sx={{ minWidth: '45px', p: 0, borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b' }}
                                >
                                    {loading ? <CircularProgress size={20} /> : <Search className="w-5 h-5" />}
                                </Button>
                            </form>

                            {/* กล่องแสดงผลลัพธ์ */}
                            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 4, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>

                                {!customer ? (
                                    <div className="flex flex-col items-center justify-center text-center my-auto opacity-60">
                                        <div className="relative mb-4">
                                            <UserSearch className="w-16 h-16 text-gray-400" />
                                            <QrCode className="w-8 h-8 text-gray-400 absolute -right-4 bottom-0 bg-[#f8fafc]" />
                                            <span className="absolute right-[-8px] top-6 text-sm text-gray-400 font-bold">Or</span>
                                        </div>
                                        <Typography variant="body2" color="text.secondary">
                                            พิมพ์ค้นหาลูกค้า หรือสแกน QR-Code เพื่อเลือกลูกค้าที่ต้องการปรับพอยต์
                                        </Typography>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-300">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <Typography variant="subtitle1" fontWeight="bold">{customer.cust_firstname} {customer.cust_lastname}</Typography>
                                                <Typography variant="body2" color="text.secondary">{customer.cust_tel}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: customer.tier_key === 'platinum' ? '#334155' : customer.tier_key === 'gold' ? '#d97706' : '#64748b' }}>
                                                    ระดับ: {String(customer.tier_key || 'Silver').toUpperCase()}
                                                </Typography>
                                            </div>
                                            <div className="text-right">
                                                <Typography variant="caption" color="text.secondary">คะแนนปัจจุบัน</Typography>
                                                <Typography variant="h5" fontWeight="black" color="primary.main">
                                                    {new Intl.NumberFormat().format(customer.point)}
                                                </Typography>
                                            </div>
                                        </div>

                                        <Divider sx={{ mb: 4 }} />

                                        <form onSubmit={handleAdjustPoint}>
                                            <Stack spacing={3}>
                                                <div>
                                                    <Typography variant="body2" fontWeight="bold" mb={1}>ประเภทการทำรายการ</Typography>
                                                    <RadioGroup row value={adjustAction} onChange={(e) => { setAdjustAction(e.target.value); setAdjustAmount(''); }}>
                                                        <FormControlLabel value="add_by_purchase" control={<Radio color="primary" />} label={<span className="text-sm font-medium text-blue-600">คำนวณจากยอดซื้อ</span>} />
                                                        <FormControlLabel value="add" control={<Radio color="success" />} label={<span className="text-sm font-medium text-emerald-600">เพิ่ม Points </span>} />
                                                        <FormControlLabel value="deduct" control={<Radio color="error" />} label={<span className="text-sm font-medium text-rose-600">แลก Points</span>} />
                                                    </RadioGroup>
                                                </div>

                                                <Box>
                                                    <TextField
                                                        label={adjustAction === 'add_by_purchase' ? "ยอดสั่งซื้อสุทธิ (บาท)" : "จำนวน Points"}
                                                        type="number"
                                                        fullWidth
                                                        size="small"
                                                        value={adjustAmount}
                                                        onChange={(e) => setAdjustAmount(e.target.value)}
                                                        required
                                                    />
                                                    {adjustAmount && (
                                                        <Typography variant="caption" color={adjustAction === 'deduct' ? 'error' : 'success.main'} sx={{ mt: 0.5, display: 'block', fontWeight: 'bold' }}>
                                                            {getPreviewPoints()}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <TextField
                                                    label="รายละเอียด / หมายเหตุ (อ้างอิงบิล)"
                                                    fullWidth
                                                    size="small"
                                                    value={adjustRemark}
                                                    onChange={(e) => setAdjustRemark(e.target.value)}
                                                    required
                                                />

                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold" mb={1}>รูปภาพใบเสร็จ/หลักฐาน</Typography>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        hidden
                                                    />
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Button
                                                            variant="outlined"
                                                            startIcon={<CloudUpload size={18} />}
                                                            onClick={() => fileInputRef.current?.click()}
                                                            size="small"
                                                        >
                                                            แนบรูปภาพ
                                                        </Button>
                                                        {filePreview && (
                                                            <div className="relative">
                                                                <img src={filePreview} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                                                                <button
                                                                    type="button"
                                                                    className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 hover:text-red-700"
                                                                    onClick={() => { setEvidenceFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Stack>
                                                </Box>

                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={adjusting}
                                                    sx={{
                                                        py: 1.5,
                                                        bgcolor: adjustAction === 'deduct' ? '#ef4444' : '#10b981',
                                                        '&:hover': { bgcolor: adjustAction === 'deduct' ? '#dc2626' : '#059669' }
                                                    }}
                                                >
                                                    {adjusting ? 'กำลังบันทึก...' : 'ยืนยันการทำรายการ'}
                                                </Button>
                                            </Stack>
                                        </form>
                                    </div>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ฝั่งขวา: ประวัติการใช้งาน */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight="bold" mb={3} color="text.primary">
                                ประวัติการใช้งาน Points
                            </Typography>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-gray-100">
                                        <tr>
                                            <th className="py-3 px-2 text-xs text-gray-400 font-medium">ผู้ใช้งาน</th>
                                            <th className="py-3 px-2 text-xs text-gray-400 font-medium">รายการ</th>
                                            <th className="py-3 px-2 text-xs text-gray-400 font-medium">เวลา</th>
                                            <th className="py-3 px-2 text-xs text-gray-400 font-medium text-right">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!customer ? (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center">
                                                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, py: 6 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            ไม่มีประวัติการทำรายการ
                                                        </Typography>
                                                    </Box>
                                                </td>
                                            </tr>
                                        ) : history.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-10 text-center text-gray-500 text-sm">
                                                    ลูกค้ารายนี้ยังไม่มีประวัติการรับ/ใช้ Points
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                                                    <td className="py-3 px-2 text-sm font-medium text-gray-700">
                                                        {customer.cust_firstname}
                                                    </td>
                                                    <td className="py-3 px-2 text-sm text-gray-600">
                                                        {item.pname || item.process_code}
                                                    </td>
                                                    <td className="py-3 px-2 text-xs text-gray-500 font-mono whitespace-nowrap">
                                                        {dayjs(item.created_at).format('DD/MM/YYYY HH:mm')}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {Number(item.point_tran) > 0 ? (
                                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-sm">
                                                                +{new Intl.NumberFormat().format(item.point_tran)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-sm">
                                                                {new Intl.NumberFormat().format(item.point_tran)}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </AdminLayout>
    );
}