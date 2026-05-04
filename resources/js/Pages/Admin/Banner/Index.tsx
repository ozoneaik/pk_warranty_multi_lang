// import React, { useState } from 'react';
// // ✅ 1. เพิ่ม router เข้าไปใน import
// import { Head, useForm, router } from '@inertiajs/react';
// import {
//     Box, Button, Container, Grid, Typography, Table, TableBody, TableCell,
//     TableContainer, TableHead, TableRow, Paper, Switch, IconButton,
//     Dialog, DialogTitle, DialogContent, TextField, DialogActions,
//     MenuItem,
//     Chip
// } from '@mui/material';
// import { Delete, AddPhotoAlternate, CloudUpload } from '@mui/icons-material';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { EditIcon, Link } from 'lucide-react';

// export default function BannerIndex({ banners }: { banners: any[] }) {
//     const [openDialog, setOpenDialog] = useState(false);

//     // Form สำหรับ Create (ใช้อันนี้ถูกแล้วสำหรับการสร้าง)
//     const { data, setData, post, processing, reset, errors } = useForm({
//         title: '',
//         sort_order: 0,
//         type: 'slider',
//         image: null as File | null,
//     });

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         // ✅ post ของ useForm ใช้ (url, options) -> ถูกต้อง
//         post(route('admin.banners.store'), {
//             onSuccess: () => { reset(); setOpenDialog(false); },
//             forceFormData: true,
//         });
//     };

//     // ✅ แก้ไข: ใช้ router.put แทน put ของ useForm
//     const toggleActive = (id: number, currentStatus: boolean) => {
//         router.put(
//             route('admin.banners.update', id),
//             {
//                 is_active: currentStatus ? 0 : 1, // ส่งเป็น 1/0 แทน Boolean
//                 type: banners.find(b => b.id === id)?.type // ส่ง type กลับไปด้วยเพื่อป้องกัน validation error
//             },
//             {
//                 preserveScroll: true,
//                 onSuccess: () => {
//                     // คุณสามารถใส่ Toast แจ้งเตือนตรงนี้ได้
//                 }
//             }
//         );
//     };

//     // ✅ แก้ไข: ใช้ router.put
//     const handleSortUpdate = (id: number, newOrder: string) => {
//         router.put(
//             route('admin.banners.update', id),
//             { sort_order: parseInt(newOrder) || 0 }, // Data
//             { preserveScroll: true }                 // Options
//         );
//     };

//     // ✅ แก้ไข: ใช้ router.delete
//     const handleDelete = (id: number) => {
//         if (confirm('Are you sure you want to delete this banner?')) {
//             router.delete(route('admin.banners.destroy', id), {
//                 preserveScroll: true
//             });
//         }
//     };

//     const handleEdit = (id: number) => {
//         router.get(route('admin.banners.edit', id));
//     }

//     const goBack = () => {
//         router.get(route('admin.dashboard'));
//     }

//     return (
//         <AuthenticatedLayout
//             header={
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={goBack}
//                         className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
//                     >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                         </svg>
//                     </button>
//                     <h2 className="font-semibold text-xl text-gray-800 leading-tight"> Banner Management</h2>
//                 </div>
//             }
//         >
//             <Head title="Manage Banners" />
//             {/* <Container maxWidth="lg" sx={{ mt: 4 }}> */}
//             <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-3">
//                 <Grid container spacing={3}>
//                     <Grid size={12} display="flex" justifyContent="flex-end" alignItems="center">
//                         {/* <Typography variant="h4" fontWeight="bold">Banner Management</Typography> */}
//                         <Button
//                             variant="contained"
//                             startIcon={<AddPhotoAlternate />}
//                             onClick={() => setOpenDialog(true)}
//                             color="primary"
//                         >
//                             Add Banner
//                         </Button>
//                     </Grid>

