import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Trash2, Edit, Gift, Plus, ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Props {
    privileges: {
        data: any[];
        links: any[];
        total: number;
    };
}

const Index = ({ privileges }: Props) => {
    const { flash } = usePage().props as any;

    const handleDelete = (id: number, name: string) => {
        if (confirm(`คุณต้องการลบสิทธิพิเศษ "${name}" ใช่หรือไม่? \nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
            router.delete(route('admin.privileges.destroy', id));
        }
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
                    <div className="p-3 bg-purple-600 rounded-xl shadow-md">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">รายการสิทธิพิเศษ</h2>
                        <p className="text-gray-500 text-sm">จัดการข้อมูลสิทธิพิเศษและเงื่อนไขต่างๆ</p>
                    </div>
                </div>
            }
        >
            <div className="p-6 bg-gray-50 min-h-screen font-prompt">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* <button
                        onClick={() => router.visit(route('admin.reward-management.index'))}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับไปหน้าจัดการรางวัล
                    </button> */}
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-end items-center mb-4 gap-4">
                        {/* <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-600 rounded-xl shadow-md">
                                <Gift className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">รายการสิทธิพิเศษ</h1>
                                <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลสิทธิพิเศษและเงื่อนไขต่างๆ</p>
                            </div>
                        </div> */}

                        <Link
                            href={route('admin.privileges.create')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 font-medium hover:shadow-lg active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            สร้างสิทธิพิเศษ
                        </Link>
                    </div>

                    {/* Alert Message */}
                    {flash?.success && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg shadow-sm flex items-center justify-between animate-fade-in-down">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <p className="font-medium">{flash.success}</p>
                            </div>
                        </div>
                    )}

                    {/* Table Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 w-20 text-center">รูปภาพ</th>
                                        <th className="p-4">ชื่อสิทธิพิเศษ / รหัส</th>
                                        <th className="p-4 text-center">Silver Pts</th>
                                        <th className="p-4 text-center">Gold Pts</th>
                                        <th className="p-4 text-center">Platinum Pts</th>
                                        <th className="p-4 text-center">การมองเห็น</th>
                                        <th className="p-4 text-center">สถานะ</th>
                                        <th className="p-4 text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {privileges.data.length > 0 ? privileges.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                                            {/* Image */}
                                            <td className="p-4 text-center">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white mx-auto shadow-sm group-hover:shadow-md transition-shadow">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.privilege_name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                                            <Gift className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Name & Code */}
                                            <td className="p-4">
                                                <div className="font-semibold text-gray-900 line-clamp-1">{item.privilege_name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                                        {item.privilege_code}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Points */}
                                            <td className="p-4 text-center text-sm font-medium text-gray-500">{item.points_silver}</td>
                                            <td className="p-4 text-center text-sm font-medium text-yellow-600">{item.points_gold}</td>
                                            <td className="p-4 text-center text-sm font-medium text-gray-800">{item.points_platinum}</td>

                                            {/* Visibility */}
                                            <td className="p-4 text-center">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${item.visibility_settings === 'both' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    item.visibility_settings === 'user' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                                    }`}>
                                                    {item.visibility_settings === 'both' ? 'Admin & User' : item.visibility_settings}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="p-4 text-center">
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_active ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                    {item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={route('admin.privileges.edit', item.id)}
                                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip"
                                                        title="แก้ไข"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(item.id, item.privilege_name)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-gray-50 rounded-full"><Gift className="w-8 h-8 text-gray-300" /></div>
                                                    <p>ไม่พบข้อมูลสิทธิพิเศษ</p>
                                                    <Link href={route('admin.privileges.create')} className="text-purple-600 hover:underline text-sm font-medium">สร้างรายการใหม่</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer / Pagination */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-500">
                                แสดง {privileges.data.length} รายการ จากทั้งหมด {privileges.total}
                            </div>
                            <div className="flex gap-1">
                                {privileges.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${link.active
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;