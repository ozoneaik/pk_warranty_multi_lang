// import React from 'react';
// import { Head, Link, router } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Button } from '@mui/material';
// import { ArrowBack } from '@mui/icons-material';

// interface RankingItem {
//     referrer_uid: string;
//     referrer_name: string;
//     total_points: number;
//     total_referrals: number;
//     cust_tel: string;
// }

// interface PaginationLinks {
//     url: string | null;
//     label: string;
//     active: boolean;
// }

// interface RankingsProps {
//     rankings: {
//         data: RankingItem[];
//         links: PaginationLinks[];
//         from: number;
//         current_page: number;
//     };
// }

// const PcRanking: React.FC<RankingsProps> = ({ rankings }) => {

//     // ฟังก์ชันสำหรับดึง Icon ตามลำดับ
//     const getRankIcon = (index: number) => {
//         const actualRank = rankings.from + index;
//         if (actualRank === 1) return <span className="text-2xl">🥇</span>;
//         if (actualRank === 2) return <span className="text-2xl">🥈</span>;
//         if (actualRank === 3) return <span className="text-2xl">🥉</span>;
//         return <span className="font-bold text-gray-500">{actualRank}</span>;
//     };

//     return (
//         <AuthenticatedLayout>
//             <div className="p-8 bg-gray-50 min-h-screen font-sans">
//                 <Head title="รายงานอันดับ PC Ranking" />
//                 <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden p-2">
//                     <Link href={route('admin.reports.index')}>
//                         <Button startIcon={<ArrowBack />} sx={{ mr: 2 }}>
//                             Back
//                         </Button>
//                     </Link>
//                     {/* Header Section */}
//                     <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
//                         <h1 className="text-3xl font-black text-orange-800 mb-2">ลำดับยอดสะสม</h1>
//                         <p className="text-gray-500 font-medium">Campaign PC Product Registration Leaderboard</p>
//                     </div>
//                     <div className="p-6">
//                         <table className="w-full text-left border-separate border-spacing-y-3">
//                             <thead>
//                                 <tr className="text-gray-400 uppercase text-xs font-bold tracking-wider">
//                                     <th className="px-4 py-2 text-center w-24">ลำดับที่</th>
//                                     <th className="px-4 py-2">ชื่อ-สกุล</th>
//                                     <th className="px-4 py-2 text-right">จำนวน (ครั้ง)</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {rankings.data.length > 0 ? (
//                                     rankings.data.map((item, index) => {
//                                         const isTopThree = (rankings.from + index) <= 3;
//                                         return (
//                                             <tr
//                                                 key={item.referrer_uid}
//                                                 className={`group transition-all duration-200 ${isTopThree
//                                                     ? 'bg-orange-50/50 hover:bg-orange-50'
//                                                     : 'hover:bg-gray-50'
//                                                     }`}
//                                             >
//                                                 {/* ลำดับที่ พร้อมไอคอน */}
//                                                 <td className="px-4 py-4 text-center rounded-l-xl">
//                                                     {getRankIcon(index)}
//                                                 </td>

//                                                 {/* ข้อมูลลูกค้า */}
//                                                 <td className="px-4 py-4">
//                                                     <div className="font-bold text-gray-800">
//                                                         {item.referrer_name}
//                                                     </div>
//                                                     <div className="flex items-center gap-2 mt-1">
//                                                         <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">
//                                                             Code: {item.referrer_uid}
//                                                         </span>
//                                                         <span className="text-sm text-gray-400 italic">
//                                                             {item.cust_tel ? `| ${item.cust_tel}` : ''}
//                                                         </span>
//                                                     </div>

//                                                 </td>

//                                                 {/* ✅ แสดงยอดเป็นจำนวนครั้ง */}
//                                                 <td className="px-4 py-4 text-right rounded-r-xl">
//                                                     <span className={`text-xl font-black ${isTopThree ? 'text-orange-600' : 'text-gray-700'
//                                                         }`}>
//                                                         {Number(item.total_referrals).toLocaleString()} ครั้ง
//                                                     </span>
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={3} className="p-10 text-center text-gray-400">
//                                             ไม่พบข้อมูลการจัดอันดับ
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     <div className="p-6 flex justify-center border-t border-gray-50 bg-gray-50/50">
//                         <nav className="flex items-center gap-1">
//                             {rankings.links.map((link, i) => (
//                                 <Link
//                                     key={i}
//                                     href={link.url || '#'}
//                                     dangerouslySetInnerHTML={{ __html: link.label }}
//                                     className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${link.active
//                                         ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
//                                         : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
//                                         } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
//                                     onClick={(e) => !link.url && e.preventDefault()}
//                                 />
//                             ))}
//                         </nav>
//                     </div>
//                 </div>
//             </div>
//         </AuthenticatedLayout >
//     );
// };