//                     <Grid size={12}>
//                         <TableContainer component={Paper}>
//                             <Table>
//                                 <TableHead sx={{ bgcolor: '#f5f5f5' }}>
//                                     <TableRow>
//                                         <TableCell>Image</TableCell>
//                                         <TableCell>Title</TableCell>
//                                         <TableCell>Sort Order</TableCell>
//                                         <TableCell>Status</TableCell>
//                                         <TableCell>Type</TableCell>
//                                         <TableCell align="center">Actions</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {banners.map((banner) => (
//                                         <TableRow key={banner.id}>
//                                             <TableCell>
//                                                 <Box
//                                                     component="img"
//                                                     src={banner.image_path}
//                                                     sx={{ width: 150, borderRadius: 2, boxShadow: 1 }}
//                                                 />
//                                             </TableCell>
//                                             <TableCell>
//                                                 {banner.title ? (
//                                                     <Typography variant="body2" sx={{ fontWeight: 500 }}>{banner.title}</Typography>
//                                                 ) : (
//                                                     <Chip label="None" size="small" variant="outlined" sx={{ color: '#ccc', borderStyle: 'dashed' }} />
//                                                 )}
//                                             </TableCell>
//                                             <TableCell>
//                                                 <TextField
//                                                     type="number"
//                                                     size="small"
//                                                     defaultValue={banner.sort_order}
//                                                     // เรียกฟังก์ชันที่แก้แล้ว
//                                                     onBlur={(e) => handleSortUpdate(banner.id, e.target.value)}
//                                                     sx={{ width: 80 }}
//                                                 />
//                                             </TableCell>
//                                             <TableCell>
//                                                 <Switch
//                                                     checked={!!banner.is_active}
//                                                     // เรียกฟังก์ชันที่แก้แล้ว
//                                                     onChange={() => toggleActive(banner.id, !!banner.is_active)}
//                                                     color="success"
//                                                 />
//                                             </TableCell>
//                                             <TableCell>
//                                                 {(() => {
//                                                     const typeConfig: Record<string, { label: string; color: "primary" | "secondary" | "default" | "error" | "info" | "success" | "warning" }> = {
//                                                         slider: { label: 'Slider', color: 'info' },
//                                                         background: { label: 'Background', color: 'warning' },
//                                                     };

//                                                     const config = typeConfig[banner.type] || { label: banner.type, color: 'default' };

//                                                     return (
//                                                         <Chip
//                                                             label={config.label}
//                                                             color={config.color}
//                                                             size="small"
//                                                             sx={{ fontWeight: 500 }}
//                                                         />
//                                                     );
//                                                 })()}
//                                             </TableCell>
//                                             <TableCell align="center">
//                                                 <IconButton color="error" onClick={() => handleDelete(banner.id)}>
//                                                     <Delete />
//                                                 </IconButton>
//                                                 <IconButton color="error" onClick={() => handleEdit(banner.id)}>
//                                                     <EditIcon />
//                                                 </IconButton>
//                                             </TableCell>

//                                         </TableRow>
//                                     ))}
//                                     {banners.length === 0 && (
//                                         <TableRow>
//                                             <TableCell colSpan={5} align="center">No banners found.</TableCell>
//                                         </TableRow>
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </TableContainer>
//                     </Grid>
//                 </Grid>

