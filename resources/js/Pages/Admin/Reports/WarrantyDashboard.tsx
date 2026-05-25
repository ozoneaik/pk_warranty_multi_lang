import React, { useState, FormEvent } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import {
    ShieldCheck,
    CheckCircle2,
    Clock,
    XCircle,
    CalendarDays,
    Filter,
    RotateCcw,
    Search,
    PackageSearch,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    ShoppingBag,
    BarChart3,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Stats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
}

interface ChartItem {
    name: string;
    value: number;
    color?: string;
}

interface MonthItem {
    month: string;
    total: number;
    approved: number;
    rejected: number;
    pending: number;
}

interface RecentItem {
    id: number;
    customer_name: string | null;
    cust_tel: string | null;
    lineid: string | null;
    serial_number: string | null;
    product_name: string | null;
    model_name: string | null;
    model_code: string | null;
    buy_from: string | null;
    store_name: string | null;
    buy_date: string | null;
    approval: string | null;
    approver: string | null;
    timestamp: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRecent {
    data: RecentItem[];
    links: PaginationLink[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Filters {
    start_date: string;
    end_date: string;
}

interface Props {
    stats: Stats;
    approval_chart: ChartItem[];
    by_month: MonthItem[];
    channel_chart: ChartItem[];
    product_chart: ChartItem[];
    recent: PaginatedRecent;
    filters: Filters;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
    if (!d) return "—";
    return dayjs(d).locale("th").format("DD MMM YYYY");
}

function ApprovalBadge({ value }: { value: string | null }) {
    if (!value || value === "")
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
                รอดำเนินการ
            </span>
        );
    if (value.toUpperCase() === "Y")
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                ผ่านอนุมัติ
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            ไม่ผ่าน
        </span>
    );
}

// ─── Horizontal Bar (CSS) ─────────────────────────────────────────────────────

function HorizontalBar({
    name,
    value,
    max,
    color,
    rank,
}: {
    name: string;
    value: number;
    max: number;
    color: string;
    rank: number;
}) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="flex items-center gap-3 group">
            <span className="w-5 text-xs font-bold text-gray-400 shrink-0 text-right">
                {rank}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                    <span
                        className="text-sm font-medium text-gray-700 truncate max-w-[200px]"
                        title={name}
                    >
                        {name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 ml-2 shrink-0">
                        {value.toLocaleString()}
                    </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Custom Tooltip for BarChart ─────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
            <p className="font-bold text-gray-700 mb-2">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                    />
                    <span className="text-gray-600">{p.name}:</span>
                    <span className="font-semibold text-gray-900">
                        {p.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WarrantyDashboard({
    stats,
    approval_chart,
    by_month,
    channel_chart,
    product_chart,
    recent,
    filters,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");
    const [showRecent, setShowRecent] = useState(false);

    const approvalRate =
        stats.total > 0
            ? ((stats.approved / stats.total) * 100).toFixed(1)
            : "0.0";

    const hasFilter = !!(filters.start_date || filters.end_date);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route("admin.reports.warranty-dashboard"),
            { start_date: startDate, end_date: endDate },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setStartDate("");
        setEndDate("");
        router.get(route("admin.reports.warranty-dashboard"));
    };

    const maxChannel =
        channel_chart.length > 0
            ? Math.max(...channel_chart.map((c) => c.value))
            : 1;
    const maxProduct =
        product_chart.length > 0
            ? Math.max(...product_chart.map((p) => p.value))
            : 1;

    // ── Donut center text
    const totalDonut = approval_chart.reduce((s, c) => s + c.value, 0);

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">
                            Dashboard การลงทะเบียน
                        </h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">
                            ภาพรวมสถิติการลงทะเบียนรับประกันผ่านระบบ Pumpkin
                            CRM
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard การลงทะเบียน" />

            <div className="space-y-6">
                {/* ── Filter Card ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-600">
                            ช่วงเวลา (วันที่ลงทะเบียน)
                        </span>
                        {hasFilter && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-600">
                                กำลังกรองอยู่
                            </span>
                        )}
                    </div>
                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col sm:flex-row items-end gap-3">
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    ตั้งแต่วันที่
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-700"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    ถึงวันที่
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-700"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {hasFilter && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        รีเซ็ต
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    แสดงข้อมูล
                                </button>
                            </div>
                        </div>
                        {(filters.start_date || filters.end_date) && (
                            <p className="mt-2 text-xs text-gray-400">
                                แสดงข้อมูล{" "}
                                {filters.start_date
                                    ? formatDate(filters.start_date)
                                    : "ทั้งหมด"}{" "}
                                —{" "}
                                {filters.end_date
                                    ? formatDate(filters.end_date)
                                    : "ปัจจุบัน"}
                            </p>
                        )}
                    </form>
                </div>

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-100 mb-1">
                                    ทั้งหมด
                                </p>
                                <h3 className="text-3xl font-bold">
                                    {stats.total.toLocaleString()}
                                </h3>
                                <p className="text-xs text-indigo-200 mt-1">
                                    รายการลงทะเบียน
                                </p>
                            </div>
                            <div className="bg-indigo-400/30 p-2.5 rounded-xl">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 opacity-10">
                            <ShieldCheck className="w-24 h-24" />
                        </div>
                    </div>

                    {/* Approved */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-100 mb-1">
                                    ผ่านการอนุมัติ
                                </p>
                                <h3 className="text-3xl font-bold">
                                    {stats.approved.toLocaleString()}
                                </h3>
                                <p className="text-xs text-emerald-200 mt-1">
                                    อัตรา {approvalRate}%
                                </p>
                            </div>
                            <div className="bg-emerald-400/30 p-2.5 rounded-xl">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 opacity-10">
                            <CheckCircle2 className="w-24 h-24" />
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-100 mb-1">
                                    รอดำเนินการ
                                </p>
                                <h3 className="text-3xl font-bold">
                                    {stats.pending.toLocaleString()}
                                </h3>
                                <p className="text-xs text-amber-100 mt-1">
                                    รอการตรวจสอบ
                                </p>
                            </div>
                            <div className="bg-amber-300/30 p-2.5 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 opacity-10">
                            <Clock className="w-24 h-24" />
                        </div>
                    </div>

                    {/* Rejected */}
                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-rose-100 mb-1">
                                    ไม่ผ่านการอนุมัติ
                                </p>
                                <h3 className="text-3xl font-bold">
                                    {stats.rejected.toLocaleString()}
                                </h3>
                                <p className="text-xs text-rose-200 mt-1">
                                    ถูกปฏิเสธ
                                </p>
                            </div>
                            <div className="bg-rose-400/30 p-2.5 rounded-xl">
                                <XCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 opacity-10">
                            <XCircle className="w-24 h-24" />
                        </div>
                    </div>
                </div>

                {/* ── Charts Row 1: Donut + Monthly Bar ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
                    {/* Donut Chart — Approval Status */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">
                                สัดส่วนสถานะอนุมัติ
                            </h3>
                        </div>

                        <div className="flex-1 flex flex-col items-center">
                            <div className="relative w-full h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={approval_chart}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={88}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {approval_chart.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={entry.color}
                                                    />
                                                )
                                            )}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {totalDonut.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        รายการ
                                    </span>
                                </div>
                            </div>

                            <div className="w-full space-y-3 mt-2">
                                {approval_chart.map((item, i) => {
                                    const pct =
                                        totalDonut > 0
                                            ? (
                                                  (item.value / totalDonut) *
                                                  100
                                              ).toFixed(1)
                                            : "0.0";
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            item.color,
                                                    }}
                                                />
                                                <span className="text-sm text-gray-600">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {item.value.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-400 w-10 text-right">
                                                    ({pct}%)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart — Monthly Trend */}
                    {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-violet-50 p-2.5 rounded-xl border border-violet-100">
                                <TrendingUp className="w-5 h-5 text-violet-600" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900">
                                แนวโน้มการลงทะเบียนรายเดือน
                            </h3>
                        </div>

                        {by_month.length > 0 ? (
                            <div className="flex-1 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={by_month}
                                        margin={{
                                            top: 4,
                                            right: 8,
                                            left: -16,
                                            bottom: 0,
                                        }}
                                        barGap={2}
                                        barCategoryGap="30%"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{
                                                fontSize: 11,
                                                fill: "#94a3b8",
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{
                                                fontSize: 11,
                                                fill: "#94a3b8",
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            wrapperStyle={{
                                                fontSize: "12px",
                                                paddingTop: "8px",
                                            }}
                                        />
                                        <Bar
                                            dataKey="approved"
                                            name="ผ่านอนุมัติ"
                                            fill="#10b981"
                                            radius={[3, 3, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="pending"
                                            name="รอดำเนินการ"
                                            fill="#f59e0b"
                                            radius={[3, 3, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="rejected"
                                            name="ไม่ผ่าน"
                                            fill="#ef4444"
                                            radius={[3, 3, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">ไม่มีข้อมูลในช่วงเวลานี้</p>
                                </div>
                            </div>
                        )}
                    </div> */}
                </div>

                {/* ── Charts Row 2: Channels + Products ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Channels */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                                <ShoppingBag className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    ช่องทางการสั่งซื้อ
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Top {channel_chart.length} ช่องทาง
                                </p>
                            </div>
                        </div>

                        {channel_chart.length > 0 ? (
                            <div className="space-y-4">
                                {channel_chart.map((item, i) => (
                                    <HorizontalBar
                                        key={i}
                                        rank={i + 1}
                                        name={item.name}
                                        value={item.value}
                                        max={maxChannel}
                                        color="#38bdf8"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-10 text-gray-400">
                                <div className="text-center">
                                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">ไม่มีข้อมูล</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-violet-50 p-2.5 rounded-xl border border-violet-100">
                                <PackageSearch className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    สินค้าที่ลงทะเบียนมากที่สุด
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Top {product_chart.length} รายการ
                                </p>
                            </div>
                        </div>

                        {product_chart.length > 0 ? (
                            <div className="space-y-4">
                                {product_chart.map((item, i) => (
                                    <HorizontalBar
                                        key={i}
                                        rank={i + 1}
                                        name={item.name}
                                        value={item.value}
                                        max={maxProduct}
                                        color="#a78bfa"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-10 text-gray-400">
                                <div className="text-center">
                                    <PackageSearch className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">ไม่มีข้อมูล</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Recent Registrations Table (Collapsible) ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowRecent(!showRecent)}
                        className="w-full px-6 py-4 bg-gray-50/60 hover:bg-gray-50 flex justify-between items-center transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl border border-gray-200 text-indigo-600 shadow-sm group-hover:border-indigo-200 transition-colors">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                    รายการลงทะเบียนล่าสุด
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    ทั้งหมด {recent.total.toLocaleString()}{" "}
                                    รายการในช่วงเวลาที่เลือก
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-1.5 rounded-full border border-gray-200 text-gray-400 group-hover:text-indigo-600 transition-colors">
                            {showRecent ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </div>
                    </button>

                    {showRecent && (
                        <div className="border-t border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/80 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                ลูกค้า
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                Serial Number
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                สินค้า
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                ช่องทาง
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                วันที่ซื้อ
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                ลงทะเบียน
                                            </th>
                                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">
                                                สถานะ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recent.data.length > 0 ? (
                                            recent.data.map((item, idx) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                                        {(recent.current_page -
                                                            1) *
                                                            10 +
                                                            idx +
                                                            1}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900 text-sm">
                                                            {item.customer_name ||
                                                                "—"}
                                                        </div>
                                                        <div className="font-medium text-gray-400 text-sm">
                                                            {item.lineid ||
                                                                "—"}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {item.cust_tel ||
                                                                ""}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="font-mono text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                                                            {item.serial_number ||
                                                                "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-[180px]">
                                                        <div
                                                            className="truncate text-gray-800 text-sm font-medium"
                                                            title={
                                                                item.product_name ||
                                                                item.model_name ||
                                                                ""
                                                            }
                                                        >
                                                            {item.product_name ||
                                                                item.model_name ||
                                                                "—"}
                                                        </div>
                                                        {item.model_code && (
                                                            <div className="text-xs text-gray-400 font-mono">
                                                                {item.model_code}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div
                                                            className="text-xs text-gray-600 max-w-[120px] truncate"
                                                            title={
                                                                item.buy_from ||
                                                                ""
                                                            }
                                                        >
                                                            {item.buy_from ||
                                                                "—"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                        {formatDate(
                                                            item.buy_date
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                        {formatDate(
                                                            item.timestamp
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <ApprovalBadge
                                                            value={item.approval}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-6 py-12 text-center"
                                                >
                                                    <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                                    <p className="text-sm font-medium text-gray-500">
                                                        ไม่พบข้อมูลในช่วงเวลาที่เลือก
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {recent.links && recent.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                                    <div className="flex gap-1.5 flex-wrap justify-center">
                                        {recent.links.map((link, key) =>
                                            link.url ? (
                                                <Link
                                                    key={key}
                                                    href={link.url}
                                                    preserveState={true}
                                                    preserveScroll={true}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? "bg-indigo-600 text-white"
                                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                                    }`}
                                                />
                                            ) : (
                                                <span
                                                    key={key}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed"
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
