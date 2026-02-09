import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Box, Container } from 'lucide-react';
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
        if (actualRank === 1) return <span className="text-2xl">🥇</span>;
        if (actualRank === 2) return <span className="text-2xl">🥈</span>;
        if (actualRank === 3) return <span className="text-2xl">🥉</span>;
        return <span className="font-bold text-gray-500">{actualRank}</span>;
    };

    const goBack = () => {
        router.get(route('admin.reports.index'));
    };

    return (
        <AuthenticatedLayout>
            <div className="p-8 bg-gray-50 min-h-screen font-sans">
                <Head title="รายงานอันดับ PC Ranking" />
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden p-2">
                    <Link href={route('admin.reports.index')}>
                        <Button startIcon={<ArrowBack />} sx={{ mr: 2 }}>
                            Back
                        </Button>
                    </Link>
                    {/* Header Section */}
                    <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                        <h1 className="text-3xl font-black text-orange-800 mb-2">ลำดับยอดสะสม</h1>
                        <p className="text-gray-500 font-medium">Campaign PC New Member Referral Leaderboard</p>
                    </div>
                    <div className="p-6">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-gray-400 uppercase text-xs font-bold tracking-wider">
                                    <th className="px-4 py-2 text-center w-24">ลำดับที่</th>
                                    <th className="px-4 py-2">ชื่อ-สกุล</th>
                                    <th className="px-4 py-2 text-right">ยอดสะสม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.data.length > 0 ? (
                                    rankings.data.map((item, index) => {
                                        const isTopThree = (rankings.from + index) <= 3;
                                        return (
                                            <tr
                                                key={item.referrer_uid}
                                                className={`group transition-all duration-200 ${isTopThree
                                                    ? 'bg-orange-50/50 hover:bg-orange-50'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                {/* ลำดับที่ พร้อมไอคอน */}
                                                <td className="px-4 py-4 text-center rounded-l-xl">
                                                    {getRankIcon(index)}
                                                </td>

                                                {/* ข้อมูลลูกค้า */}
                                                <td className="px-4 py-4">
                                                    <div className="font-bold text-gray-800">
                                                        {item.referrer_name}
                                                    </div>
                                                    <div className="text-sm text-gray-400 italic">
                                                        {item.cust_tel || '---'}
                                                    </div>
                                                </td>

                                                {/* ยอดสะสม */}
                                                <td className="px-4 py-4 text-right rounded-r-xl">
                                                    <span className={`text-xl font-black ${isTopThree ? 'text-orange-600' : 'text-gray-700'
                                                        }`}>
                                                        {Number(item.total_points).toLocaleString()} Point
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="p-10 text-center text-gray-400">
                                            ไม่พบข้อมูลการจัดอันดับ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 flex justify-center border-t border-gray-50 bg-gray-50/50">
                        <nav className="flex items-center gap-1">
                            {rankings.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${link.active
                                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    onClick={(e) => !link.url && e.preventDefault()}
                                />
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout >
    );
};

export default PcRanking;