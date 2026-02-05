import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function PointIndex({ processes }: { processes: any[] }) {

    const handleDelete = (id: number) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
            router.delete(route('admin.points.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
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
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">ระบบสะสมแต้ม (Point Conditions)</h2>
                    </div>
                    <Link
                        href={route('admin.points.create') as string}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center"
                    >
                        + เพิ่มเงื่อนไขใหม่
                    </Link>
                </div>
            }
        >
            <Head title="จัดการแต้ม" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อรายการ</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Default Point</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {processes.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.process_code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.process_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.transaction_type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {item.transaction_type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-bold">{item.default_point}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {item.is_active ? (
                                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">Active</span>
                                                    ) : (
                                                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('admin.points.edit', item.id) as string} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</Link>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">ลบ</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}