// export default PcRanking;

import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Trophy } from 'lucide-react';

interface RankingItem {
    referrer_uid: string;
    referrer_name: string;
    total_points: number;
    total_referrals: number;
    cust_tel: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface RankingsProps {
    rankings: {
        data: RankingItem[];
        links: PaginationLinks[];
        from: number;
        current_page: number;
    };
}

const PcRanking: React.FC<RankingsProps> = ({ rankings }) => {

    // ฟังก์ชันสำหรับดึง Icon ตามลำดับ
    const getRankIcon = (index: number) => {
        const actualRank = rankings.from + index;
        if (actualRank === 1) return <span className="text-3xl drop-shadow-sm">🥇</span>;
        if (actualRank === 2) return <span className="text-3xl drop-shadow-sm">🥈</span>;
        if (actualRank === 3) return <span className="text-3xl drop-shadow-sm">🥉</span>;
        return (
            <div className="w-8 h-8 mx-auto bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                {actualRank}
            </div>
        );
    };

    const goBack = () => {
        router.get(route('admin.reports.index'));
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
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">รายงานอันดับ PC (Leaderboard)</h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">ลำดับยอดสะสม Campaign PC Product Registration</p>
                    </div>
                </div>
            }
        >
            <Head title="รายงานอันดับ PC Ranking" />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Main Card */}
                <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100 relative">

                    {/* Header Section (Banner) */}
                    <div className="p-8 md:p-10 text-center border-b border-gray-100 bg-gradient-to-br from-orange-50 via-white to-white relative overflow-hidden">
                        {/* ลายน้ำถ้วยรางวัล */}
                        <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 transform rotate-12">
                            <Trophy size={140} className="text-orange-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 opacity-10 transform -rotate-12">
                            <Trophy size={100} className="text-orange-400" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-orange-600 mb-2 relative z-10 tracking-tight">
                            ลำดับยอดสะสม
                        </h1>
                        <p className="text-gray-500 font-medium relative z-10">
                            จัดอันดับพนักงานขาย PC จากจำนวนการเชิญเพื่อนที่สำเร็จ
                        </p>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">อันดับ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ข้อมูล PC</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">จำนวนที่ทำได้ (ครั้ง)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rankings.data.length > 0 ? (
                                    rankings.data.map((item, index) => {
                                        const isTopThree = (rankings.from + index) <= 3;
                                        return (
                                            <tr
                                                key={item.referrer_uid}
                                                className={`transition-colors duration-200 group ${isTopThree
                                                        ? 'bg-orange-50/30 hover:bg-orange-50/60'
                                                        : 'hover:bg-gray-50/50'
                                                    }`}
                                            >
                                                {/* อันดับ */}
                                                <td className="px-6 py-5 text-center align-middle">
                                                    {getRankIcon(index)}
                                                </td>

                                                {/* ข้อมูลลูกค้า */}
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-gray-900 text-lg mb-1">
                                                        {item.referrer_name}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md border border-orange-200">
                                                            Code: {item.referrer_uid}
                                                        </span>
                                                        {item.cust_tel && (
                                                            <span className="text-sm text-gray-500 font-medium">
                                                                <span className="text-gray-300 mx-1">|</span>
                                                                {item.cust_tel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* จำนวน */}
                                                <td className="px-6 py-5 text-right align-middle">
                                                    <span className={`text-2xl font-black ${isTopThree ? 'text-orange-600' : 'text-gray-700'
                                                        }`}>
                                                        {Number(item.total_referrals).toLocaleString()}
                                                    </span>
                                                    <span className={`ml-1 text-sm font-semibold ${isTopThree ? 'text-orange-400' : 'text-gray-400'
                                                        }`}>
                                                        ครั้ง
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-16 text-center">
                                            <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <h3 className="text-sm font-medium text-gray-900">ไม่พบข้อมูลการจัดอันดับ</h3>
                                            <p className="mt-1 text-sm text-gray-500">ยังไม่มีข้อมูลการสะสมยอดในระบบ</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {rankings.links && rankings.links.length > 3 && (
                        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-center">
                            <nav className="flex items-center gap-1.5 flex-wrap">
                                {rankings.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${link.active
                                                ? 'bg-orange-500 text-white shadow-md shadow-orange-200/50'
                                                : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50'}`}
                                        onClick={(e) => !link.url && e.preventDefault()}
                                        preserveState
                                        preserveScroll
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default PcRanking;