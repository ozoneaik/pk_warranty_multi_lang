import React, { useState, useMemo, useEffect, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, UserCircle } from 'lucide-react'; // เพิ่ม Icon สำหรับแถบบน
import ApplicationLogo from '@/Components/ApplicationLogo';

// Interface ของเมนู
export interface MenuData {
    id: number;
    title: string;
    description: string;
    icon_type: string;
    route_name: string;
    color_class: string;
    icon_color: string;
    is_active: boolean;
    parent_id?: number | null;
    children?: MenuData[];
}

// Icon Component
const MenuIcon = ({ type, className }: { type: string; className: string }) => {
    switch (type) {
        case 'user': return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case 'product': return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
        case 'point': return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'report': case 'sub_report': return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case 'reward': case 'sub_reward': return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
        default: return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
    }
};

export default function AdminLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    // ใช้ usePage ดึงข้อมูล Global Props 
    const { auth, menus } = usePage<any>().props;
    const { url } = usePage();

    const [openMenus, setOpenMenus] = useState<number[]>([]);

    const toggleMenu = (id: number) => {
        setOpenMenus((prev) =>
            prev.includes(id) ? prev.filter((menuId) => menuId !== id) : [...prev, id]
        );
    };

    // 🌟 ระบบ Auto-Expand: กางเมนูที่ตรงกับ URL อัตโนมัติ
    useEffect(() => {
        if (!menus) return;

        const activeMenus = menus.filter((menu: MenuData) => menu.is_active);

        const activeMenu = activeMenus.find((m: MenuData) => {
            if (!m.route_name) return false;
            try {
                return url.startsWith(route(m.route_name, undefined, false));
            } catch (error) {
                return false;
            }
        });

        if (activeMenu && activeMenu.parent_id) {
            setOpenMenus((prev) => {
                if (!prev.includes(activeMenu.parent_id!)) {
                    return [...prev, activeMenu.parent_id!];
                }
                return prev;
            });
        }
    }, [url, menus]);

    // แปลงข้อมูลแบนให้เป็น Tree
    const menuTree = useMemo(() => {
        if (!menus || !Array.isArray(menus)) return [];

        const map = new Map<number, MenuData>();
        const tree: MenuData[] = [];

        // 1. นำเมนูทั้งหมดมาใส่ Map และเตรียม array children ให้ว่าง
        menus.forEach((menu: MenuData) => {
            if (menu.is_active) {
                map.set(menu.id, { ...menu, children: [] });
            }
        });

        // 2. จัดโครงสร้าง Tree
        menus.forEach((menu: MenuData) => {
            if (menu.is_active) {
                const currentItem = map.get(menu.id);
                if (menu.parent_id && map.has(menu.parent_id)) {
                    // ถ้ามี parent ให้เอาตัวเองไปใส่ใน children ของ parent
                    map.get(menu.parent_id)!.children!.push(currentItem!);
                } else if (!menu.parent_id) {
                    // ถ้าไม่มี parent ให้ถือเป็นเมนูหลัก (Root)
                    tree.push(currentItem!);
                }
            }
        });

        return tree;
    }, [menus]);

    return (
        // ปรับเป็น h-screen เพื่อล็อกความสูงหน้าจอ และซ่อนส่วนที่ล้นออก
        <div className="flex h-screen bg-gray-50 overflow-hidden font-prompt">

            {/* ---------- ซ้าย: Sidebar ---------- */}
            <aside className="w-[280px] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 flex flex-col z-20 flex-shrink-0">

                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-orange-600">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        <span className="text-xl font-black tracking-wider">Admin<span className="text-gray-800">Panel</span></span>
                    </div>
                </div>

                {/* Menus (Scrollable) */}
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">
                        เมนูจัดการระบบ
                    </h3>
                    <nav className="space-y-1">
                        {menuTree.map((menu) => {
                            const isParentOpen = openMenus.includes(menu.id);
                            return (
                                <div key={menu.id}>
                                    {menu.children && menu.children.length > 0 ? (
                                        <>
                                            {/* เมนูหลักแบบมี Dropdown */}
                                            <button
                                                onClick={() => toggleMenu(menu.id)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all focus:outline-none group"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`transition-transform group-hover:scale-110`}>
                                                        <MenuIcon type={menu.icon_type} className={`h-5 w-5 ${menu.icon_color}`} />
                                                    </div>
                                                    <span className="font-semibold text-sm">{menu.title}</span>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isParentOpen ? 'rotate-180 text-indigo-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* รายการเมนูย่อย */}
                                            <div className={`grid transition-all duration-200 ease-in-out ${isParentOpen ? 'grid-rows-[1fr] opacity-100 mt-1 mb-2' : 'grid-rows-[0fr] opacity-0'}`}>
                                                <div className="overflow-hidden">
                                                    <div className="ml-9 border-l-2 border-gray-100 pl-3 space-y-1 py-1">
                                                        {menu.children.map((child) => (
                                                            <Link
                                                                key={child.id}
                                                                href={route(child.route_name)}
                                                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${url.startsWith(route(child.route_name, undefined, false))
                                                                    ? 'text-indigo-700 bg-indigo-50/50'
                                                                    : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {/* จุดกลมบอกสถานะ Active */}
                                                                {url.startsWith(route(child.route_name, undefined, false)) && (
                                                                    <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                                                )}
                                                                {child.title}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* เมนูเดี่ยว ไม่มี Dropdown */
                                        <Link
                                            href={route(menu.route_name)}
                                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group ${url.startsWith(route(menu.route_name, undefined, false))
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 font-semibold text-sm'
                                                }`}
                                        >
                                            <div className={`transition-transform group-hover:scale-110 ${url.startsWith(route(menu.route_name, undefined, false)) ? '' : 'text-gray-400'}`}>
                                                <MenuIcon type={menu.icon_type} className={`h-5 w-5 ${url.startsWith(route(menu.route_name, undefined, false)) ? menu.icon_color : ''}`} />
                                            </div>
                                            <span>{menu.title}</span>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* ---------- ขวา: Main Wrapper ---------- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* แถบ Top Navbar (แทนที่ของเดิมใน AuthenticatedLayout) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-6 z-10 flex-shrink-0">
                    <div className="flex-1">
                        {/* เรนเดอร์ Header prop (เช่น ปุ่มย้อนกลับ และชื่อหน้า) ตรงนี้ */}
                        {header}
                    </div>

                    {/* ข้อมูลผู้ใช้งานฝั่งขวา */}
                    <div className="flex items-center gap-2 pl-4 border-l border-gray-200 ml-4">

                        {/* ลิงก์ไปยังหน้า Profile */}
                        <Link
                            href={route('admin.profile.edit')}
                            className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-all group"
                        >
                            <div className="relative">
                                <UserCircle className="w-9 h-9 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                {/* จุดสีเขียวบอกสถานะออนไลน์ (Optional) */}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="font-bold text-gray-700 leading-none group-hover:text-indigo-600 transition-colors">
                                    {auth?.user?.name || 'Admin User'}
                                </p>
                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                    {auth?.user?.role || 'Administrator'}
                                </p>
                            </div>
                        </Link>

                        {/* ปุ่มออกจากระบบ */}
                        <Link
                            href={route('admin.logout')}
                            method="post"
                            as="button"
                            className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="ออกจากระบบ"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                {/* ---------- พื้นที่ Content โชว์ข้อมูล ---------- */}
                {/* overflow-y-auto คือการให้ Content scroll ได้อิสระ ไม่ดึง Sidebar ตามลงไป */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-8xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>

            {/* CSS เสริมสำหรับ Scrollbar ให้ดูสวยขึ้น */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}} />
        </div>
    );
}