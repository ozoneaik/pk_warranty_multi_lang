import React, { useState, FormEvent } from 'react';
import { Head, router, Link } from '@inertiajs/react';

// MUI Icons
import {
    PeopleOutlined as UsersIcon,
    PersonAddOutlined as UserPlusIcon,
    AssignmentTurnedInOutlined as DocumentCheckIcon,
    Search as MagnifyingGlassIcon,
    Inventory2Outlined as ProductIcon,
    KeyboardArrowDown,
    KeyboardArrowUp,
    FilterList,
    TrendingUp,
    EmojiEvents,
    CardGiftcard,
    LocalOffer,
    MonetizationOnOutlined as PointIcon, // Added missing icon
    RedeemOutlined as RedeemIcon // Added missing icon
} from '@mui/icons-material';

// Lucide Icons
import { ArrowLeft, Calendar, Award, Crown, DownloadIcon } from 'lucide-react';

// Recharts
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// --- Interfaces ---
interface Stats {
    total_customers: number;
    new_customers: number;
    total_registrations: number;
    total_points_given: number;
    total_points_redeemed: number;
    count_rewards: number;
    count_privileges: number;
    count_coupons: number;
}

interface Customer {
    cust_firstname: string;
    cust_lastname: string;
    cust_tel: string;
    cust_email: string | null;
    datetime: string;
    status: string;
    tier_key?: string | null;
}

