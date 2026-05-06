import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, Link } from "@inertiajs/react";
import { Pagination, PaginationItem, Typography } from "@mui/material";
import {
    Search,
    XCircle,
    Info,
    ShieldCheck,
    Download,
    CalendarDays,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface Registration {
    id: number;
    customer_name: string | null;
    customer_code: string | null;
    cust_tel: string | null;
    lineid: string | null;
    serial_number: string | null;
    model_code: string | null;
    model_name: string | null;
    product_name: string | null;
    store_name: string | null;
    buy_from: string | null;
    buy_date: string | null;
    insurance_expire: string | null;
    approval: string | null;
    approver: string | null;
    pc_code: string | null;
    slip: string | null;
}

interface Props {
    registrations: {
        data: Registration[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        approval?: string;
        start_date?: string;
        end_date?: string;
    };
}

function ApprovalBadge({ value }: { value: string | null }) {
    if (!value || value === "") {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                รอดำเนินการ
            </span>
        );
    }
    if (value.toUpperCase() === "Y") {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ผ่านการอนุมัติ
            </span>
        );
    }
    if (value.toUpperCase() === "N") {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                ไม่ผ่านการอนุมัติ
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
            {value}
        </span>
    );
}

function formatDate(date: string | null) {
    if (!date) return "-";
    return dayjs(date).locale("th").format("DD MMM YYYY");
}

