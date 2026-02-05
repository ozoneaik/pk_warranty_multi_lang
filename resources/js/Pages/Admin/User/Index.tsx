import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function UserIndex({ users, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const { auth } = usePage().props as any;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true });
    };

    // ✅ เพิ่มฟังก์ชันสำหรับล้างค่า
    const handleReset = () => {
        setSearch(''); // เคลียร์ input
        router.get(route('admin.users.index')); // โหลดหน้าใหม่โดยไม่ส่ง search param
    };

    const handleDelete = (id: number) => {
        if (confirm('ยืนยันการลบผู้ใช้นี้?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.dashboard') as string}
                        className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
                        title="ย้อนกลับไป Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">จัดการผู้ใช้ Admin</h2>
                </div>
            }
        >
            <Head title="User Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                                <input
                                    type="text"
                                    className="border-gray-300 rounded-md shadow-sm w-full md:w-64" // ปรับความกว้างนิดหน่อยให้ดูดี
                                    placeholder="ค้นหาชื่อ หรือ อีเมล..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                                    ค้นหา
                                </button>

                                {/* ✅ ปุ่มล้างค่า (จะแสดงเฉพาะเมื่อมีค่า search) */}
                                {search && (
                                    <button
                                        type="button" // สำคัญ! ต้องเป็น type="button" เพื่อไม่ให้ submit form
                                        onClick={handleReset}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                                    >
                                        ล้างค่า
                                    </button>
                                )}
                            </form>

                            {/* create user */}
                            {auth.user.role === 'super_admin' && (
                                <div className="mb-4">
                                    <Link
                                        href={route('admin.users.create')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                    >
                                        สร้างผู้ใช้ใหม่
                                    </Link>
                                </div>
                            )}
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">บทบาท</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.map((user: any) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4 capitalize">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            {/* ★ ปุ่มลิงก์ไปหน้าตั้งค่าสิทธิ์ ★ */}
                                            {user.role !== 'super_admin' && (
                                                <Link
                                                    href={route('admin.users.permissions.edit', user.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    ตั้งค่าสิทธิ์
                                                </Link>
                                            )}

                                            {auth.user.role === 'super_admin' && (
                                                <Link
                                                    href={route('admin.users.edit', user.id)} // ตรวจสอบชื่อ route ให้ตรงกับ backend
                                                    className="text-amber-600 hover:text-amber-900 text-sm font-medium"
                                                >
                                                    แก้ไข
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}