// import React from 'react';
// import { Link, usePage, router } from '@inertiajs/react'; // เพิ่ม router
// import { Trash2, Edit, Package, Award, ArrowLeft } from 'lucide-react'; // เพิ่ม Icons
// import MobileAuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// interface Props {
//     rewards: {
//         data: any[];
//         links: any[];
//     };
// }

// const Index = ({ rewards }: Props) => {
//     const { flash } = usePage().props as any;

//     // ฟังก์ชันลบ
//     const handleDelete = (id: number, name: string) => {
//         if (confirm(`คุณต้องการลบรางวัล "${name}" ใช่หรือไม่? \nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
//             router.delete(route('admin.rewards.destroy', id), {
//                 onSuccess: () => {
//                     // Optional: แสดง Toast หรือทำอะไรเพิ่มเติมหลังลบสำเร็จ
//                 }
//             });
//         }
//     };

//     return (
//         <MobileAuthenticatedLayout
//             header={
//                 <div className="flex items-center space-x-4">
//                     <Link
//                         href={route('admin.reward-management.index') as string}
//                         className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
//                         title="ย้อนกลับไป Dashboard"
//                     >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                         </svg>
//                     </Link>
//                     <div className="flex flex-col"><h2 className="font-semibold text-xl text-gray-800 leading-tight">รายการของรางวัล</h2>
//                         <p className="text-gray-500 text-sm">จัดการของรางวัลและคะแนนแลกเปลี่ยน</p></div>
//                 </div>
//             }
//         >
//             <div className="py-6">
//                 <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//                     <div className="p-0 bg-gray-100 min-h-screen font-prompt">
//                         {/* <button
//                             onClick={() => router.visit(route('admin.reward-management.index'))}
//                             className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
//                         >
//                             <ArrowLeft className="w-4 h-4" />
//                             กลับไปหน้าจัดการรางวัล
//                         </button> */}
//                         <div className="flex justify-end items-center mb-6">
//                             {/* <div>
//                                 <h1 className="text-2xl font-bold text-gray-800">รายการของรางวัล</h1>
//                                 <p className="text-gray-500 text-sm">จัดการของรางวัลและคะแนนแลกเปลี่ยน</p>
//                             </div> */}
//                             <Link
//                                 href={route('admin.rewards.create')}
//                                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
//                             >
//                                 <span className="text-xl">+</span> เพิ่มของรางวัล
//                             </Link>
//                         </div>

//                         {/* Alert Message */}
//                         {flash?.success && (
//                             <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r shadow-sm flex justify-between items-center">
//                                 <p>{flash.success}</p>
//                             </div>
//                         )}

//                         {/* Table Card */}
//                         <div className="bg-white shadow sm:rounded-lg overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
//                                         <tr>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รูปภาพ</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส / ชื่อรางวัล</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Silver</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gold</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platinum</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภทจัดส่ง</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-100">
//                                         {rewards.data.length > 0 ? rewards.data.map((item) => (
//                                             <tr key={item.id} className="hover:bg-gray-50 transition">
//                                                 {/* ... (Columns อื่นๆ เหมือนเดิม) ... */}
//                                                 <td className="px-6 py-4">
//                                                     {item.image_url ? (
//                                                         <img src={item.image_url} alt={item.reward_name} className="h-12 w-12 object-cover rounded-lg border bg-white" />
//                                                     ) : (
//                                                         <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
//                                                     )}
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <div className="font-medium text-gray-900 line-clamp-1">{item.reward_name}</div>
//                                                     <div className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1">{item.rewards_id}</div>
//                                                 </td>
//                                                 <td className="p-4 text-center font-mono text-sm text-gray-600">{item.points_silver}</td>
//                                                 <td className="p-4 text-center font-mono text-sm text-yellow-600 font-bold">{item.points_gold}</td>
//                                                 <td className="p-4 text-center font-mono text-sm text-gray-800 font-bold">{item.points_platinum}</td>
//                                                 <td className="px-6 py-4 text-sm text-gray-600">
//                                                     {item.delivery_type === 'delivery' ?
//                                                         <span className="flex items-center gap-1"><Package className="w-3 h-3" /> จัดส่ง</span> :
//                                                         <span className="flex items-center gap-1"><Award className="w-3 h-3" /> รับหน้าร้าน</span>
//                                                     }
//                                                 </td>
//                                                 <td className="p-4 text-center">
//                                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                                         {item.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
//                                                     </span>
//                                                 </td>