export default function Index({ registrations, filters }: Props) {
    const [search, setSearch] = useState<string>(filters.search || "");
    const [approval, setApproval] = useState<string>(filters.approval || "");
    const [startDate, setStartDate] = useState<string>(
        filters.start_date || "",
    );
    const [endDate, setEndDate] = useState<string>(filters.end_date || "");

    const { current_page, last_page, total, from, to } = registrations;

    const currentParams = {
        search,
        approval,
        start_date: startDate,
        end_date: endDate,
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route("admin.warranty-registrations.index"), currentParams, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch("");
        setApproval("");
        setStartDate("");
        setEndDate("");
        router.get(route("admin.warranty-registrations.index"));
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (approval) params.set("approval", approval);
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);
        window.location.href =
            route("admin.warranty-registrations.export") +
            (params.toString() ? "?" + params.toString() : "");
    };

    const hasFilter = !!(
        filters.search ||
        filters.approval ||
        filters.start_date ||
        filters.end_date
    );

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-4">
                    <div>
                        <h2 className="font-bold text-2xl text-gray-800 leading-tight">
                            ข้อมูลลงทะเบียนรับประกัน CRM
                        </h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">
                            ข้อมูลการลงทะเบียนรับประกันสินค้าผ่านระบบ Pumpkin
                            CRM
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="ทะเบียนรับประกัน CRM" />

            <div className="space-y-6">
                {/* Toolbar */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    {/* Title + Export */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    รายการลงทะเบียนทั้งหมด
                                </h3>
                                <p className="text-sm text-gray-500">
                                    พบ {total || 0} รายการ
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>

                    {/* Filters */}
                    <form onSubmit={handleSearch} className="space-y-3">
                        {/* Row 1: Search + Status */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="ค้นหา ชื่อลูกค้า, เบอร์โทร, Serial, Line ID, รหัสลูกค้า..."
                                    className="block w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-rose-500 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <select
                                value={approval}
                                onChange={(e) => setApproval(e.target.value)}
                                className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-700 min-w-[160px]"
                            >
                                <option value="">ทุกสถานะ</option>
                                <option value="pending">รอดำเนินการ</option>
                                <option value="Y">ผ่านการอนุมัติ</option>
                                <option value="N">ไม่ผ่านการอนุมัติ</option>
                            </select>
                        </div>

                        {/* Row 2: Date Range + Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
                                    <CalendarDays className="w-4 h-4" />
                                    วันที่ซื้อ
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="flex-1 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-700"
                                />
                                <span className="text-gray-400 text-sm shrink-0">
                                    ถึง
                                </span>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="flex-1 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-gray-700"
                                />
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    ค้นหา
                                </button>
                                {hasFilter && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                                    >
                                        ล้างตัวกรอง
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        #
                                    </th>
                                    {/* <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        ลูกค้า
                                    </th> */}
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        เบอร์โทร / Line ID
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Serial Number
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        สินค้า
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        ช่องทางการสั่งซื้อ
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        ร้านค้า
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        วันที่ซื้อ
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        วันหมดประกัน
                                    </th>
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">
                                        สถานะ
                                    </th>
                                    {/* <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        รหัส PC
                                    </th> */}
                                    <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">
                                        สลิป
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {registrations.data.length > 0 ? (
                                    registrations.data.map((reg, index) => (
                                        <tr
                                            key={reg.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            {/* # */}
                                            <td className="px-4 py-4 text-gray-400 text-xs font-mono whitespace-nowrap">
                                                {(from || 0) + index}
                                            </td>

                                            {/* ลูกค้า */}
                                            {/* <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">
                                                    {reg.customer_name || "-"}
                                                </div>
                                                {reg.customer_code && (
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                        {reg.customer_code}
                                                    </div>
                                                )}
                                            </td> */}

                                            {/* เบอร์ / Line */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-gray-700">
                                                    {reg.cust_tel || "-"}
                                                </div>
                                                {reg.lineid && (
                                                    <div className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono mt-0.5 w-fit">
                                                        {reg.lineid}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Serial */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                    {reg.serial_number || "-"}
                                                </span>
                                            </td>

                                            {/* สินค้า */}
                                            <td className="px-4 py-4">
                                                <div
                                                    className="font-medium text-gray-900 max-w-[180px] truncate"
                                                    title={
                                                        reg.product_name || ""
                                                    }
                                                >
                                                    {reg.product_name ||
                                                        reg.model_name ||
                                                        "-"}
                                                </div>
                                                {reg.model_code && (
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                        {reg.model_code}
                                                    </div>
                                                )}
                                            </td>

                                            {/*  ช่องทางการสั่งซื้อ */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div
                                                    className="text-gray-700 max-w-[140px] truncate"
                                                    title={reg.buy_from || ""}
                                                >
                                                    {reg.buy_from || "-"}
                                                </div>
                                            </td>

                                            {/* ร้านค้า */}
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div
                                                    className="text-gray-700 max-w-[140px] truncate"
                                                    title={reg.store_name || ""}
                                                >
                                                    {reg.store_name ||
                                                        reg.buy_from ||
                                                        "-"}
                                                </div>
                                            </td>

                                            {/* วันที่ซื้อ */}
                                            <td className="px-4 py-4 whitespace-nowrap text-gray-600 text-xs">
                                                {formatDate(reg.buy_date)}
                                            </td>

                                            {/* วันหมดประกัน */}
                                            <td className="px-4 py-4 whitespace-nowrap text-gray-600 text-xs">
                                                {formatDate(
                                                    reg.insurance_expire,
                                                )}
                                            </td>

                                            {/* สถานะ */}
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <ApprovalBadge
                                                    value={reg.approval}
                                                />
                                                {reg.approver && (
                                                    <div className="text-[10px] text-gray-400 mt-1">
                                                        {reg.approver}
                                                    </div>
                                                )}
                                            </td>

                                            {/* รหัส PC */}
                                            {/* <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                                {reg.pc_code || "-"}
                                            </td> */}

                                            {/* สลิป */}
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                {reg.slip ? (
                                                    <a
                                                        href={reg.slip}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                                                    >
                                                        ดูสลิป
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                                    <Info className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color="text.primary"
                                                >
                                                    ไม่พบข้อมูลการลงทะเบียน
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    mt={0.5}
                                                >
                                                    ลองเปลี่ยนคำค้นหา
                                                    หรือลบการกรองข้อมูลออก
                                                </Typography>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                            >
                                แสดง {from || 0} ถึง {to || 0} จากทั้งหมด{" "}
                                {total} รายการ
                            </Typography>
                            <Pagination
                                count={last_page}
                                page={current_page}
                                color="primary"
                                size="small"
                                renderItem={(item) => (
                                    <PaginationItem
                                        component={Link}
                                        href={route(
                                            "admin.warranty-registrations.index",
                                            {
                                                ...filters,
                                                page: item.page,
                                            },
                                        )}
                                        {...item}
                                        sx={{
                                            borderRadius: "8px",
                                            fontWeight: "bold",
                                            "&.Mui-selected": {
                                                bgcolor: "#4f46e5 !important",
                                                color: "#fff",
                                            },
                                        }}
                                    />
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
