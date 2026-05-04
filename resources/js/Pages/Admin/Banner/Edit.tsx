import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box, Button, Typography, Paper, TextField, MenuItem, Switch, FormControlLabel,
    Breadcrumbs, Link as MuiLink
} from '@mui/material';
import { Save, UploadCloud, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface Banner {
    id: number;
    title: string | null;
    image_path: string;
    sort_order: number;
    is_active: boolean;
    type: 'slider' | 'background';
}

export default function Edit({ banner }: { banner: Banner }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: banner.title || '',
        sort_order: banner.sort_order,
        type: banner.type,
        is_active: banner.is_active,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.banners.update', banner.id), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.banners.index')}>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">แก้ไข Banner</h2>
                        <Breadcrumbs aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-ol': { fontSize: '0.875rem' } }}>
                            <MuiLink component={Link} href={route('admin.banners.index')} underline="hover" color="inherit">
                                รายการ Banner
                            </MuiLink>
                            <Typography color="text.primary" sx={{ fontSize: 'inherit' }}>แก้ไข Banner #{banner.id}</Typography>
                        </Breadcrumbs>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Banner - ${banner.title || banner.id}`} />

            <div className="max-w-4xl mx-auto py-6">
                <Paper className="p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Current Image Preview */}
                        <div className="space-y-3">
                            <Typography variant="subtitle2" className="text-gray-700 font-bold flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> รูปภาพปัจจุบัน
                            </Typography>
                            <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-w-2xl mx-auto flex items-center justify-center min-h-[200px]">
                                <img
                                    src={banner.image_path}
                                    alt="Current Banner"
                                    className="max-w-full max-h-[300px] object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                select
                                label="ประเภท Banner"
                                fullWidth
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as 'slider' | 'background')}
                                error={!!errors.type}
                                helperText={errors.type}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value="slider">Slider (รูปเลื่อนด้านล่าง)</MenuItem>
                                <MenuItem value="background">Background (รูปหัวเว็บ)</MenuItem>
                            </TextField>

                            <TextField
                                label="ลำดับการแสดง (Sort Order)"
                                type="number"
                                fullWidth
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                error={!!errors.sort_order}
                                helperText={errors.sort_order || "เลขน้อยจะแสดงก่อนในลำดับตาราง"}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />

                            <div className="md:col-span-2">
                                <TextField
                                    label="ชื่อแบนเนอร์ (Title)"
                                    fullWidth
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    error={!!errors.title}
                                    helperText={errors.title || "ตัวเลือกเสริม: สำหรับเรียกใช้ในหน้าเว็บ"}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Box
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-all cursor-pointer"
                                    onClick={() => document.getElementById('edit-banner-upload')?.click()}
                                >
                                    <input
                                        accept="image/*"
                                        type="file"
                                        id="edit-banner-upload"
                                        className="hidden"
                                        onChange={(e) => e.target.files && setData('image', e.target.files[0])}
                                    />
                                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <Typography className="text-gray-900 font-semibold">อัปโหลดรูปภาพใหม่</Typography>
                                    <Typography variant="caption" className="text-gray-500 block mt-1 font-medium">
                                        (หากไม่ต้องการเปลี่ยน ให้ปล่อยว่างไว้)
                                    </Typography>
                                    <Typography variant="caption" className="text-blue-600 block mt-2 font-bold bg-blue-50 py-1 px-3 rounded-full inline-block">
                                        ต้องการขนาด 1400 x 800 พิกเซลเท่านั้น
                                    </Typography>
                                    
                                    {data.image && (
                                        <div className="mt-4 p-2 bg-emerald-50 rounded-lg inline-flex items-center gap-2 border border-emerald-100">
                                            <span className="text-emerald-700 text-xs font-bold font-mono">✓ {data.image.name}</span>
                                        </div>
                                    )}
                                    {errors.image && <Typography color="error" variant="caption" className="block mt-2 font-bold">{errors.image}</Typography>}
                                </Box>
                            </div>

                            <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            color="success"
                                        />
                                    }
                                    label={
                                        <Typography className={`font-bold transition-colors ${data.is_active ? 'text-emerald-600' : 'text-gray-500'}`}>
                                            {data.is_active ? "แสดงผลอยู่ (Active)" : "ซ่อน (Inactive)"}
                                        </Typography>
                                    }
                                />

                                <div className="flex gap-3 w-full md:w-auto">
                                    <Link href={route('admin.banners.index')} className="flex-1 md:flex-none">
                                        <Button variant="outlined" fullWidth color="inherit" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
                                            ยกเลิก
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        disabled={processing}
                                        startIcon={<Save className="w-4 h-4" />}
                                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 4 }}
                                    >
                                        {processing ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Paper>
            </div>
        </AdminLayout>
    );
}