//                 {/* Create Modal - เหมือนเดิม */}
//                 <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
//                     <form onSubmit={handleSubmit}>
//                         <DialogTitle>Add New Banner</DialogTitle>
//                         <DialogContent dividers>
//                             <TextField
//                                 select
//                                 label="Banner Type"
//                                 fullWidth
//                                 margin="normal"
//                                 value={data.type}
//                                 onChange={(e) => setData('type', e.target.value)}
//                             >
//                                 <MenuItem value="slider">Slider (รูปเลื่อนด้านล่าง)</MenuItem>
//                                 <MenuItem value="background">Background (รูปหัวเว็บ)</MenuItem>
//                             </TextField>
//                             <TextField
//                                 label="Title (Optional)"
//                                 fullWidth
//                                 margin="normal"
//                                 value={data.title}
//                                 onChange={(e) => setData('title', e.target.value)}
//                             />
//                             <TextField
//                                 label="Sort Order"
//                                 type="number"
//                                 fullWidth
//                                 margin="normal"
//                                 value={data.sort_order}
//                                 onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
//                                 helperText="Lower numbers appear first"
//                             />
//                             <Box sx={{ mt: 2, border: '1px dashed grey', p: 2, textAlign: 'center' }}>
//                                 <input
//                                     accept="image/*"
//                                     type="file"
//                                     id="banner-upload"
//                                     style={{ display: 'none' }}
//                                     onChange={(e) => e.target.files && setData('image', e.target.files[0])}
//                                 />
//                                 <label htmlFor="banner-upload">
//                                     <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
//                                         Upload Image
//                                     </Button>
//                                 </label>
//                                 {data.image && <Typography sx={{ mt: 1 }}>{data.image.name}</Typography>}
//                                 {errors.image && <Typography color="error">{errors.image}</Typography>}
//                             </Box>
//                         </DialogContent>
//                         <DialogActions>
//                             <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//                             <Button type="submit" variant="contained" disabled={processing}>Save</Button>
//                         </DialogActions>
//                     </form>
//                 </Dialog>
//             </div>

//             {/* <button
//                     onClick={goBack}
//                     className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
//                 >
//                     ← กลับไปหน้า Dashboard
//                 </button> */}

//             {/* </Container> */}
//         </AuthenticatedLayout>
//     );
// }

