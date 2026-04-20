// import React from 'react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head, Link } from '@inertiajs/react';

// interface MenuData {
//     id: number;
//     title: string;
//     description: string;
//     icon_type: string;
//     route_name: string;
//     color_class: string;
//     icon_color: string;
//     is_active: boolean;
// }

// // Component สำหรับแยกประเภท Icon ตาม icon_type ใน Database
// const MenuIcon = ({ type, className }: { type: string; className: string }) => {
//     switch (type) {
//         case 'user':
//             return (
//                 <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//             );
//         case 'product':
//             return (
//                 <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                 </svg>
//             );
//         case 'point':
//             return (
//                 <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//             );
//         default:
//             return ( // Default icon if not matched
//                 <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//             );
//     }
// };

// export default function AdminDashboard({ auth, menus }: { auth: any; menus: MenuData[] }) {
//     return (
//         <AuthenticatedLayout
//             header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Dashboard</h2>}
//         >
//             <Head title="Admin Dashboard" />

//             <div className="py-12">
//                 <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//                     <div className="mb-8">
//                         <h3 className="text-2xl font-bold text-gray-900">ยินดีต้อนรับ, {auth.user.name}</h3>
//                         <p className="text-gray-600 mt-1">จัดการระบบ Pumpkin Privilege ผ่านเมนูควบคุมด้านล่าง</p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                         {menus
//                             .filter(menu => menu.is_active)
//                             .map((menu) => (
//                                 <Link
//                                     key={menu.id}
//                                     href={route(menu.route_name)}
//                                     className="group relative block p-8 rounded-2xl shadow-sm border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
//                                 >
//                                     <div className="flex items-start space-x-5">
//                                         {/* Icon Container */}
//                                         <div className={`p-4 rounded-xl transition-colors duration-300 ${menu.color_class}`}>
//                                             <MenuIcon
//                                                 type={menu.icon_type}
//                                                 className={`h-9 w-9 ${menu.icon_color}`}
//                                             />
//                                         </div>

//                                         {/* Text Content */}
//                                         <div className="flex-1">
//                                             <h4 className="text-xl font-extrabold text-gray-800 group-hover:text-indigo-600 transition-colors">
//                                                 {menu.title}
//                                             </h4>
//                                             <p className="mt-2 text-sm text-gray-500 leading-relaxed">
//                                                 {menu.description}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Arrow Indicator */}
//                                     <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-300">
//                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                                         </svg>
//                                     </div>
//                                 </Link>
//                             ))}
//                     </div>
//                 </div>
//             </div>
//         </AuthenticatedLayout>
//     );
// }

import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Users, Calendar, CheckCircle, UserPlus, Search, AlertCircle } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

interface MenuData {
    id: number;
    title: string;
    description: string;
    icon_type: string;
    route_name: string;
    color_class: string;
    icon_color: string;
    is_active: boolean;
    parent_id: number | null;
}

interface StatsData {
    total: number;       // 🌟 ปรับให้ตรงกับ Controller
    success: number;
    failed: number;      // 🌟 ปรับให้ตรงกับ Controller
    newRegisters: number;
    trendData: { date: string; ผู้เข้าใช้งาน: number }[];
    providerData: { name: string; จำนวน: number }[];
}

// Component สำหรับแยกประเภท Icon ตาม icon_type ใน Database
const MenuIcon = ({ type, className }: { type: string; className: string }) => {
    switch (type) {
        case 'dashboard': // เพิ่มเคสนี้
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            );
        case 'user':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            );
        case 'product':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            );
        case 'point':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        default:
            return ( // Default icon if not matched
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            );
    }
};

export default function AdminDashboard({ auth, menus, stats, filters }: { auth: any; menus: MenuData[], stats: StatsData, filters: any }) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const applyFilter = () => {
        router.get(
            route('admin.dashboard'),
            { start_date: startDate, end_date: endDate },
            { preserveState: true, preserveScroll: true } // ให้หน้าจอไม่เด้งกลับไปบนสุด
        );
    };
    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-4">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">Dashboard</h2>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ยินดีต้อนรับ {auth.user.name} 👋
                        </h3>
                        <p className="text-sm text-gray-500">ตรวจสอบภาพรวมสถิติการใช้งานระบบ</p>
                    </div>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-end sm:items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-gray-500 min-w-max">เริ่ม:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-gray-500 min-w-max">ถึง:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        onClick={applyFilter}
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                    >
                        <Search size={16} />
                        <span>กรองข้อมูล</span>
                    </button>
                </div>

                {/* 1. สรุปตัวเลข (Summary Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">การเข้าใช้งานรวม</p>
                            <h4 className="text-3xl font-bold text-indigo-600">{stats.total.toLocaleString()} <span className="text-sm font-normal text-gray-400">ครั้ง</span></h4>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl text-indigo-500">
                            <Users size={28} />
                        </div>
                    </div>

                    {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Logins สำเร็จ</p>
                            <h4 className="text-3xl font-bold text-emerald-600">{stats.success.toLocaleString()} <span className="text-sm font-normal text-gray-400">ครั้ง</span></h4>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl text-emerald-500">
                            <CheckCircle size={28} />
                        </div>
                    </div> */}

                    {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Logins ไม่สำเร็จ</p>
                            <h4 className="text-3xl font-bold text-rose-500">{stats.failed.toLocaleString()} <span className="text-sm font-normal text-gray-400">ครั้ง</span></h4>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-xl text-rose-500">
                            <AlertCircle size={28} />
                        </div>
                    </div> */}

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">ลงทะเบียนใหม่</p>
                            <h4 className="text-3xl font-bold text-amber-500">{stats.newRegisters.toLocaleString()} <span className="text-sm font-normal text-gray-400">คน</span></h4>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl text-amber-500">
                            <UserPlus size={28} />
                        </div>
                    </div>
                </div>

                {/* 2. พื้นที่กราฟ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* กราฟเส้น: แนวโน้ม 7 วันย้อนหลัง */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">สถิติการเข้าใช้งาน 7 วันย้อนหลัง</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                {/* แก้ไขตรงนี้ */}
                                <LineChart data={stats.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="ผู้เข้าใช้งาน" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* กราฟแท่ง: ช่องทางการ Login */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">ช่องทางการเข้าสู่ระบบ (Providers)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                {/* แก้ไขตรงนี้ */}
                                <BarChart data={stats.providerData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="จำนวน" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}