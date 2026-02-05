import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Box, Button, Card, CardContent, Container, Grid,
    Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Switch, IconButton,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import { Delete, AddPhotoAlternate, CloudUpload } from '@mui/icons-material';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Link } from 'lucide-react';

export default function PopupIndex({ popups }: { popups: any[] }) {
    const [openDialog, setOpenDialog] = useState(false);

    // Form สำหรับ Upload
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        sort_order: 0,
        image: null as File | null,
    });

    // Form สำหรับ Toggle active (use a separate form instance) and Delete
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
            },
            forceFormData: true, // สำคัญสำหรับการส่งไฟล์
        });
    };
    const toggleActive = (id: number, currentStatus: boolean) => {
        toggleForm.setData('is_active', !currentStatus);
        toggleForm.put(route('admin.popups.update', id), {
            preserveScroll: true
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this popup?')) {
            destroy(route('admin.popups.destroy', id));
        }
    };

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
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight"> Popup Management</h2>
                </div>
            }
        >
            <Head title="Manage Popups" />
            {/* <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> */}

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-3">
                <Grid container spacing={3}>
                    {/* <button
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                        ← กลับไปหน้า Dashboard
                    </button> */}
                    {/* Header Section */}
                    <Grid size={12} display="flex" justifyContent="flex-end" alignItems="center">
                        {/* <Typography variant="h4" fontWeight="bold" color="primary">
                            Popup Management
                        </Typography> */}
                        <Button
                            variant="contained"
                            startIcon={<AddPhotoAlternate />}
                            onClick={() => setOpenDialog(true)}
                            sx={{ bgcolor: '#F54927', '&:hover': { bgcolor: '#d13b1e' } }}
                        >
                            Add New Popup
                        </Button>
                    </Grid>

                    {/* Table Section */}
                    <Grid size={12}>
                        <TableContainer component={Paper} elevation={3}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell>Preview</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell align="center">Status (Active)</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {popups.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                No popups found. Please add one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        popups.map((popup) => (
                                            <TableRow key={popup.id}>
                                                <TableCell>
                                                    <Box
                                                        component="img"
                                                        src={popup.image_path}
                                                        alt="popup"
                                                        sx={{
                                                            width: 100,
                                                            height: 'auto',
                                                            borderRadius: 1,
                                                            boxShadow: 1
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{popup.title || '-'}</TableCell>
                                                <TableCell align="center">
                                                    <Switch
                                                        checked={!!popup.is_active}
                                                        onChange={() => toggleActive(popup.id, !!popup.is_active)}
                                                        color="success"
                                                    />
                                                    <Typography variant="caption" display="block">
                                                        {popup.is_active ? 'Showing' : 'Hidden'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDelete(popup.id)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>

                {/* Modal for Adding Popup */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <form onSubmit={handleSubmit}>
                        <DialogTitle>Add New Popup</DialogTitle>
                        <DialogContent dividers>
                            <TextField
                                label="Popup Title (Optional)"
                                fullWidth
                                margin="normal"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />

                            <Box sx={{ mt: 2, border: '2px dashed #ccc', p: 3, textAlign: 'center', borderRadius: 2 }}>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="raised-button-file">
                                    <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                                        Upload Image
                                    </Button>
                                </label>
                                {data.image && (
                                    <Typography variant="body2" sx={{ mt: 1, color: 'green' }}>
                                        Selected: {data.image.name}
                                    </Typography>
                                )}
                                {errors.image && (
                                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                        {errors.image}
                                    </Typography>
                                )}
                            </Box>
                            <TextField
                                label="Sort Order (ลำดับการแสดง)"
                                type="number"
                                fullWidth
                                margin="normal"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                helperText="เลขน้อยจะแสดงก่อน (เช่น 0, 1, 2)"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                                sx={{ bgcolor: '#F54927', '&:hover': { bgcolor: '#d13b1e' } }}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>
            {/* </Container> */}
        </AuthenticatedLayout>
    );
}