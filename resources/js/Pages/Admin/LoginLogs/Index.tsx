// import React, { useState } from 'react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head, router } from '@inertiajs/react';
// import { Pagination, PaginationItem } from '@mui/material';
// import { Search, Clock, Monitor, MapPin, CheckCircle, XCircle, Info } from 'lucide-react';
// import dayjs from 'dayjs';
// import { Link } from '@inertiajs/react';

// interface LoginLog {
//     id: number;
//     user_id: number | null;
//     line_id: string | null;
//     ip_address: string;
//     user_agent: string;
//     status: string;
//     failure_reason: string | null;
//     login_at: string;
//     metadata: any; // ปรับเป็น any เพื่อรองรับ Object จากฐานข้อมูล
// }

// interface Props {
//     logs: {
//         data: LoginLog[];
//         current_page: number;
//         last_page: number;
//     };
//     filters: {
//         search?: string;
//     };
// }

// export default function Index({ logs, filters }: Props) {
//     const [search, setSearch] = useState<string>(filters.search || '');

//     const handleSearch = (e: React.FormEvent) => {
//         e.preventDefault();
//         router.get(route('admin.login-logs.index'), { search }, { preserveState: true });
//     };

//     const { current_page, last_page } = logs;

//     return (
//         <AuthenticatedLayout>
//             <Head title="ประวัติการเข้าใช้งาน" />

//             <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//                 {/* Header Section */}
//                 <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//                     <div>
//                         <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ประวัติการเข้าใช้งาน</h1>
//                         <p className="text-sm text-gray-500 mt-1">ระบบบันทึกประวัติการเข้าสู่ระบบและตรวจสอบความปลอดภัย</p>
//                     </div>

//                     <form onSubmit={handleSearch} className="relative w-full md:w-96">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <Search className="h-5 w-5 text-gray-400" />
//                         </div>
//                         <input
//                             type="text"
//                             placeholder="ค้นหา Line ID หรือ IP Address..."
//                             className="block w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                         {search && (
//                             <button
//                                 type="button"
//                                 onClick={() => { setSearch(''); router.get(route('admin.login-logs.index')); }}
//                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//                             >
//                                 <XCircle className="w-5 h-5" />
//                             </button>
//                         )}
//                     </form>
//                 </div>

//                 {/* Table Section */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left border-collapse">
//                             <thead>
//                                 <tr className="bg-gray-50/50 border-b border-gray-200">
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">วัน-เวลา</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">บัญชีผู้ใช้</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ที่อยู่ IP</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ข้อมูลระบบ</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Metadata</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-100">
//                                 {logs.data.length > 0 ? (
//                                     logs.data.map((log) => (
//                                         <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="flex items-center text-sm text-gray-700 font-medium">
//                                                     <Clock className="w-4 h-4 mr-2 text-indigo-400" />
//                                                     {dayjs(log.login_at).format('DD MMM YYYY')}
//                                                     <span className="ml-2 text-gray-400 font-normal">{dayjs(log.login_at).format('HH:mm')}</span>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
//                                                     {log.line_id || 'System/Admin'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
//                                                 <div className="flex items-center">
//                                                     <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
//                                                     {log.ip_address}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 {log.status === 'success' ? (
//                                                     <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
//                                                         <CheckCircle className="w-3.5 h-3.5 mr-1" /> สำเร็จ
//                                                     </span>
//                                                 ) : (
//                                                     <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700" title={log.failure_reason || ''}>
//                                                         <XCircle className="w-3.5 h-3.5 mr-1" /> ล้มเหลว
//                                                     </span>
//                                                 )}
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <div className="flex items-center text-xs text-gray-500 max-w-[180px]">
//                                                     <Monitor className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
//                                                     <span className="truncate" title={log.user_agent}>{log.user_agent}</span>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 {log.metadata ? (
//                                                     <div className="flex flex-col gap-0.5 text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100 min-w-[120px]">
//                                                         {Object.entries(log.metadata).map(([key, value]) => (
//                                                             <div key={key} className="flex justify-between">
//                                                                 <span className="font-bold text-gray-400 uppercase mr-2">{key}:</span>
//                                                                 <span className="truncate">{String(value)}</span>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 ) : (
//                                                     <span className="text-gray-300 text-xs">-</span>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={6} className="px-6 py-20 text-center">
//                                             <div className="flex flex-col items-center justify-center">
//                                                 <Info className="w-12 h-12 text-gray-200 mb-2" />
//                                                 <p className="text-gray-400 italic text-sm">ไม่พบข้อมูลประวัติการใช้งานในระบบ</p>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Pagination Section */}
//                 {last_page > 1 && (
//                     <div className="mt-8 flex justify-center">
//                         <Pagination
//                             count={last_page}
//                             page={current_page}
//                             color="primary"
//                             size="large"
//                             renderItem={(item) => (
//                                 <PaginationItem
//                                     component={Link}
//                                     href={route('admin.login-logs.index', {
//                                         ...filters,
//                                         page: item.page
//                                     })}
//                                     {...item}
//                                     sx={{ borderRadius: '12px', fontWeight: 'bold' }}
//                                 />
//                             )}
//                         />
//                     </div>
//                 )}
//             </div>
//         </AuthenticatedLayout>
//     );
// }

