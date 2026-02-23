// import React, { useState } from 'react';
// import { Head, router, useForm } from '@inertiajs/react';
// import {
//     Box, Button, Card, CardContent, Container, Grid,
//     Typography, Table, TableBody, TableCell, TableContainer,
//     TableHead, TableRow, Paper, Switch, IconButton,
//     Dialog, DialogTitle, DialogContent, TextField, DialogActions
// } from '@mui/material';
// import { Delete, AddPhotoAlternate, CloudUpload } from '@mui/icons-material';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { ArrowLeft, Link } from 'lucide-react';

// export default function PopupIndex({ popups }: { popups: any[] }) {
//     const [openDialog, setOpenDialog] = useState(false);

//     // Form สำหรับ Upload
//     const { data, setData, post, processing, reset, errors } = useForm({
//         title: '',
//         sort_order: 0,
//         image: null as File | null,
//     });

//     // Form สำหรับ Toggle active (use a separate form instance) and Delete
//     const toggleForm = useForm({ is_active: false });
//     const { delete: destroy } = useForm();

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setData('image', e.target.files[0]);
//         }
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         post(route('admin.popups.store'), {
//             onSuccess: () => {
//                 reset();
//                 setOpenDialog(false);
//             },
//             forceFormData: true, // สำคัญสำหรับการส่งไฟล์
//         });
//     };
//     const toggleActive = (id: number, currentStatus: boolean) => {
//         toggleForm.setData('is_active', !currentStatus);
//         toggleForm.put(route('admin.popups.update', id), {
//             preserveScroll: true
//         });
//     };

//     const handleDelete = (id: number) => {
//         if (confirm('Are you sure you want to delete this popup?')) {
//             destroy(route('admin.popups.destroy', id));
//         }
//     };

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
//                     <h2 className="font-semibold text-xl text-gray-800 leading-tight"> Popup Management</h2>
//                 </div>
//             }
//         >
//             <Head title="Manage Popups" />
//             {/* <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> */}

//             <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-3">
//                 <Grid container spacing={3}>
//                     {/* <button
//                         onClick={goBack}
//                         className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
//                     >
//                         ← กลับไปหน้า Dashboard
//                     </button> */}
//                     {/* Header Section */}
//                     <Grid size={12} display="flex" justifyContent="flex-end" alignItems="center">
//                         {/* <Typography variant="h4" fontWeight="bold" color="primary">
//                             Popup Management
//                         </Typography> */}
//                         <Button
//                             variant="contained"
//                             startIcon={<AddPhotoAlternate />}
//                             onClick={() => setOpenDialog(true)}
//                             sx={{ bgcolor: '#F54927', '&:hover': { bgcolor: '#d13b1e' } }}
//                         >
//                             Add New Popup
//                         </Button>
//                     </Grid>

//                     {/* Table Section */}
//                     <Grid size={12}>
//                         <TableContainer component={Paper} elevation={3}>
//                             <Table>
//                                 <TableHead sx={{ bgcolor: '#f5f5f5' }}>
//                                     <TableRow>
//                                         <TableCell>Preview</TableCell>
//                                         <TableCell>Title</TableCell>
//                                         <TableCell align="center">Status (Active)</TableCell>
//                                         <TableCell align="center">Actions</TableCell>
//                                     </TableRow>
//                                 </TableHead>
//                                 <TableBody>
//                                     {popups.length === 0 ? (
//                                         <TableRow>
//                                             <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
//                                                 No popups found. Please add one.
//                                             </TableCell>
//                                         </TableRow>
//                                     ) : (
//                                         popups.map((popup) => (
//                                             <TableRow key={popup.id}>
//                                                 <TableCell>
//                                                     <Box
//                                                         component="img"
//                                                         src={popup.image_path}
//                                                         alt="popup"
//                                                         sx={{
//                                                             width: 100,
//                                                             height: 'auto',
//                                                             borderRadius: 1,
//                                                             boxShadow: 1
//                                                         }}
//                                                     />
//                                                 </TableCell>
//                                                 <TableCell>{popup.title || '-'}</TableCell>
//                                                 <TableCell align="center">
//                                                     <Switch
//                                                         checked={!!popup.is_active}
//                                                         onChange={() => toggleActive(popup.id, !!popup.is_active)}
//                                                         color="success"
//                                                     />
//                                                     <Typography variant="caption" display="block">
//                                                         {popup.is_active ? 'Showing' : 'Hidden'}
//                                                     </Typography>
//                                                 </TableCell>
//                                                 <TableCell align="center">
//                                                     <IconButton
//                                                         color="error"
//                                                         onClick={() => handleDelete(popup.id)}
//                                                     >
//                                                         <Delete />
//                                                     </IconButton>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     )}
//                                 </TableBody>
//                             </Table>
//                         </TableContainer>
//                     </Grid>
//                 </Grid>

//                 {/* Modal for Adding Popup */}
//                 <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
//                     <form onSubmit={handleSubmit}>
//                         <DialogTitle>Add New Popup</DialogTitle>
//                         <DialogContent dividers>
//                             <TextField
//                                 label="Popup Title (Optional)"
//                                 fullWidth
//                                 margin="normal"
//                                 value={data.title}
//                                 onChange={(e) => setData('title', e.target.value)}
//                             />

//                             <Box sx={{ mt: 2, border: '2px dashed #ccc', p: 3, textAlign: 'center', borderRadius: 2 }}>
//                                 <input
//                                     accept="image/*"
//                                     style={{ display: 'none' }}
//                                     id="raised-button-file"
//                                     type="file"
//                                     onChange={handleFileChange}
//                                 />
//                                 <label htmlFor="raised-button-file">
//                                     <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
//                                         Upload Image
//                                     </Button>
//                                 </label>
//                                 {data.image && (
//                                     <Typography variant="body2" sx={{ mt: 1, color: 'green' }}>
//                                         Selected: {data.image.name}
//                                     </Typography>
//                                 )}
//                                 {errors.image && (
//                                     <Typography variant="body2" color="error" sx={{ mt: 1 }}>
//                                         {errors.image}
//                                     </Typography>
//                                 )}
//                             </Box>
//                             <TextField
//                                 label="Sort Order (ลำดับการแสดง)"
//                                 type="number"
//                                 fullWidth
//                                 margin="normal"
//                                 value={data.sort_order}
//                                 onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
//                                 helperText="เลขน้อยจะแสดงก่อน (เช่น 0, 1, 2)"
//                             />
//                         </DialogContent>
//                         <DialogActions>
//                             <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//                             <Button
//                                 type="submit"
//                                 variant="contained"
//                                 disabled={processing}
//                                 sx={{ bgcolor: '#F54927', '&:hover': { bgcolor: '#d13b1e' } }}
//                             >
//                                 Save
//                             </Button>
//                         </DialogActions>
//                     </form>
//                 </Dialog>
//             </div>
//             {/* </Container> */}
//         </AuthenticatedLayout>
//     );
// }

import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box, Switch, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Button, Typography
} from '@mui/material';
import { Trash2, Image as ImageIcon, UploadCloud, Plus, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PopupIndex({ popups }: { popups: any[] }) {
    const [openDialog, setOpenDialog] = useState(false);

    // Form สำหรับ Upload
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        sort_order: 0,
        image: null as File | null,
    });

    // Form สำหรับ Toggle active และ Delete
    const toggleForm = useForm({ is_active: false });
    const { delete: destroy } = useForm();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('image', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.popups.store'), {
            onSuccess: () => {
                reset();
                setOpenDialog(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    icon: 'success',
                    title: 'เพิ่ม Popup สำเร็จ',
                    customClass: { popup: 'font-prompt' }
                });
            },
            forceFormData: true,
        });
    };

    const toggleActive = (id: number, currentStatus: boolean) => {
        // ใช้ router.put ส่งค่าไปตรงๆ เลย ไม่ต้องผ่าน useForm
        router.put(route('admin.popups.update', id),
            { is_active: !currentStatus }, // ส่ง Payload ไปตรงนี้เลย
            { preserveScroll: true }       // Options
        );
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณไม่สามารถย้อนกลับการกระทำนี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // rose-500
            cancelButtonColor: '#9ca3af',  // gray-400
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
                destroy(route('admin.popups.destroy', id), { preserveScroll: true });
            }
        });
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
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">จัดการ Popup</h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">จัดการรูปภาพ Popup แจ้งเตือนเมื่อเข้าแอปพลิเคชัน</p>
                    </div>
                </div>
            }
        >
            <Head title="Manage Popups" />

            <div className="space-y-6">

                {/* Toolbar Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">รายการ Popup ทั้งหมด</h3>
                            <p className="text-sm text-gray-500">พบ {popups.length || 0} รายการในระบบ</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpenDialog(true)}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        เพิ่ม Popup ใหม่
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-32">รูปภาพ (Preview)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อ Popup (Title)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ลำดับ (Sort)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">การแสดงผล</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-8">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {popups.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} align="center" className="py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <span className="font-medium text-gray-900 text-sm">ยังไม่มีข้อมูล Popup</span>
                                                <span className="text-xs mt-1">คลิกที่ปุ่ม "เพิ่ม Popup ใหม่" ด้านบนเพื่อเริ่มต้น</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    popups.map((popup) => (
                                        <tr key={popup.id} className="hover:bg-gray-50/50 transition-colors group">
                                            {/* Image */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-24 h-auto mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center min-h-[60px]">
                                                    {popup.image_path ? (
                                                        <img
                                                            src={popup.image_path}
                                                            alt={popup.title || 'Popup Image'}
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
                                                    {popup.title || <span className="text-gray-400 italic">ไม่มีชื่อ</span>}
                                                </div>
                                            </td>

                                            {/* Sort Order */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                                                    {popup.sort_order}
                                                </span>
                                            </td>

                                            {/* Status / Active */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <Switch
                                                        checked={!!popup.is_active}
                                                        onChange={() => toggleActive(popup.id, !!popup.is_active)}
                                                        color="success"
                                                        size="small"
                                                    />
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${popup.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {popup.is_active ? 'แสดงผลอยู่' : 'ซ่อน'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right pr-6">
                                                <button
                                                    onClick={() => handleDelete(popup.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="ลบ Popup"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal for Adding Popup */}
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
                        <DialogTitle sx={{ fontWeight: 'bold', color: '#1f2937' }}>เพิ่ม Popup ใหม่</DialogTitle>
                        <DialogContent dividers sx={{ borderColor: '#f3f4f6' }}>
                            <TextField
                                label="ชื่อ Popup (Title) - ตัวเลือกเสริม"
                                fullWidth
                                margin="normal"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />

                            <Box sx={{ mt: 3, mb: 2, border: '2px dashed #cbd5e1', p: 4, textAlign: 'center', borderRadius: '12px', bgcolor: '#f8fafc', transition: 'all 0.2s', '&:hover': { borderColor: '#818cf8', bgcolor: '#e0e7ff' } }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="raised-button-file">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<UploadCloud className="w-5 h-5" />}
                                        sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
                                    >
                                        อัปโหลดรูปภาพ
                                    </Button>
                                </label>
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
                                    bgcolor: '#4f46e5',
                                    '&:hover': { bgcolor: '#4338ca', boxShadow: 'none' }
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