//                                                 {/* Actions Column */}
//                                                 <td className="p-4 text-right">
//                                                     <div className="flex items-center justify-end gap-2">
//                                                         <Link
//                                                             href={route('admin.rewards.edit', item.id)}
//                                                             className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
//                                                             title="แก้ไข"
//                                                         >
//                                                             <Edit className="w-4 h-4" />
//                                                         </Link>

//                                                         <button
//                                                             onClick={() => handleDelete(item.id, item.reward_name)}
//                                                             className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                                                             title="ลบ"
//                                                         >
//                                                             <Trash2 className="w-4 h-4" />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )) : (
//                                             <tr>
//                                                 <td colSpan={8} className="p-8 text-center text-gray-500">ไม่พบข้อมูลของรางวัล</td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Pagination */}
//                             <div className="p-4 border-t border-gray-200 flex justify-center">
//                                 {rewards.links.map((link: any, index: number) => (
//                                     <Link
//                                         key={index}
//                                         href={link.url || '#'}
//                                         className={`mx-1 px-3 py-1 rounded border text-sm transition-colors ${link.active
//                                             ? 'bg-indigo-600 text-white border-indigo-600'
//                                             : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                                             } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
//                                         dangerouslySetInnerHTML={{ __html: link.label }}
//                                     />
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//         </MobileAuthenticatedLayout>

//     );
// };

// export default Index;

// import React, { useState, useEffect } from 'react'; // เพิ่ม useEffect
// import { Link, usePage, router } from '@inertiajs/react';
// import { Trash2, Edit, Package, Award, ArrowLeft, Filter } from 'lucide-react'; // เพิ่ม Filter icon
// import MobileAuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Clear } from '@mui/icons-material';

// interface Props {
//     rewards: {
//         data: any[];
//         links: any[];
//     };
//     // รับ filters จาก Backend
//     filters: {
//         tier?: string;
//         search?: string;
//     };
// }

// const Index = ({ rewards, filters }: Props) => {
//     const { flash } = usePage().props as any;

//     // State สำหรับ Filter
//     const [tierFilter, setTierFilter] = useState(filters.tier || 'all');
//     const [searchTerm, setSearchFilter] = useState(filters.search || '');

//     // ฟังก์ชันจัดการเมื่อเปลี่ยน Tier
//     const handleFilterChange = (tier: string) => {
//         setTierFilter(tier);
//         router.get(
//             route('admin.rewards.index'),
//             { tier: tier, search: searchTerm }, // ส่ง params ไป
//             { preserveState: true, replace: true } // เพื่อไม่ให้หน้า refresh เต็มรูปแบบ
//         );
//     };

//     // ฟังก์ชันค้นหา (Optional)
//     const handleSearch = (e: React.FormEvent) => {
//         e.preventDefault();
//         router.get(
//             route('admin.rewards.index'),
//             { tier: tierFilter, search: searchTerm },
//             { preserveState: true, replace: true }
//         );
//     };

//     //clear filter
//     const clearFilter = () => {
//         setTierFilter('all');
//         setSearchFilter('');
//         router.get(route('admin.rewards.index'));
//     }

//     const handleDelete = (id: number, name: string) => {
//         if (confirm(`คุณต้องการลบรางวัล "${name}" ใช่หรือไม่? \nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
//             router.delete(route('admin.rewards.destroy', id));
//         }
//     };

