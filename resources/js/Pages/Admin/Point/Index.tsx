// import React from 'react';
// import AdminLayout from '@/Layouts/AdminLayout';
// import { Head, Link, router } from '@inertiajs/react';

// export default function PointIndex({ processes }: { processes: any[] }) {

//     const handleDelete = (id: number) => {
//         if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
//             router.delete(route('admin.points.destroy', id));
//         }
//     };

//     return (
//         <AdminLayout
//             header={
//                 <div className="flex justify-between items-center">
//                     <div className="flex items-center space-x-4">
//                         {/* <Link
//                             href={route('admin.dashboard') as string}
//                             className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
//                             title="ย้อนกลับไป Dashboard"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                             </svg>
//                         </Link> */}
//                         <h2 className="font-semibold text-xl text-gray-800 leading-tight">ระบบสะสมแต้ม (Point Conditions)</h2>
//                     </div>
//                     <Link
//                         href={route('admin.points.create') as string}
//                         className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center"
//                     >
//                         + เพิ่มเงื่อนไขใหม่
//                     </Link>
//                 </div>
//             }
//         >
//             <Head title="จัดการแต้ม" />

//             <div className="py-12">
//                 <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//                     <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
//                         <div className="p-6 bg-white border-b border-gray-200">
//                             <div className="overflow-x-auto">
//                                 <table className="min-w-full divide-y divide-gray-200">
//                                     <thead className="bg-gray-50">
//                                         <tr>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อรายการ</th>
//                                             <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
//                                             <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Default Point</th>
//                                             <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
//                                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="bg-white divide-y divide-gray-200">
//                                         {processes.map((item) => (
//                                             <tr key={item.id} className="hover:bg-gray-50">
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.process_code}</td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.process_name}</td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
//                                                     <span className={`px-2 py-1 rounded text-xs font-bold ${item.transaction_type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                                         {item.transaction_type.toUpperCase()}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-bold">{item.default_point}</td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-center">
//                                                     {item.is_active ? (
//                                                         <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">Active</span>
//                                                     ) : (
//                                                         <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">Inactive</span>
//                                                     )}
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                                     <Link href={route('admin.points.edit', item.id) as string} className="text-indigo-600 hover:text-indigo-900 mr-4">แก้ไข</Link>
//                                                     <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">ลบ</button>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </AdminLayout>
//     );
// }

import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function PointIndex({ processes }: { processes: any[] }) {

    const handleDelete = (id: number) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
            router.delete(route('admin.points.destroy', id));
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-4">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">ระบบสะสมแต้ม (Point Conditions)</h2>
                </div>
            }
        >
            <Head title="จัดการแต้ม" />

            {/* ส่วนหัวและปุ่มสร้าง */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="text-gray-500 text-sm">
                    จัดการเงื่อนไขการได้แต้มและใช้แต้มทั้งหมดในระบบ
                </div>

                <Link
                    href={route('admin.points.create') as string}
                    className="inline-flex items-center px-4 py-2.5 bg-indigo-600 border border-transparent rounded-lg font-semibold text-sm text-white hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มเงื่อนไขใหม่
                </Link>
            </div>

            {/* ตารางข้อมูล */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อรายการ</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ประเภท</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Default Point</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {processes && processes.length > 0 ? (
                                processes.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                                                {item.process_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {item.process_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                                                ${item.transaction_type === 'earn'
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                }`}
                                            >
                                                {item.transaction_type === 'earn' ? 'EARN (+)' : 'BURN (-)'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm font-bold text-indigo-600">
                                                {item.default_point.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {item.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Link
                                                href={route('admin.points.edit', item.id) as string}
                                                className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                                            >
                                                แก้ไข
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors"
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* กรณีไม่พบข้อมูล (Empty State) */
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="text-sm font-medium text-gray-900">ยังไม่มีข้อมูลเงื่อนไขแต้ม</h3>
                                        <p className="mt-1 text-sm text-gray-500">เริ่มต้นโดยการคลิกปุ่ม "เพิ่มเงื่อนไขใหม่" ด้านบน</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}