interface HistoryItem {
    id: number;
    model_code?: string;
    serial_number?: string;
    buy_date: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Filters {
    start_date: string;
    end_date: string;
    status?: string;
    tier?: string;
}

interface ChartData {
    name: string;
    value: number;
    color: string;
}

interface Props {
    stats: Stats;
    customers: PaginatedResponse<Customer>;
    history: PaginatedResponse<HistoryItem>;
    filters: Filters;
    age_chart: ChartData[];
    tier_chart: ChartData[];
}

// --- Component ---
export default function CustomerReport({ stats, customers, history, filters, age_chart, tier_chart }: Props) {
    // 1. Filter State (Initialized from props)
    const [searchValues, setSearchValues] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        status: filters.status || '',
        tier: filters.tier || '',
    });

    // 2. Toggle States for Tables
    const [showCustomers, setShowCustomers] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // 3. Handle Search (Filter Submission)
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();

        // Remove empty values to keep URL clean
        const queryParams = Object.fromEntries(
            Object.entries(searchValues).filter(([_, v]) => v !== '')
        );

        router.get(route('admin.reports.customers'), queryParams as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Helper Functions
    const formatDate = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDateShort = (dateString: string): string => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getTierLabel = (key?: string | null): string => {
        if (!key) return 'N/A';
        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    const getTierColor = (key?: string | null): string => {
        switch (key) {
            case 'platinum': return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
            case 'gold': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-300';
            case 'silver': return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const totalAges = age_chart.reduce((sum, item) => sum + item.value, 0);
    const totalTiers = tier_chart ? tier_chart.reduce((sum, item) => sum + item.value, 0) : 0;

    // Reusable Stat Card Component
    const StatCard = ({ icon: Icon, title, value, subtitle, gradient, iconBg }: any) => (
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</h3>
                    {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
                </div>
                <div className={`${iconBg} p-3 rounded-xl shadow-lg`}>
                    <Icon className="text-white" style={{ fontSize: '28px' }} />
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10">
                <Icon style={{ fontSize: '120px' }} className="text-white" />
            </div>
        </div>
    );

    const maskPhoneNumber = (phone: string | null): string => {
        if (!phone) return '-';
        // ลบขีดหรือช่องว่างออกก่อน (ถ้ามี)
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        // if (cleanPhone.length < 10) return phone; // กรณีเบอร์สั้นเกินไปให้แสดงปกติ

        // // จัดรูปแบบ: 0812345678 -> 081-234-xxxx
        // // หรือถ้าเอาแบบง่ายๆ: 081234xxxx

        // // แบบมีขีด (แนะนำ ดูง่ายกว่า)
        // return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-xxxx');

        // // หรือแบบไม่มีขีด (ใช้บรรทัดล่างนี้แทนถ้าชอบแบบติดกัน)
        // // return cleanPhone.slice(0, -4) + 'xxxx';
        if (cleanPhone.length > 4) {
            const first2 = cleanPhone.substring(0, 2); // เก็บ 2 ตัวหน้า (เช่น 08)
            const last2 = cleanPhone.substring(cleanPhone.length - 2); // เก็บ 2 ตัวท้าย (เช่น 78)

            // สร้าง * ตามจำนวนตัวเลขที่เหลือตรงกลาง
            const middleMask = '*'.repeat(cleanPhone.length - 4);

            return `${first2}${middleMask}${last2}`;
        }
        return phone;
    };

    const goBack = () => {
        router.get(route('admin.reports.index'));
    };

    const handleExport = () => {
        // สร้าง Query String จาก searchValues
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(searchValues).filter(([_, v]) => v !== ''))
        ).toString();

        // ยิงไปที่ route export ตรงๆ (ไม่ใช่ผ่าน router.get ของ inertia เพราะเป็นไฟล์ download)
        window.location.href = route('admin.reports.customers.export') + '?' + params;
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center space-x-4">
                <button onClick={goBack} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-1 transition-colors group">
                    {/* <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> */}
                    {/* <span className="text-sm font-medium">กลับไปหน้ารายงาน</span> */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">รายงานลูกค้า</h2>
            </div>
        }>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header Section */}
                    <div className="mb-0">
                        {/* <button onClick={goBack} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-1 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">กลับไปหน้ารายงาน</span>
                        </button> */}

                        {/* <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 pb-2">
                                    รายงานลูกค้า
                                </h1>
                                <p className="text-gray-600">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="text-sm text-gray-600">อัพเดทล่าสุด: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div> */}
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <FilterList className="text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">ตัวกรองข้อมูล</h2>
                        </div>

                        <form onSubmit={handleSearch}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
                                    <input
                                        type="date"
                                        value={searchValues.start_date}
                                        onChange={(e) => setSearchValues({ ...searchValues, start_date: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                                    <input
                                        type="date"
                                        value={searchValues.end_date}
                                        onChange={(e) => setSearchValues({ ...searchValues, end_date: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ระดับสมาชิก</label>
                                    <select
                                        value={searchValues.tier}
                                        onChange={(e) => setSearchValues({ ...searchValues, tier: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        <option value="">ทั้งหมด</option>
                                        <option value="silver">Silver (ซิลเวอร์)</option>
                                        <option value="gold">Gold (โกลด์)</option>
                                        <option value="platinum">Platinum (แพลตินั่ม)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col md:flex-row gap-2 items-end">
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <MagnifyingGlassIcon style={{ fontSize: '20px' }} />
                                        ค้นหา
                                    </button>
                                    <button
                                        type="button" 
                                        onClick={handleExport}
                                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        <DownloadIcon /> Export
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                        <StatCard
                            icon={UsersIcon}
                            title="ลูกค้าทั้งหมด"
                            value={stats.total_customers}
                            subtitle="สมาชิกในระบบ"
                            gradient="from-blue-500 to-blue-600"
                            iconBg="bg-blue-600/20"
                        />
                        <StatCard
                            icon={UserPlusIcon}
                            title="ลูกค้าใหม่"
                            value={stats.new_customers}
                            subtitle="ในช่วงเวลาที่เลือก"
                            gradient="from-green-500 to-green-600"
                            iconBg="bg-green-600/20"
                        />
                        <StatCard
                            icon={DocumentCheckIcon}
                            title="ยอดลงทะเบียน"
                            value={stats.total_registrations}
                            subtitle="สินค้าที่ลงทะเบียน"
                            gradient="from-purple-500 to-purple-600"
                            iconBg="bg-purple-600/20"
                        />
                        <StatCard
                            icon={PointIcon}
                            title="คะแนนที่แจก"
                            value={stats.total_points_given}
                            subtitle="คะแนนทั้งหมด"
                            gradient="from-orange-500 to-orange-600"
                            iconBg="bg-orange-600/20"
                        />
                    </div>

                    {/* Second Row Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                        <StatCard
                            icon={RedeemIcon}
                            title="คะแนนที่ใช้"
                            value={stats.total_points_redeemed}
                            subtitle="คะแนนที่แลกไป"
                            gradient="from-pink-500 to-pink-600"
                            iconBg="bg-pink-600/20"
                        />
                        <StatCard
                            icon={EmojiEvents}
                            title="แลกของรางวัล"
                            value={stats.count_rewards}
                            subtitle="จำนวนการแลก"
                            gradient="from-yellow-500 to-yellow-600"
                            iconBg="bg-yellow-600/20"
                        />
                        <StatCard
                            icon={CardGiftcard}
                            title="แลกสิทธิพิเศษ"
                            value={stats.count_privileges}
                            subtitle="จำนวนการแลก"
                            gradient="from-indigo-500 to-indigo-600"
                            iconBg="bg-indigo-600/20"
                        />
                        <StatCard
                            icon={LocalOffer}
                            title="แลกคูปอง"
                            value={stats.count_coupons}
                            subtitle="จำนวนการแลก"
                            gradient="from-teal-500 to-teal-600"
                            iconBg="bg-teal-600/20"
                        />
                    </div>

                    {/* Age Chart Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-lg">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">การกระจายตามช่วงอายุ</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                            {/* Chart */}
                            <div className="w-full h-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={age_chart}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {age_chart.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend (Span 2 Columns) */}
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                {age_chart.map((entry, index) => {
                                    const percentage = totalAges > 0 ? (entry.value / totalAges) * 100 : 0;
                                    return (
                                        <div key={index} className="flex flex-col">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="font-medium text-gray-700 text-sm">{entry.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900 mr-2">{entry.value.toLocaleString()} คน</span>
                                                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: entry.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-2.5 rounded-lg">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">ระดับสมาชิก (Tier)</h3>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 items-center">
                            {/* Chart */}
                            <div className="w-full h-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={tier_chart}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={0} // Full Pie for Tier
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="white"
                                            strokeWidth={2}
                                        >
                                            {tier_chart && tier_chart.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Legend */}
                            <div className="space-y-2">
                                {tier_chart && tier_chart.map((entry, index) => {
                                    const percentage = totalTiers > 0 ? (entry.value / totalTiers) * 100 : 0;
                                    return (
                                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: entry.color }}>
                                                    {entry.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">{entry.name}</p>
                                                    <p className="text-xs text-gray-500">{entry.value.toLocaleString()} คน</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-gray-800">{percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-white rounded-2xl shadow-lg mb-4 mt-4 overflow-hidden border border-gray-100">
                        <div
                            onClick={() => setShowCustomers(!showCustomers)}
                            className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <UsersIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">รายชื่อลูกค้าใหม่</h3>
                                    <p className="text-sm text-gray-600">ทั้งหมด {customers.total} คน</p>
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                {showCustomers ? <KeyboardArrowUp className="text-gray-600" /> : <KeyboardArrowDown className="text-gray-600" />}
                            </div>
                        </div>

                        {showCustomers && (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">อีเมล</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">วันที่สมัคร</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">ระดับ</th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">สถานะ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {customers.data.length > 0 ? (
                                                customers.data.map((customer, index) => (
                                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">{customer.cust_firstname} {customer.cust_lastname}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{maskPhoneNumber(customer.cust_tel)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{customer.cust_email || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(customer.datetime)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTierColor(customer.tier_key)}`}>
                                                                {getTierLabel(customer.tier_key)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'enabled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {customer.status === 'enabled' ? 'ใช้งาน' : 'ระงับ'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p className="font-medium">ไม่พบข้อมูลลูกค้าในช่วงเวลานี้</p>
                                                </td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {customers.links && customers.links.length > 3 && (
                                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                                        <div className="flex gap-1 flex-wrap justify-center">
                                            {customers.links.map((link, key) => (
                                                link.url ? (
                                                    <Link key={key} href={link.url} preserveState={true} preserveScroll={true} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'}`} />
                                                ) : (
                                                    <span key={key} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1 rounded text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed" />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-2xl shadow-lg mb-4 overflow-hidden border border-gray-100">
                        <div
                            onClick={() => setShowHistory(!showHistory)}
                            className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-600 p-2 rounded-lg">
                                    <ProductIcon className="text-white" style={{ fontSize: '20px' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">รายละเอียดการลงทะเบียนสินค้า</h3>
                                    <p className="text-sm text-gray-600">ทั้งหมด {history.total} รายการ</p>
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                                {showHistory ? <KeyboardArrowUp className="text-gray-600" /> : <KeyboardArrowDown className="text-gray-600" />}
                            </div>
                        </div>

                        {showHistory && (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">รุ่นสินค้า</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Serial Number</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">วันที่ซื้อ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {history.data.length > 0 ? (
                                                history.data.map((item, index) => (
                                                    <tr key={index} className="hover:bg-purple-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.model_code || 'ไม่ระบุ'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono text-sm">{item.serial_number || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDateShort(item.buy_date)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                                    <ProductIcon className="mx-auto mb-3 text-gray-300" style={{ fontSize: '48px' }} />
                                                    <p className="font-medium">ไม่พบรายการลงทะเบียนในช่วงเวลานี้</p>
                                                </td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {history.links && history.links.length > 3 && (
                                    <div className="px-6 py-4 border-t border-gray-100 bg-purple-50/30">
                                        <div className="flex gap-1 flex-wrap justify-center">
                                            {history.links.map((link, key) => (
                                                link.url ? (
                                                    <Link key={key} href={link.url} preserveState={true} preserveScroll={true} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'}`} />
                                                ) : (
                                                    <span key={key} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1 rounded text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed" />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}