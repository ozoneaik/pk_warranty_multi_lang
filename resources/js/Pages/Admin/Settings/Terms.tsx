import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box, TextField, Button, Typography, Paper, Tab, Tabs,
    Card, CardContent, Divider
} from '@mui/material';
import { Save, FileText, Eye, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
    terms: string;
}

export default function TermsEdit({ terms }: Props) {
    const [tabValue, setTabValue] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        terms: terms || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    icon: 'success',
                    title: 'บันทึกข้อมูลเรียบร้อยแล้ว',
                    customClass: { popup: 'font-prompt' }
                });
            },
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">จัดการข้อกำหนดและเงื่อนไข</h2>
                    <p className="text-sm text-gray-500 font-normal mt-0.5">แก้ไขเนื้อหาที่จะแสดงในหน้าลงทะเบียน (Step 3)</p>
                </div>
            }
        >
            <Head title="Manage Terms & Conditions" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Info Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <span className="font-bold">คำแนะนำ:</span> เนื้อหานี้รองรับการใส่ HTML Tag พื้นฐาน (เช่น &lt;p&gt;, &lt;b&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;br&gt;) เพื่อจัดรูปแบบข้อความให้สวยงาม
                    </div>
                </div>

                <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'gray.50/50' }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={(_, val) => setTabValue(val)}
                            sx={{
                                px: 2,
                                '& .MuiTab-root': { py: 2, fontWeight: 600, fontSize: '0.875rem' }
                            }}
                        >
                            <Tab icon={<FileText className="w-4 h-4 mr-2" />} iconPosition="start" label="แก้ไขเนื้อหา (Edit)" />
                            <Tab icon={<Eye className="w-4 h-4 mr-2" />} iconPosition="start" label="ตัวอย่าง (Preview)" />
                        </Tabs>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        <form onSubmit={handleSubmit}>
                            {tabValue === 0 ? (
                                <div className="space-y-4">
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={20}
                                        variant="outlined"
                                        placeholder="ใส่เนื้อหาข้อกำหนดและเงื่อนไขที่นี่..."
                                        value={data.terms}
                                        onChange={(e) => setData('terms', e.target.value)}
                                        error={!!errors.terms}
                                        helperText={errors.terms}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                fontFamily: 'monospace',
                                                fontSize: '0.9rem',
                                                bgcolor: '#fcfcfc'
                                            }
                                        }}
                                    />
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 font-bold active:scale-95 disabled:opacity-50"
                                        >
                                            <Save className="w-5 h-5" />
                                            {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 min-h-[400px]">
                                        <div 
                                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                            style={{ fontFamily: 'var(--font-prompt)' }}
                                            dangerouslySetInnerHTML={{ __html: data.terms || '<p class="text-gray-400 italic">ไม่มีเนื้อหาตัวอย่าง</p>' }}
                                        />
                                    </div>
                                    <div className="text-center text-xs text-gray-400 italic">
                                        * ตัวอย่างการแสดงผลเบื้องต้น รูปแบบจริงอาจขึ้นอยู่กับ CSS ของหน้าถัดไป
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