//     return (
//         <MobileAuthenticatedLayout
//             header={
//                 <div className="flex items-center space-x-4">
//                     <Link
//                         href={route('admin.reward-management.index') as string}
//                         className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
//                         title="ย้อนกลับไป Dashboard"
//                     >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                         </svg>
//                     </Link>
//                     <div className="flex flex-col">
//                         <h2 className="font-semibold text-xl text-gray-800 leading-tight">รายการของรางวัล</h2>
//                         <p className="text-gray-500 text-sm">จัดการของรางวัลและคะแนนแลกเปลี่ยน</p>
//                     </div>
//                 </div>
//             }
//         >
//             <div className="py-6">
//                 <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//                     <div className="p-0 bg-gray-100 min-h-screen font-prompt">

//                         {/* --- Toolbar Section --- */}
//                         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

//                             {/* Left: Filters & Search */}
//                             <div className="flex items-center gap-3 w-full md:w-auto">

//                                 {/* Tier Filter Dropdown */}
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                         <Filter className="h-4 w-4 text-gray-500" />
//                                     </div>
//                                     <select
//                                         value={tierFilter}
//                                         onChange={(e) => handleFilterChange(e.target.value)}
//                                         className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm cursor-pointer"
//                                     >
//                                         <option value="all">ทุกระดับ (All Tiers)</option>
//                                         <option value="Silver">Silver</option>
//                                         <option value="Gold">Gold</option>
//                                         <option value="Platinum">Platinum</option>
//                                     </select>
//                                 </div>

//                                 {/* Search Input (Optional) */}
//                                 <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
//                                     <input
//                                         type="text"
//                                         placeholder="ค้นหาชื่อ หรือ รหัส..."
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchFilter(e.target.value)}
//                                         className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
//                                     />
//                                     {/* <button type="submit" className="absolute right-2 top-2 text-gray-400">🔍</button> */}
//                                 </form>

//                                 {/* Clear Filter Button */}
//                                 <button
//                                     onClick={clearFilter}
//                                     className="bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg shadow transition flex items-center gap-1 whitespace-nowrap"
//                                 >
//                                     <Clear className="w-2 h-2" />
//                                     ล้างการกรอง
//                                 </button>
//                             </div>

//                             {/* Right: Create Button */}
//                             <Link
//                                 href={route('admin.rewards.create')}
//                                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2 whitespace-nowrap"
//                             >
//                                 <span className="text-xl">+</span> เพิ่มของรางวัล
//                             </Link>
//                         </div>

//                         {/* Alert Message */}
//                         {flash?.success && (
//                             <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r shadow-sm">
//                                 <p>{flash.success}</p>
//                             </div>
//                         )}

//                         {/* Table Card */}
//                         <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
//                                         <tr>
//                                             <th className="px-6 py-3">รูปภาพ</th>
//                                             <th className="px-6 py-3">รหัส / ชื่อรางวัล</th>
//                                             <th className="px-6 py-3 text-center">กลุ่มเป้าหมาย</th> {/* เพิ่มคอลัมน์นี้ถ้าอยากเห็น Tier ชัดๆ */}
//                                             <th className="px-6 py-3 text-center">Silver</th>
//                                             <th className="px-6 py-3 text-center">Gold</th>
//                                             <th className="px-6 py-3 text-center">Platinum</th>
//                                             <th className="px-6 py-3">จัดส่ง</th>
//                                             <th className="px-6 py-3 text-center">สถานะ</th>
//                                             <th className="px-6 py-3 text-right">จัดการ</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-100">
//                                         {rewards.data.length > 0 ? rewards.data.map((item) => (
//                                             <tr key={item.id} className="hover:bg-gray-50 transition">
//                                                 {/* Image */}
//                                                 <td className="px-6 py-4">
//                                                     {item.image_url ? (
//                                                         <img src={item.image_url} alt={item.reward_name} className="h-12 w-12 object-cover rounded-lg border bg-white" />
//                                                     ) : (
//                                                         <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
//                                                     )}
//                                                 </td>
//                                                 {/* Name & ID */}
//                                                 <td className="px-6 py-4">
//                                                     <div className="font-medium text-gray-900 line-clamp-1">{item.reward_name}</div>
//                                                     <div className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1">{item.rewards_id}</div>
//                                                 </td>

