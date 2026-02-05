import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Box, Button, Container, Grid, Typography, Paper, TextField, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import { Save, CloudUpload, ArrowBack } from '@mui/icons-material';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Define Interface for Banner
interface Banner {
    id: number;
    title: string | null;
    image_path: string;
    sort_order: number;
    is_active: boolean;
    type: 'slider' | 'background';
}

export default function Edit({ banner }: { banner: Banner }) {

    // Setup form with existing banner data
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // สำคัญ! สำหรับการส่งไฟล์ใน Laravel ผ่าน method PUT/PATCH
        title: banner.title || '',
        sort_order: banner.sort_order,
        type: banner.type,
        is_active: banner.is_active,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // ใช้ post แทน put เพราะต้องส่ง FormData (รูปภาพ)
        // Laravel จะรู้ว่าเป็น PUT จาก _method ที่ใส่ไป
        post(route('admin.banners.update', banner.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Banner" />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Link href={route('admin.banners.index')} style={{ textDecoration: 'none' }}>
                        <Button startIcon={<ArrowBack />} sx={{ mr: 2 }}>
                            Back
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold">
                        Edit Banner
                    </Typography>
                </Box>

                <Paper elevation={3} sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Current Image Preview */}
                            <Grid size={12} display="flex" justifyContent="center">
                                <Box
                                    component="img"
                                    src={banner.image_path}
                                    alt="Current Banner"
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: 300,
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        objectFit: 'contain',
                                        mb: 2
                                    }}
                                />
                            </Grid>

                            {/* Banner Type */}
                            <Grid size={12}>
                                <TextField
                                    select
                                    label="Banner Type"
                                    fullWidth
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value as 'slider' | 'background')}
                                >
                                    <MenuItem value="slider">Slider (รูปเลื่อนด้านล่าง)</MenuItem>
                                    <MenuItem value="background">Background (รูปหัวเว็บ)</MenuItem>
                                </TextField>
                                {errors.type && <Typography color="error" variant="caption">{errors.type}</Typography>}
                            </Grid>

                            {/* Title */}
                            <Grid size={12}>
                                <TextField
                                    label="Title (Optional)"
                                    fullWidth
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    error={!!errors.title}
                                    helperText={errors.title}
                                />
                            </Grid>

                            {/* Sort Order */}
                            <Grid size={12}>
                                <TextField
                                    label="Sort Order"
                                    type="number"
                                    fullWidth
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    helperText="Lower numbers appear first"
                                    error={!!errors.sort_order}
                                />
                            </Grid>

                            {/* Active Status */}
                            <Grid size={12} display="flex" alignItems="center">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            color="success"
                                        />
                                    }
                                    label={data.is_active ? "Active (Showing)" : "Inactive (Hidden)"}
                                />
                            </Grid>

                            {/* Image Upload */}
                            <Grid size={12}>
                                <Box
                                    sx={{
                                        border: '2px dashed #ccc',
                                        borderRadius: 2,
                                        p: 3,
                                        textAlign: 'center',
                                        bgcolor: '#fafafa',
                                        '&:hover': { bgcolor: '#f0f0f0' }
                                    }}
                                >
                                    <input
                                        accept="image/*"
                                        type="file"
                                        id="edit-banner-upload"
                                        style={{ display: 'none' }}
                                        onChange={(e) => e.target.files && setData('image', e.target.files[0])}
                                    />
                                    <label htmlFor="edit-banner-upload">
                                        <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                                            Change Image
                                        </Button>
                                    </label>
                                    {data.image ? (
                                        <Typography sx={{ mt: 1, color: 'green' }}>
                                            Selected: {data.image.name}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                            Leave empty to keep current image
                                        </Typography>
                                    )}
                                    {errors.image && <Typography color="error" sx={{ mt: 1 }}>{errors.image}</Typography>}
                                </Box>
                            </Grid>

                            {/* Submit Button */}
                            <Grid size={12} display="flex" justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={<Save />}
                                    disabled={processing}
                                >
                                    Save Changes
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}