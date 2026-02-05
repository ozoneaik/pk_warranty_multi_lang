import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Box, Pagination, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Avatar, IconButton, Typography
} from '@mui/material';
import {
    Plus, Trash2, Edit2, Copy, Ticket, ArrowLeft, MoreHorizontal, Calendar, Tag
} from 'lucide-react';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

interface Coupon {
    id: number;
    name: string;
    code: string;
    image_url: string;
    discount_value: number;
    discount_unit: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface Props {
    coupons: {
        data: Coupon[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

export default function CouponIndex({ coupons }: Props) {

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณไม่สามารถย้อนกลับการกระทำนี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก',
            background: '#fff',
            customClass: {
                title: 'font-prompt',
                popup: 'rounded-xl shadow-xl'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.coupons.destroy', id));
            }
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: 'คัดลอกรหัสเรียบร้อยแล้ว'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.reward-management.index') as string}
                        className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
                        title="ย้อนกลับไป Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        <Ticket className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">จัดการคูปอง</h2>
                        <p className="text-gray-500 text-sm">รายการคูปองส่วนลดทั้งหมดในระบบ</p>
                    </div>
                </div>
            }
        >
            <Head title="จัดการคูปอง" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 font-prompt pb-20">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {
                    /* Header Section */}
                    {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-2"> */}
                        {/* <div>
                            <Link
                                href={route('admin.reward-management.index')}
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 mb-2 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                กลับไปหน้าจัดการรางวัล
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <Ticket className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">จัดการคูปอง</h1>
                                    <p className="text-sm text-gray-500">รายการคูปองส่วนลดทั้งหมดในระบบ</p>
                                </div>
                            </div>
                        </div> */}
                    {/* </div> */}
                    <div className="flex items-center justify-end mb-4">
                        <Link
                            href={route('admin.coupons.create')}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition-all font-medium active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            สร้างคูปองใหม่
                        </Link>
                    </div>
                    {/* Table Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow className="bg-gray-50 border-b border-gray-100">
                                        <TableCell width="80" align="center" className="font-semibold text-gray-600 py-4">รูปภาพ</TableCell>
                                        <TableCell className="font-semibold text-gray-600 py-4">ข้อมูลคูปอง</TableCell>
                                        <TableCell className="font-semibold text-gray-600 py-4">Code</TableCell>
                                        <TableCell className="font-semibold text-gray-600 py-4">มูลค่าส่วนลด</TableCell>
                                        <TableCell className="font-semibold text-gray-600 py-4">ระยะเวลา</TableCell>
                                        <TableCell align="center" className="font-semibold text-gray-600 py-4">สถานะ</TableCell>
                                        <TableCell align="center" width="120" className="font-semibold text-gray-600 py-4">จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {coupons.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <Ticket className="w-12 h-12 mb-3 opacity-20" />
                                                    <Typography variant="body1">ยังไม่มีรายการคูปองในระบบ</Typography>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        coupons.data.map((item) => (
                                            <TableRow
                                                key={item.id}
                                                hover
                                                sx={{
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                {/* Image */}
                                                <TableCell align="center">
                                                    <Avatar
                                                        src={item.image_url || undefined}
                                                        variant="rounded"
                                                        sx={{ width: 48, height: 48, bgcolor: '#f3e8ff', color: '#9333ea', fontSize: 14, fontWeight: 'bold', margin: '0 auto' }}
                                                    >
                                                        {!item.image_url && <Tag className="w-5 h-5" />}
                                                    </Avatar>
                                                </TableCell>

                                                {/* Name & ID */}
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800 text-sm md:text-base">{item.name}</span>
                                                        <span className="text-xs text-gray-400">ID: {item.id}</span>
                                                    </div>
                                                </TableCell>

                                                {/* Code */}
                                                <TableCell>
                                                    {item.code ? (
                                                        <div
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200 text-gray-700 font-mono text-sm cursor-pointer hover:bg-gray-200 hover:border-gray-300 transition-colors group"
                                                            onClick={() => copyToClipboard(item.code)}
                                                            title="คลิกเพื่อคัดลอก"
                                                        >
                                                            {item.code}
                                                            <Copy className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-100">
                                                            Auto Generate
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Discount Value */}
                                                <TableCell>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-bold text-purple-600">
                                                            {Number(item.discount_value).toLocaleString()}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-500 uppercase">
                                                            {item.discount_unit === 'BAHT' ? 'บาท' : (item.discount_unit === 'PERCENT' ? '%' : 'คะแนน')}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Duration */}
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Calendar className="w-3.5 h-3.5 text-green-500" />
                                                            <span>{item.start_date ? dayjs(item.start_date).format('DD MMM BB') : 'ไม่ระบุ'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Calendar className="w-3.5 h-3.5 text-red-400" />
                                                            <span>{item.end_date ? dayjs(item.end_date).format('DD MMM BB') : 'ไม่มีกำหนด'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell align="center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.is_active
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {item.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                                                    </span>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell align="center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route('admin.coupons.edit', item.id)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="แก้ไข"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="ลบ"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Footer / Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center sm:justify-end">
                            <Pagination
                                count={coupons.last_page}
                                page={coupons.current_page}
                                onChange={(_, page) => router.get(route('admin.coupons.index'), { page })}
                                color="primary"
                                shape="rounded"
                                size="small"
                                sx={{
                                    '& .Mui-selected': {
                                        bgcolor: '#9333ea !important', // Purple-600
                                        color: '#fff'
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}