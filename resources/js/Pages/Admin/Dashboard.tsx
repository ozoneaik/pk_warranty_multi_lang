import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface MenuData {
    id: number;
    title: string;
    description: string;
    icon_type: string;
    route_name: string;
    color_class: string;
    icon_color: string;
    is_active: boolean;
}

// Component สำหรับแยกประเภท Icon ตาม icon_type ใน Database
const MenuIcon = ({ type, className }: { type: string; className: string }) => {
    switch (type) {
        case 'user':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            );
        case 'product':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            );
        case 'point':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        default:
            return ( // Default icon if not matched
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            );
    }
};

export default function AdminDashboard({ auth, menus }: { auth: any; menus: MenuData[] }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">ยินดีต้อนรับ, {auth.user.name}</h3>
                        <p className="text-gray-600 mt-1">จัดการระบบ Pumpkin Privilege ผ่านเมนูควบคุมด้านล่าง</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {menus
                            .filter(menu => menu.is_active)
                            .map((menu) => (
                                <Link
                                    key={menu.id}
                                    href={route(menu.route_name)}
                                    className="group relative block p-8 rounded-2xl shadow-sm border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                                >
                                    <div className="flex items-start space-x-5">
                                        {/* Icon Container */}
                                        <div className={`p-4 rounded-xl transition-colors duration-300 ${menu.color_class}`}>
                                            <MenuIcon
                                                type={menu.icon_type}
                                                className={`h-9 w-9 ${menu.icon_color}`}
                                            />
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1">
                                            <h4 className="text-xl font-extrabold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                {menu.title}
                                            </h4>
                                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                                {menu.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow Indicator */}
                                    <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}