import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box, Switch, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Button, Typography, MenuItem
} from '@mui/material';
import { Trash2, Image as ImageIcon, UploadCloud, Plus, ArrowLeft, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BannerIndex({ banners }: { banners: any[] }) {
    const [openDialog, setOpenDialog] = useState(false);

    // Form สำหรับ Create
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        sort_order: 0,
        type: 'slider',
        image: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('image', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.banners.store'), {
            onSuccess: () => {
                reset();
                setOpenDialog(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    icon: 'success',
                    title: 'เพิ่ม Banner สำเร็จ',
                    customClass: { popup: 'font-prompt' }
                });
            },
            forceFormData: true,
        });
    };

    const toggleActive = (id: number, currentStatus: boolean) => {
        router.put(
            route('admin.banners.update', id),
            {
                is_active: currentStatus ? 0 : 1,
                type: banners.find(b => b.id === id)?.type
            },
            { preserveScroll: true }
        );
    };

    const handleSortUpdate = (id: number, newOrder: string) => {
        router.put(
            route('admin.banners.update', id),
            { sort_order: parseInt(newOrder) || 0 },
            { preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณไม่สามารถย้อนกลับการกระทำนี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            background: '#fff',
            customClass: {
                title: 'font-prompt font-bold text-gray-800',
                htmlContainer: 'font-prompt text-gray-500',
                popup: 'rounded-2xl shadow-xl border border-gray-100'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.banners.destroy', id), {
                    preserveScroll: true
                });
            }
        });
    };

    const handleEdit = (id: number) => {
        router.get(route('admin.banners.edit', id));
    };

    const goBack = () => {
        router.get(route('admin.dashboard'));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-4">
                    {/* <button
                        onClick={goBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
                        title="ย้อนกลับ"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button> */}
                    <div>
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">จัดการ Banner</h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">จัดการรูปภาพแบนเนอร์และสไลเดอร์ในหน้าแรก (1400 x 800 px)</p>
                    </div>
                </div>
            }
        >
            <Head title="Manage Banners" />

            <div className="space-y-6">

                {/* Toolbar Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">รายการ Banner ทั้งหมด</h3>
                            <p className="text-sm text-gray-500">พบ {banners.length || 0} รายการในระบบ</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpenDialog(true)}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        เพิ่ม Banner ใหม่
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-40">รูปภาพ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อแบนเนอร์ (Title)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ประเภท</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ลำดับ (Sort)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">การแสดงผล</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-6">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {banners.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} align="center" className="py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <span className="font-medium text-gray-900 text-sm">ยังไม่มีข้อมูล Banner</span>
                                                <span className="text-xs mt-1">คลิกที่ปุ่ม "เพิ่ม Banner ใหม่" ด้านบนเพื่อเริ่มต้น</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    banners.map((banner) => (
                                        <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* Image */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-32 h-auto mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center min-h-[60px]">
                                                    {banner.image_path ? (
                                                        <img
                                                            src={banner.image_path}
                                                            alt={banner.title || 'Banner Image'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">No Image</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Title */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {banner.title || <span className="text-gray-400 italic font-normal">ไม่มีชื่อ</span>}
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${banner.type === 'slider'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {banner.type === 'slider' ? 'Slider' : 'Background'}
                                                </span>
                                            </td>

                                            {/* Sort Order (Editable) */}
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="number"
                                                    defaultValue={banner.sort_order}
                                                    onBlur={(e) => handleSortUpdate(banner.id, e.target.value)}
                                                    className="w-16 px-2 py-1.5 text-sm font-semibold text-center text-gray-700 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors hover:border-blue-400"
                                                />
                                            </td>

                                            {/* Status / Active */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <Switch
                                                        checked={!!banner.is_active}
                                                        onChange={() => toggleActive(banner.id, !!banner.is_active)}
                                                        color="success"
                                                        size="small"
                                                    />
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {banner.is_active ? 'แสดงผลอยู่' : 'ซ่อน'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right pr-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(banner.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(banner.id)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal for Adding Banner */}
                <Dialog
                    open={openDialog}
                    onClose={() => { setOpenDialog(false); reset(); }}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: '16px', p: 1 }
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <DialogTitle sx={{ fontWeight: 'bold', color: '#1f2937' }}>เพิ่ม Banner ใหม่</DialogTitle>
                        <DialogContent dividers sx={{ borderColor: '#f3f4f6' }}>

                            <TextField
                                select
                                label="ประเภท (Type)"
                                fullWidth
                                margin="normal"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            >
                                <MenuItem value="slider">Slider (รูปเลื่อนด้านล่าง)</MenuItem>
                                <MenuItem value="background">Background (รูปหัวเว็บ)</MenuItem>
                            </TextField>

                            <TextField
                                label="ชื่อแบนเนอร์ (Title) - ตัวเลือกเสริม"
                                fullWidth
                                margin="normal"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />

                            <Box sx={{ mt: 3, mb: 2, border: '2px dashed #cbd5e1', p: 4, textAlign: 'center', borderRadius: '12px', bgcolor: '#f8fafc', transition: 'all 0.2s', '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' } }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="banner-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="banner-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<UploadCloud className="w-5 h-5" />}
                                        sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                                    >
                                        อัปโหลดรูปภาพ
                                    </Button>
                                </label>
                                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}>
                                    ต้องการขนาด 1400 x 800 พิกเซลเท่านั้น
                                </Typography>
                                {data.image && (
                                    <Typography variant="body2" sx={{ mt: 2, color: '#059669', fontWeight: 500 }}>
                                        ✓ เลือกไฟล์แล้ว: {data.image.name}
                                    </Typography>
                                )}
                                {errors.image && (
                                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                        {errors.image}
                                    </Typography>
                                )}
                            </Box>

                            <TextField
                                label="ลำดับการแสดง (Sort Order)"
                                type="number"
                                fullWidth
                                margin="normal"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                helperText="เลขน้อยจะแสดงก่อน (เช่น 0, 1, 2)"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2, pt: 3 }}>
                            <Button onClick={() => { setOpenDialog(false); reset(); }} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    boxShadow: 'none',
                                    bgcolor: '#2563eb',
                                    '&:hover': { bgcolor: '#1d4ed8', boxShadow: 'none' }
                                }}
                            >
                                {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

            </div>
        </AdminLayout>
    );
}