import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Pagination, PaginationItem, Typography } from '@mui/material';
import { Search, Clock, Monitor, MapPin, CheckCircle, XCircle, Info, ArrowLeft, History } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

interface LoginLog {
    id: number;
    user_id: number | null;
    line_id: string | null;
    ip_address: string;
    user_agent: string;
    status: string;
    failure_reason: string | null;
    login_at: string;
    metadata: any;
    user?: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    logs: {
        data: LoginLog[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ logs, filters }: Props) {
    const [search, setSearch] = useState<string>(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.login-logs.index'), { search }, { preserveState: true });
    };

    const { current_page, last_page, total, from, to } = logs;

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
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">ประวัติการเข้าใช้งาน</h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">ระบบบันทึกประวัติการเข้าสู่ระบบและตรวจสอบความปลอดภัย</p>
                    </div>
                </div>
            }
        >
            <Head title="ประวัติการเข้าใช้งาน" />

            <div className="space-y-6">

                {/* Toolbar Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">บันทึก Log ทั้งหมด</h3>
                            <p className="text-sm text-gray-500">พบ {total || 0} รายการ</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหา Line ID หรือ IP Address..."
                            className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(''); router.get(route('admin.login-logs.index')); }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-rose-500 transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-44">วัน-เวลา</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">บัญชีผู้ใช้</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-48">ชื่อ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ที่อยู่ IP</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">สถานะ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">อุปกรณ์ (User Agent)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Metadata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">

                                            {/* Date Time */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                                    <div className="flex items-center gap-1.5 text-gray-900">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {dayjs(log.login_at).locale('th').add(543, 'year').format('DD MMM YY')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 ml-5 font-mono">
                                                        {dayjs(log.login_at).format('HH:mm:ss')} น.
                                                    </div>
                                                </div>
                                            </td>

                                            {/* User Account */}
                                            <td className="px-6 py-4">
                                                {log.line_id ? (
                                                    <span className="inline-flex items-center text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md font-mono">
                                                        {log.line_id}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                                                        System / Admin
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {log.user ? (
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {log.user.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-500">
                                                        ไม่มีข้อมูล
                                                    </span>
                                                )}
                                            </td>

                                            {/* IP Address */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded w-fit border border-gray-100">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                    {log.ip_address}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                {log.status === 'success' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle className="w-3 h-3 mr-1.5 text-emerald-500" /> สำเร็จ
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                                                        title={log.failure_reason || 'ไม่ทราบสาเหตุ'}
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1.5 text-rose-500" /> ล้มเหลว
                                                    </span>
                                                )}
                                            </td>

                                            {/* User Agent */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-start text-xs text-gray-500">
                                                    <Monitor className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
                                                    <span className="line-clamp-2 leading-relaxed" title={log.user_agent}>
                                                        {log.user_agent}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Metadata */}
                                            <td className="px-6 py-4">
                                                {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                                    <div className="flex flex-col gap-1 text-[10px] text-gray-500 bg-gray-50/80 p-2 rounded-lg border border-gray-100 min-w-[120px]">
                                                        {Object.entries(log.metadata).map(([key, value]) => (
                                                            <div key={key} className="flex gap-2">
                                                                <span className="font-bold text-gray-400 uppercase w-12 flex-shrink-0">{key}:</span>
                                                                <span className="truncate font-mono" title={String(value)}>{String(value)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-xs italic">- ไม่มีข้อมูลเพิ่มเติม -</span>
                                                )}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                                    <Info className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">ไม่พบข้อมูลประวัติการใช้งาน</Typography>
                                                <Typography variant="caption" color="text.secondary" mt={0.5}>ลองเปลี่ยนคำค้นหาใหม่ หรือลบการกรองข้อมูลออก</Typography>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Section */}
                    {last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                แสดง {from || 0} ถึง {to || 0} จากทั้งหมด {total} รายการ
                            </Typography>
                            <Pagination
                                count={last_page}
                                page={current_page}
                                color="primary"
                                size="small"
                                renderItem={(item) => (
                                    <PaginationItem
                                        component={Link}
                                        href={route('admin.login-logs.index', {
                                            ...filters,
                                            page: item.page
                                        })}
                                        {...item}
                                        sx={{
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            '&.Mui-selected': {
                                                bgcolor: '#475569 !important', // Slate-600
                                                color: '#fff'
                                            }
                                        }}
                                    />
                                )}
                            />
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}