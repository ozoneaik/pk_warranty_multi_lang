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
    MonetizationOnOutlined as PointIcon,
    RedeemOutlined as RedeemIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

// Lucide Icons
import { ArrowLeft, Calendar, Award, Crown, DownloadIcon } from 'lucide-react';

// Recharts
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import AdminLayout from '@/Layouts/AdminLayout';

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

interface CrmUserType {
    id: number;
    type_code: string;
    type_name: string;
    type_name_en: string | null;
}

interface Customer {
    cust_firstname: string;
    cust_lastname: string;
    cust_tel: string;
    cust_email: string | null;
    datetime: string;
    status: string;
    tier_key?: string | null;
    crm_user_type_id?: number | null;
    crm_type_name?: string | null;
    crm_type_name_en?: string | null;
    crm_type_code?: string | null;
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
    crm_user_type_id?: string | number;
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
    crm_user_types: CrmUserType[];
}

// --- Component ---
export default function CustomerReport({ stats, customers, history, filters, age_chart, tier_chart, crm_user_types }: Props) {
    // 1. Filter State
    const [searchValues, setSearchValues] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        status: filters.status || '',
        tier: filters.tier || '',
        crm_user_type_id: filters.crm_user_type_id ? String(filters.crm_user_type_id) : '',
    });

    // 2. Toggle States for Tables
    const [showCustomers, setShowCustomers] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // 3. Modal State
    const [modalCard, setModalCard] = useState<{ key: string; title: string; icon: any; gradient: string } | null>(null);

    // 3. Handle Search
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
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
    const StatCard = ({ icon: Icon, title, value, subtitle, gradient, iconBg, cardKey }: any) => (
        <div
            onClick={() => setModalCard({ key: cardKey, title, icon: Icon, gradient })}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-sm border border-transparent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer active:scale-95`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 z-10">
                    <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</h3>
                    {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
                </div>
                <div className={`${iconBg} p-3 rounded-xl shadow-sm z-10 backdrop-blur-sm`}>
                    <Icon className="text-white" style={{ fontSize: '28px' }} />
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10 transition-transform duration-500 hover:scale-110">
                <Icon style={{ fontSize: '120px' }} className="text-white" />
            </div>
            <div className="absolute bottom-2 right-3 z-10">
                <span className="text-white/60 text-xs">คลิกเพื่อดูรายละเอียด</span>
            </div>
        </div>
    );

    const maskPhoneNumber = (phone: string | null): string => {
        if (!phone) return '-';
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 4) {
            const first2 = cleanPhone.substring(0, 2);
            const last2 = cleanPhone.substring(cleanPhone.length - 2);
            const middleMask = '*'.repeat(cleanPhone.length - 4);
            return `${first2}${middleMask}${last2}`;
        }
        return phone;
    };

    const goBack = () => {
        router.get(route('admin.reports.index'));
    };

    const handleExport = () => {
        const params = new URLSearchParams(
            Object.fromEntries(Object.entries(searchValues).filter(([_, v]) => v !== ''))
        ).toString();
        window.location.href = route('admin.reports.customers.export') + '?' + params;
    };

    return (
        <AdminLayout header={
            <div className="flex items-center space-x-4">
                {/* <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800" title="ย้อนกลับ">
                    <ArrowLeft className="h-5 w-5" />
                </button> */}
                <div>
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">รายงานลูกค้า</h2>
                    <p className="text-sm text-gray-500 font-normal mt-0.5">ภาพรวมสถิติลูกค้าและการลงทะเบียนทั้งหมดในระบบ</p>
                </div>
            </div>
        }>
            <Head title="รายงานลูกค้า" />

            {/* นำ Wrapper ที่ซ้ำซ้อนอย่าง min-h-screen และ max-w-7xl ออก เพราะ AdminLayout จัดการให้แล้ว */}
            <div className="space-y-6">

                {/* Filter Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <FilterList className="text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900">ตัวกรองข้อมูล</h2>
                    </div>

                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">วันที่เริ่มต้น</label>
                                <input
                                    type="date"
                                    value={searchValues.start_date}
                                    onChange={(e) => setSearchValues({ ...searchValues, start_date: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm py-2.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">วันที่สิ้นสุด</label>
                                <input
                                    type="date"
                                    value={searchValues.end_date}
                                    onChange={(e) => setSearchValues({ ...searchValues, end_date: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm py-2.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ระดับสมาชิก</label>
                                <select
                                    value={searchValues.tier}
                                    onChange={(e) => setSearchValues({ ...searchValues, tier: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm py-2.5"
                                >
                                    <option value="">ทั้งหมด</option>
                                    <option value="silver">Silver (ซิลเวอร์)</option>
                                    <option value="gold">Gold (โกลด์)</option>
                                    <option value="platinum">Platinum (แพลตินั่ม)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ประเภทผู้ใช้ CRM</label>
                                <select
                                    value={searchValues.crm_user_type_id}
                                    onChange={(e) => setSearchValues({ ...searchValues, crm_user_type_id: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm py-2.5"
                                >
                                    <option value="">ทั้งหมด</option>
                                    {crm_user_types.map((t) => (
                                        <option key={t.id} value={String(t.id)}>
                                            {t.type_name}{t.type_name_en ? ` (${t.type_name_en})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                                <button
                                    type="submit"
                                    className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <MagnifyingGlassIcon style={{ fontSize: '20px' }} />
                                    ค้นหา
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    className="w-full sm:w-1/2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Statistics Grid - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={UsersIcon}
                        title="ลูกค้าทั้งหมด"
                        value={stats.total_customers}
                        subtitle="สมาชิกในระบบ"
                        gradient="from-blue-500 to-blue-600"
                        iconBg="bg-blue-600/30"
                        cardKey="total_customers"
                    />
                    <StatCard
                        icon={UserPlusIcon}
                        title="ลูกค้าใหม่"
                        value={stats.new_customers}
                        subtitle="ในช่วงเวลาที่เลือก"
                        gradient="from-emerald-500 to-emerald-600"
                        iconBg="bg-emerald-600/30"
                        cardKey="new_customers"
                    />
                    <StatCard
                        icon={DocumentCheckIcon}
                        title="ยอดลงทะเบียน"
                        value={stats.total_registrations}
                        subtitle="สินค้าที่ลงทะเบียน"
                        gradient="from-violet-500 to-violet-600"
                        iconBg="bg-violet-600/30"
                        cardKey="total_registrations"
                    />
                    <StatCard
                        icon={PointIcon}
                        title="คะแนนที่แจก"
                        value={stats.total_points_given}
                        subtitle="คะแนนทั้งหมด"
                        gradient="from-amber-500 to-orange-500"
                        iconBg="bg-orange-600/30"
                        cardKey="total_points_given"
                    />
                </div>

                {/* Statistics Grid - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={RedeemIcon}
                        title="คะแนนที่ใช้"
                        value={stats.total_points_redeemed}
                        subtitle="คะแนนที่แลกไป"
                        gradient="from-rose-500 to-pink-600"
                        iconBg="bg-pink-600/30"
                        cardKey="total_points_redeemed"
                    />
                    <StatCard
                        icon={EmojiEvents}
                        title="แลกของรางวัล"
                        value={stats.count_rewards}
                        subtitle="จำนวนการแลก"
                        gradient="from-yellow-400 to-amber-500"
                        iconBg="bg-amber-600/30"
                        cardKey="count_rewards"
                    />
                    <StatCard
                        icon={CardGiftcard}
                        title="แลกสิทธิพิเศษ"
                        value={stats.count_privileges}
                        subtitle="จำนวนการแลก"
                        gradient="from-indigo-400 to-indigo-600"
                        iconBg="bg-indigo-600/30"
                        cardKey="count_privileges"
                    />
                    <StatCard
                        icon={LocalOffer}
                        title="แลกคูปอง"
                        value={stats.count_coupons}
                        subtitle="จำนวนการแลก"
                        gradient="from-teal-400 to-teal-600"
                        iconBg="bg-teal-600/30"
                        cardKey="count_coupons"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Age Chart */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                                <Award className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">การกระจายตามช่วงอายุ</h3>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="w-full h-56 relative">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <PieChart>
                                        <Pie
                                            data={age_chart}
                                            cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={75}
                                            paddingAngle={4}
                                            dataKey="value" stroke="none"
                                        >
                                            {age_chart.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                                {age_chart.map((entry, index) => {
                                    const percentage = totalAges > 0 ? (entry.value / totalAges) * 100 : 0;
                                    return (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="font-medium text-gray-700 text-sm">{entry.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900 mr-2">{entry.value.toLocaleString()} คน</span>
                                                    <span className="text-xs text-gray-400">({percentage.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: entry.color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Tier Chart */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                                <Crown className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">ระดับสมาชิก (Tier)</h3>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="w-full h-56 relative">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <PieChart>
                                        <Pie
                                            data={tier_chart}
                                            cx="50%" cy="50%"
                                            innerRadius={0} outerRadius={75}
                                            paddingAngle={2}
                                            dataKey="value" stroke="white" strokeWidth={2}
                                        >
                                            {tier_chart && tier_chart.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-3">
                                {tier_chart && tier_chart.map((entry, index) => {
                                    const percentage = totalTiers > 0 ? (entry.value / totalTiers) * 100 : 0;
                                    return (
                                        <div key={index} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: entry.color }}>
                                                    {entry.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm leading-tight">{entry.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{entry.value.toLocaleString()} คน</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-gray-700">{percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customers Table (Collapsible) */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <button
                        type="button"
                        onClick={() => setShowCustomers(!showCustomers)}
                        className="w-full px-6 py-4 bg-gray-50/50 hover:bg-gray-50 flex justify-between items-center transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg border border-gray-200 text-indigo-600 shadow-sm group-hover:border-indigo-200 transition-colors">
                                <UsersIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-base font-bold text-gray-900 leading-tight">รายชื่อลูกค้า</h3>
                                <p className="text-xs text-gray-500 mt-0.5">ทั้งหมด {customers.total} คน</p>
                            </div>
                        </div>
                        <div className="bg-white p-1.5 rounded-full border border-gray-200 text-gray-400 group-hover:text-indigo-600 transition-colors">
                            {showCustomers ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </div>
                    </button>

                    {showCustomers && (
                        <div className="border-t border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">อีเมล</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่สมัคร</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ประเภทผู้ใช้</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ระดับ</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {customers.data.length > 0 ? (
                                            customers.data.map((customer, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-semibold text-gray-900">{customer.cust_firstname} {customer.cust_lastname}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{maskPhoneNumber(customer.cust_tel)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.cust_email || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.datetime)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {customer.crm_type_name ? (
                                                            <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200" title={customer.crm_type_name_en ?? ''}>
                                                                {customer.crm_type_name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full border ${getTierColor(customer.tier_key)}`}>
                                                            {getTierLabel(customer.tier_key)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${customer.status === 'enabled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                            {customer.status === 'enabled' ? 'ใช้งาน' : 'ระงับ'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p className="text-sm font-medium text-gray-900">ไม่พบข้อมูลลูกค้า</p>
                                                    <p className="text-xs text-gray-500 mt-1">ลองเปลี่ยนเงื่อนไขการค้นหาใหม่</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (Customers) */}
                            {customers.links && customers.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                    <div className="flex gap-1.5 flex-wrap justify-center">
                                        {customers.links.map((link, key) => (
                                            link.url ? (
                                                <Link key={key} href={link.url} preserveState={true} preserveScroll={true} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`} />
                                            ) : (
                                                <span key={key} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed" />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* History Table (Collapsible) */}
                {/* <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"> */}
                    {/* <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full px-6 py-4 bg-gray-50/50 hover:bg-gray-50 flex justify-between items-center transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg border border-gray-200 text-violet-600 shadow-sm group-hover:border-violet-200 transition-colors">
                                <ProductIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-base font-bold text-gray-900 leading-tight">รายละเอียดการลงทะเบียนสินค้า</h3>
                                <p className="text-xs text-gray-500 mt-0.5">ทั้งหมด {history.total} รายการ</p>
                            </div>
                        </div>
                        <div className="bg-white p-1.5 rounded-full border border-gray-200 text-gray-400 group-hover:text-violet-600 transition-colors">
                            {showHistory ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </div>
                    </button> */}

                    {/* {showHistory && ( */}
                        {/* <div className="border-t border-gray-100"> */}
                            {/* <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รุ่นสินค้า (Model)</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Serial Number</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่ซื้อ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {history.data.length > 0 ? (
                                            history.data.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{item.model_code || 'ไม่ระบุ'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">{item.serial_number || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateShort(item.buy_date)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                                    <ProductIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p className="text-sm font-medium text-gray-900">ไม่พบรายการลงทะเบียน</p>
                                                    <p className="text-xs text-gray-500 mt-1">ในช่วงเวลาที่คุณเลือก</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div> */}

                            {/* Pagination (History) */}
                            {/* {history.links && history.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                    <div className="flex gap-1.5 flex-wrap justify-center">
                                        {history.links.map((link, key) => (
                                            link.url ? (
                                                <Link key={key} href={link.url} preserveState={true} preserveScroll={true} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${link.active ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`} />
                                            ) : (
                                                <span key={key} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed" />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        {/* </div> */}
                    {/* )} */}
                {/* </div> */}
            </div>

            {/* Detail Modal */}
            {modalCard && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setModalCard(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${modalCard.gradient} px-6 py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0`}>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <modalCard.icon className="text-white" style={{ fontSize: '22px' }} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">{modalCard.title}</h3>
                                    <p className="text-white/75 text-xs mt-0.5">
                                        {modalCard.key === 'total_registrations'
                                            ? `ทั้งหมด ${history.total} รายการ`
                                            : `ทั้งหมด ${customers.total} คน`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalCard(null)}
                                className="bg-white/20 hover:bg-white/35 p-1.5 rounded-full transition-colors"
                            >
                                <CloseIcon className="text-white" style={{ fontSize: '20px' }} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-auto flex-1">
                            {modalCard.key === 'total_registrations' ? (
                                /* History Table */
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รุ่นสินค้า (Model)</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Serial Number</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่ซื้อ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {history.data.length > 0 ? (
                                            history.data.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="px-6 py-3 whitespace-nowrap font-semibold text-gray-900 text-sm">{item.model_code || 'ไม่ระบุ'}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-gray-600 font-mono text-sm">{item.serial_number || '-'}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{formatDateShort(item.buy_date)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-10 text-center text-gray-400 text-sm">ไม่พบรายการ</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                /* Customers Table */
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">เบอร์โทร</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">อีเมล</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่สมัคร</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ประเภท</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ระดับ</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {customers.data.length > 0 ? (
                                            customers.data.map((customer, index) => (
                                                <tr key={index} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="px-6 py-3 whitespace-nowrap">
                                                        <div className="font-semibold text-gray-900 text-sm">{customer.cust_firstname} {customer.cust_lastname}</div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{maskPhoneNumber(customer.cust_tel)}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{customer.cust_email || '-'}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.datetime)}</td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-center">
                                                        {customer.crm_type_name ? (
                                                            <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                                {customer.crm_type_name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-center">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full border ${getTierColor(customer.tier_key)}`}>
                                                            {getTierLabel(customer.tier_key)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-center">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${customer.status === 'enabled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                            {customer.status === 'enabled' ? 'ใช้งาน' : 'ระงับ'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-10 text-center text-gray-400 text-sm">ไม่พบข้อมูลลูกค้า</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Modal Footer Pagination */}
                        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50/50 rounded-b-2xl flex-shrink-0">
                            {modalCard.key === 'total_registrations' ? (
                                history.links && history.links.length > 3 && (
                                    <div className="flex gap-1.5 flex-wrap justify-center">
                                        {history.links.map((link, key) => (
                                            link.url ? (
                                                <Link key={key} href={link.url} preserveState={true} preserveScroll={true} dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${link.active ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`} />
                                            ) : (
                                                <span key={key} dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed" />
                                            )
                                        ))}
                                    </div>
                                )
                            ) : (
                                customers.links && customers.links.length > 3 && (
                                    <div className="flex gap-1.5 flex-wrap justify-center">
                                        {customers.links.map((link, key) => (
                                            link.url ? (
                                                <Link key={key} href={link.url} preserveState={true} preserveScroll={true} dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`} />
                                            ) : (
                                                <span key={key} dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed" />
                                            )
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}