//                                                 {/* Member Group (Tier) */}
//                                                 <td className="px-6 py-4 text-center">
//                                                     <span className={`px-2 py-1 rounded text-xs font-medium 
//                                                         ${item.member_group === 'all' ? 'bg-gray-100 text-gray-600' :
//                                                             item.member_group === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
//                                                                 item.member_group === 'Platinum' ? 'bg-slate-200 text-slate-700' :
//                                                                     'bg-blue-50 text-blue-700'}`}>
//                                                         {item.member_group === 'all' ? 'All' : item.member_group}
//                                                     </span>
//                                                 </td>

//                                                 <td className="p-4 text-center font-mono text-sm text-gray-600">{item.points_silver?.toLocaleString()}</td>
//                                                 <td className="p-4 text-center font-mono text-sm text-yellow-600 font-bold">{item.points_gold?.toLocaleString()}</td>
//                                                 <td className="p-4 text-center font-mono text-sm text-gray-800 font-bold">{item.points_platinum?.toLocaleString()}</td>

//                                                 <td className="px-6 py-4 text-sm text-gray-600">
//                                                     {item.delivery_type === 'delivery' ?
//                                                         <span className="flex items-center gap-1"><Package className="w-3 h-3" /> จัดส่ง</span> :
//                                                         <span className="flex items-center gap-1"><Award className="w-3 h-3" /> หน้าร้าน</span>
//                                                     }
//                                                 </td>
//                                                 <td className="p-4 text-center">
//                                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                                         {item.is_active ? 'Active' : 'Inactive'}
//                                                     </span>
//                                                 </td>
//                                                 <td className="p-4 text-right">
//                                                     <div className="flex items-center justify-end gap-2">
//                                                         <Link href={route('admin.rewards.edit', item.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
//                                                             <Edit className="w-4 h-4" />
//                                                         </Link>
//                                                         <button onClick={() => handleDelete(item.id, item.reward_name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                                                             <Trash2 className="w-4 h-4" />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         )) : (
//                                             <tr><td colSpan={9} className="p-8 text-center text-gray-500">ไม่พบข้อมูลรางวัล</td></tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Pagination (Code เดิม) */}
//                             <div className="p-4 border-t border-gray-200 flex justify-center">
//                                 {rewards.links.map((link: any, index: number) => (
//                                     <Link
//                                         key={index}
//                                         href={link.url || '#'}
//                                         className={`mx-1 px-3 py-1 rounded border text-sm transition-colors ${link.active
//                                             ? 'bg-indigo-600 text-white border-indigo-600'
//                                             : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                                             } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
//                                         dangerouslySetInnerHTML={{ __html: link.label }}
//                                     />
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </MobileAuthenticatedLayout>
//     );
// };

// export default Index;


import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Trash2, Edit, Package, Award, ArrowLeft, Filter, Search, X, Plus } from 'lucide-react';

interface Props {
    rewards: {
        data: any[];
        links: any[];
        total: number;
        from: number;
        to: number;
    };
    filters: {
        tier?: string;
        search?: string;
    };
}

