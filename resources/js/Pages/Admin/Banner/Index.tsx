import React, { useState } from 'react';
// ✅ 1. เพิ่ม router เข้าไปใน import
import { Head, useForm, router } from '@inertiajs/react';
import {
    Box, Button, Container, Grid, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Switch, IconButton,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    MenuItem,
    Chip
} from '@mui/material';
import { Delete, AddPhotoAlternate, CloudUpload } from '@mui/icons-material';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EditIcon, Link } from 'lucide-react';

export default function BannerIndex({ banners }: { banners: any[] }) {
    const [openDialog, setOpenDialog] = useState(false);

    // Form สำหรับ Create (ใช้อันนี้ถูกแล้วสำหรับการสร้าง)
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        sort_order: 0,
        type: 'slider',
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ✅ post ของ useForm ใช้ (url, options) -> ถูกต้อง
        post(route('admin.banners.store'), {
            onSuccess: () => { reset(); setOpenDialog(false); },
            forceFormData: true,
        });
    };

    // ✅ แก้ไข: ใช้ router.put แทน put ของ useForm
    const toggleActive = (id: number, currentStatus: boolean) => {
        router.put(
            route('admin.banners.update', id),
            {
                is_active: currentStatus ? 0 : 1, // ส่งเป็น 1/0 แทน Boolean
                type: banners.find(b => b.id === id)?.type // ส่ง type กลับไปด้วยเพื่อป้องกัน validation error
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // คุณสามารถใส่ Toast แจ้งเตือนตรงนี้ได้
                }
            }
        );
    };

    // ✅ แก้ไข: ใช้ router.put
    const handleSortUpdate = (id: number, newOrder: string) => {
        router.put(
            route('admin.banners.update', id),
            { sort_order: parseInt(newOrder) || 0 }, // Data
            { preserveScroll: true }                 // Options
        );
    };

    // ✅ แก้ไข: ใช้ router.delete
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            router.delete(route('admin.banners.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const handleEdit = (id: number) => {
        router.get(route('admin.banners.edit', id));
    }

    const goBack = () => {
        router.get(route('admin.dashboard'));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <button
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight"> Banner Management</h2>
                </div>
            }
        >
            <Head title="Manage Banners" />
            {/* <Container maxWidth="lg" sx={{ mt: 4 }}> */}
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-3">
                <Grid container spacing={3}>
                    <Grid size={12} display="flex" justifyContent="flex-end" alignItems="center">
                        {/* <Typography variant="h4" fontWeight="bold">Banner Management</Typography> */}
                        <Button
                            variant="contained"
                            startIcon={<AddPhotoAlternate />}
                            onClick={() => setOpenDialog(true)}
                            color="primary"
                        >
                            Add Banner
                        </Button>
                    </Grid>

                    <Grid size={12}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Image</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Sort Order</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {banners.map((banner) => (
                                        <TableRow key={banner.id}>
                                            <TableCell>
                                                <Box
                                                    component="img"
                                                    src={banner.image_path}
                                                    sx={{ width: 150, borderRadius: 2, boxShadow: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {banner.title ? (
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{banner.title}</Typography>
                                                ) : (
                                                    <Chip label="None" size="small" variant="outlined" sx={{ color: '#ccc', borderStyle: 'dashed' }} />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    defaultValue={banner.sort_order}
                                                    // เรียกฟังก์ชันที่แก้แล้ว
                                                    onBlur={(e) => handleSortUpdate(banner.id, e.target.value)}
                                                    sx={{ width: 80 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={!!banner.is_active}
                                                    // เรียกฟังก์ชันที่แก้แล้ว
                                                    onChange={() => toggleActive(banner.id, !!banner.is_active)}
                                                    color="success"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const typeConfig: Record<string, { label: string; color: "primary" | "secondary" | "default" | "error" | "info" | "success" | "warning" }> = {
                                                        slider: { label: 'Slider', color: 'info' },
                                                        background: { label: 'Background', color: 'warning' },
                                                    };

                                                    const config = typeConfig[banner.type] || { label: banner.type, color: 'default' };

                                                    return (
                                                        <Chip
                                                            label={config.label}
                                                            color={config.color}
                                                            size="small"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton color="error" onClick={() => handleDelete(banner.id)}>
                                                    <Delete />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleEdit(banner.id)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                    {banners.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No banners found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>

                {/* Create Modal - เหมือนเดิม */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <form onSubmit={handleSubmit}>
                        <DialogTitle>Add New Banner</DialogTitle>
                        <DialogContent dividers>
                            <TextField
                                select
                                label="Banner Type"
                                fullWidth
                                margin="normal"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                            >
                                <MenuItem value="slider">Slider (รูปเลื่อนด้านล่าง)</MenuItem>
                                <MenuItem value="background">Background (รูปหัวเว็บ)</MenuItem>
                            </TextField>
                            <TextField
                                label="Title (Optional)"
                                fullWidth
                                margin="normal"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            <TextField
                                label="Sort Order"
                                type="number"
                                fullWidth
                                margin="normal"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                helperText="Lower numbers appear first"
                            />
                            <Box sx={{ mt: 2, border: '1px dashed grey', p: 2, textAlign: 'center' }}>
                                <input
                                    accept="image/*"
                                    type="file"
                                    id="banner-upload"
                                    style={{ display: 'none' }}
                                    onChange={(e) => e.target.files && setData('image', e.target.files[0])}
                                />
                                <label htmlFor="banner-upload">
                                    <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                                        Upload Image
                                    </Button>
                                </label>
                                {data.image && <Typography sx={{ mt: 1 }}>{data.image.name}</Typography>}
                                {errors.image && <Typography color="error">{errors.image}</Typography>}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={processing}>Save</Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>

            {/* <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                    ← กลับไปหน้า Dashboard
                </button> */}

            {/* </Container> */}
        </AuthenticatedLayout>
    );
}