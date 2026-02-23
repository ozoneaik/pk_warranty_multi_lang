// import React from 'react';
// import AdminLayout from '@/Layouts/AdminLayout';
// import { Head, Link, router, usePage } from '@inertiajs/react';
// import { useState } from 'react';

// export default function UserIndex({ users, filters }: any) {
//     const [search, setSearch] = useState(filters.search || '');
//     const { auth } = usePage().props as any;

//     const handleSearch = (e: React.FormEvent) => {
//         e.preventDefault();
//         router.get(route('admin.users.index'), { search }, { preserveState: true });
//     };

//     // ✅ เพิ่มฟังก์ชันสำหรับล้างค่า
//     const handleReset = () => {
//         setSearch(''); // เคลียร์ input
//         router.get(route('admin.users.index')); // โหลดหน้าใหม่โดยไม่ส่ง search param
//     };

//     const handleDelete = (id: number) => {
//         if (confirm('ยืนยันการลบผู้ใช้นี้?')) {
//             router.delete(route('admin.users.destroy', id));
//         }
//     };


//     return (
//         <AdminLayout
//             header={
//                 <div className="flex items-center space-x-4">
//                     <Link
//                         href={route('admin.dashboard') as string}
//                         className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
//                         title="ย้อนกลับไป Dashboard"
//                     >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                         </svg>
//                     </Link>
//                     <h2 className="font-semibold text-xl text-gray-800 leading-tight">จัดการผู้ใช้ Admin</h2>
//                 </div>
//             }
//         >
//             <Head title="User Management" />
//             <div className="py-12">
//                 <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//                     <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
//                         <div className="flex items-center justify-between mb-4">

//                             {/* Search Bar */}
//                             <form onSubmit={handleSearch} className="mb-6 flex gap-2">
//                                 <input
//                                     type="text"
//                                     className="border-gray-300 rounded-md shadow-sm w-full md:w-64" // ปรับความกว้างนิดหน่อยให้ดูดี
//                                     placeholder="ค้นหาชื่อ หรือ อีเมล..."
//                                     value={search}
//                                     onChange={e => setSearch(e.target.value)}
//                                 />
//                                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
//                                     ค้นหา
//                                 </button>

//                                 {/* ✅ ปุ่มล้างค่า (จะแสดงเฉพาะเมื่อมีค่า search) */}
//                                 {search && (
//                                     <button
//                                         type="button" // สำคัญ! ต้องเป็น type="button" เพื่อไม่ให้ submit form
//                                         onClick={handleReset}
//                                         className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
//                                     >
//                                         ล้างค่า
//                                     </button>
//                                 )}
//                             </form>

//                             {/* create user */}
//                             {(auth.user.role === 'super_admin' || auth.user.role === 'admin') && (
//                                 <div className="mb-4">
//                                     <Link
//                                         href={route('admin.users.create')}
//                                         className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
//                                     >
//                                         สร้างผู้ใช้ใหม่
//                                     </Link>
//                                 </div>
//                             )}
//                         </div>
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead>
//                                 <tr className="bg-gray-50">
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">บทบาท</th>
//                                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200">
//                                 {users.data.map((user: any) => (
//                                     <tr key={user.id}>
//                                         <td className="px-6 py-4">{user.name}</td>
//                                         <td className="px-6 py-4">{user.email}</td>
//                                         <td className="px-6 py-4 capitalize">
//                                             <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
//                                                 user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
//                                                     'bg-gray-100 text-gray-700'
//                                                 }`}>
//                                                 {user.role}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-right space-x-3">
//                                             {/* ★ ปุ่มลิงก์ไปหน้าตั้งค่าสิทธิ์ ★ */}
//                                             {user.role !== 'super_admin' && (
//                                                 <Link
//                                                     href={route('admin.users.permissions.edit', user.id)}
//                                                     className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
//                                                 >
//                                                     ตั้งค่าสิทธิ์
//                                                 </Link>
//                                             )}

//                                             {auth.user.role === 'super_admin' && (
//                                                 <Link
//                                                     href={route('admin.users.edit', user.id)} // ตรวจสอบชื่อ route ให้ตรงกับ backend
//                                                     className="text-amber-600 hover:text-amber-900 text-sm font-medium"
//                                                 >
//                                                     แก้ไข
//                                                 </Link>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </AdminLayout>
//     );
// }

import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function UserIndex({ users, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const { auth } = usePage<any>().props;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('admin.users.index'));
    };

    const handleDelete = (id: number) => {
        if (confirm('ยืนยันการลบผู้ใช้นี้?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-4">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">จัดการผู้ใช้งาน</h2>
                </div>
            }
        >
            <Head title="User Management" />

            {/* ส่วนหัวและเครื่องมือค้นหา */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {/* Search Icon */}
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm"
                            placeholder="ค้นหาชื่อ หรือ อีเมล..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2.5 bg-indigo-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                    >
                        ค้นหา
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                        >
                            ล้างค่า
                        </button>
                    )}
                </form>

                {/* Create Button */}
                {(auth.user.role === 'super_admin' || auth.user.role === 'admin') && (
                    <Link
                        href={route('admin.users.create')}
                        className="inline-flex items-center px-4 py-2.5 bg-green-600 border border-transparent rounded-lg font-semibold text-sm text-white hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        สร้างผู้ใช้ใหม่
                    </Link>
                )}
            </div>

            {/* ตารางข้อมูล */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้งาน</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">อีเมล</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ระดับสิทธิ์ (Role)</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users.data.length > 0 ? (
                                users.data.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize
                                                ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                    user.role === 'admin' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {/* ปุ่มตั้งค่าสิทธิ์ */}
                                            {user.role !== 'super_admin' && (
                                                <Link
                                                    href={route('admin.users.permissions.edit', user.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors"
                                                >
                                                    ตั้งค่าสิทธิ์
                                                </Link>
                                            )}

                                            {/* ปุ่มแก้ไข */}
                                            {auth.user.role === 'super_admin' && (
                                                <Link
                                                    href={route('admin.users.edit', user.id)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                                                >
                                                    แก้ไข
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* กรณีไม่พบข้อมูล */
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <h3 className="text-sm font-medium text-gray-900">ไม่พบข้อมูลผู้ใช้งาน</h3>
                                        <p className="mt-1 text-sm text-gray-500">ลองค้นหาด้วยคำอื่น หรือเพิ่มผู้ใช้งานใหม่</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* จุดสำหรับใส่ Pagination ในอนาคต */}
                {/* <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    Pagination Component Here
                </div> */}
            </div>
        </AdminLayout>
    );
}