const Index = ({ rewards, filters }: Props) => {
    const { flash } = usePage().props as any;

    // State สำหรับ Filter
    const [tierFilter, setTierFilter] = useState(filters.tier || 'all');
    const [searchTerm, setSearchFilter] = useState(filters.search || '');

    // ฟังก์ชันจัดการเมื่อเปลี่ยน Tier
    const handleFilterChange = (tier: string) => {
        setTierFilter(tier);
        router.get(
            route('admin.rewards.index'),
            { tier: tier, search: searchTerm },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // ฟังก์ชันค้นหา
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.rewards.index'),
            { tier: tierFilter, search: searchTerm },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Clear filter
    const clearFilter = () => {
        setTierFilter('all');
        setSearchFilter('');
        router.get(route('admin.rewards.index'));
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`คุณต้องการลบรางวัล "${name}" ใช่หรือไม่? \nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
            router.delete(route('admin.rewards.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-4">
                    {/* <Link
                        href={route('admin.reward-management.index') as string}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
                        title="ย้อนกลับ"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link> */}
                    <div>
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">จัดการของรางวัล</h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">เพิ่ม ลบ แก้ไข และกำหนดคะแนนสำหรับแลกของรางวัล</p>
                    </div>
                </div>
            }
        >
            <Head title="รายการของรางวัล" />

            <div className="space-y-6">

                {/* Alert Message */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
                        <div className="bg-emerald-100 p-1.5 rounded-lg">
                            <Award className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="font-medium text-sm">{flash.success}</p>
                    </div>
                )}

                {/* --- Toolbar Section --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">

                    {/* Left: Filters & Search */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

                        {/* Tier Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-indigo-500" />
                            </div>
                            <select
                                value={tierFilter}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer appearance-none outline-none min-w-[140px]"
                            >
                                <option value="all">ทุกระดับ (All)</option>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Platinum">Platinum</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อ หรือ รหัส..."
                                value={searchTerm}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-shadow"
                            />
                        </form>

                        {/* Clear Filter Button */}
                        {(tierFilter !== 'all' || searchTerm !== '') && (
                            <button
                                onClick={clearFilter}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 px-3 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 text-sm font-medium whitespace-nowrap"
                            >
                                <X className="w-4 h-4" />
                                ล้างค่า
                            </button>
                        )}
                    </div>

                    {/* Right: Create Button */}
                    <Link
                        href={route('admin.rewards.create')}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        เพิ่มของรางวัล
                    </Link>
                </div>

                {/* --- Table Card --- */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">รูปภาพ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">รหัส / ชื่อรางวัล</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">กลุ่มเป้าหมาย</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Silver</th>
                                    <th className="px-6 py-4 text-xs font-bold text-yellow-600 uppercase tracking-wider text-center">Gold</th>
                                    <th className="px-6 py-4 text-xs font-bold text-indigo-600 uppercase tracking-wider text-center">Platinum</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">การจัดส่ง</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">สถานะ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rewards.data.length > 0 ? rewards.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">

                                        {/* Image */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.reward_name} className="h-12 w-12 object-cover rounded-xl border border-gray-200 shadow-sm bg-white" />
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 text-[10px] font-medium shadow-sm">
                                                    No Img
                                                </div>
                                            )}
                                        </td>

                                        {/* Name & ID */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 line-clamp-1">{item.reward_name}</div>
                                            <div className="text-xs text-gray-500 font-mono bg-gray-100 border border-gray-200 inline-block px-2 py-0.5 rounded-md mt-1.5">
                                                {item.rewards_id}
                                            </div>
                                        </td>

                                        {/* Target Group */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border 
                                                ${item.member_group === 'all' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                                    item.member_group === 'Gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        item.member_group === 'Platinum' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                            'bg-slate-50 text-slate-700 border-slate-200'}`}
                                            >
                                                {item.member_group === 'all' ? 'All Tiers' : item.member_group}
                                            </span>
                                        </td>

                                        {/* Points */}
                                        <td className="px-6 py-4 text-center font-mono text-sm font-medium text-gray-600">
                                            {item.points_silver?.toLocaleString() || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-sm font-bold text-yellow-600">
                                            {item.points_gold?.toLocaleString() || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-sm font-bold text-indigo-600">
                                            {item.points_platinum?.toLocaleString() || '-'}
                                        </td>

                                        {/* Delivery Type */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.delivery_type === 'delivery' ? (
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                                    <Package className="w-3.5 h-3.5" /> จัดส่ง
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                                    <Award className="w-3.5 h-3.5" /> หน้าร้าน
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${item.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('admin.rewards.edit', item.id)}
                                                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                                    title="แก้ไข"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.reward_name)}
                                                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <h3 className="text-sm font-medium text-gray-900">ไม่พบข้อมูลของรางวัล</h3>
                                            <p className="mt-1 text-sm text-gray-500">ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มของรางวัลใหม่</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {rewards.links && rewards.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <span className="text-sm text-gray-500 font-medium">
                                แสดง {rewards.from || 0} ถึง {rewards.to || 0} จากทั้งหมด {rewards.total || 0} รายการ
                            </span>
                            <div className="flex gap-1.5 flex-wrap justify-center">
                                {rewards.links.map((link: any, index: number) => (
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${link.active
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-indigo-600'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default Index;