import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface SubMenu {
    id: number;
    title: string;
    description: string;
    route_name: string;
    icon_type: string;
    color_class: string;
    icon_color: string;
    is_active: boolean;
}

interface Props {
    sub_menus?: SubMenu[]; // รับข้อมูลเมนูย่อยมาแสดงผล
}

const goBack = () => {
    router.visit(route('admin.dashboard'));
}

export default function Index({ sub_menus = [] }: Props) {
    return (
        <AuthenticatedLayout
            header={
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
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Report Dashboard</h2>
                </div>
            }
        >
            <Head title="รวมรายงาน" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* <div className="mb-4">
                        <button
                            onClick={goBack}
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                        >
                            ← กลับไปหน้า Dashboard
                        </button>
                    </div>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">ศูนย์รวมรายงาน</h1>
                        <p className="text-gray-600">เลือกประเภทรายงานที่ต้องการตรวจสอบข้อมูล</p>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* ถ้ามี Sub Menus ให้แสดงเป็น Card */}
                        {sub_menus.length > 0 ? (
                            sub_menus.map((menu) => (
                                <Link
                                    key={menu.id}
                                    href={route(menu.route_name)}
                                    className={`p-6 rounded-xl transition-all duration-200 border border-transparent hover:shadow-lg ${menu.color_class}`}
                                >
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white shadow-sm`}>
                                        <span className={`text-2xl ${menu.icon_color}`}>
                                            {/* ปรับ Icon ตาม icon_type ของคุณ */}
                                            📊
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{menu.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
                                </Link>
                            ))
                        ) : (
                            // Default Card กรณีที่ต้องการ Hardcode หรือยังไม่มีข้อมูลจาก DB
                            <Link
                                href={route('admin.reports.fgf')}
                                className="p-6 rounded-xl bg-pink-50 hover:bg-pink-100 transition-all border border-pink-100 hover:shadow-md"
                            >
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white text-pink-500">
                                    📁
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">รายงาน FGF</h3>
                                <p className="text-sm text-gray-600 mt-1">ดูรายละเอียดและสถิติของข้อมูล FGF</p>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}