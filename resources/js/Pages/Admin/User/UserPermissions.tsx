// resources/js/Pages/Admin/User/UserPermissions.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AdminLayout from '@/Layouts/AdminLayout';

interface MenuData {
    id: number;
    title: string;
    description: string;
    parent_id: number | null;
}

interface MenuTree extends MenuData {
    children: MenuData[];
}

interface UserPermissionsData {
    role: string;
    menu_ids: number[];
}

export default function UserPermissions({ auth, targetUser, menus, currentPermissions, availableRoles, rolePermissionsMap }: any) {

    const isFirstRender = useRef(true);

    const { data, setData, post, processing } = useForm<UserPermissionsData>({
        role: targetUser.role || 'staff',
        menu_ids: currentPermissions || []
    });

    // จัดโครงสร้างเมนูเป็น Tree (parent → children)
    const menuTree = useMemo<MenuTree[]>(() => {
        const parents: MenuData[] = menus.filter((m: MenuData) => !m.parent_id);
        return parents.map((p: MenuData) => ({
            ...p,
            children: menus.filter((c: MenuData) => c.parent_id === p.id)
        }));
    }, [menus]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (rolePermissionsMap && rolePermissionsMap[data.role]) {
            setData('menu_ids', rolePermissionsMap[data.role]);
        }
    }, [data.role]);

    const handleToggle = (menuId: number) => {
        const newSelection: number[] = data.menu_ids.includes(menuId)
            ? data.menu_ids.filter((id: number) => id !== menuId)
            : [...data.menu_ids, menuId];
        setData('menu_ids', newSelection);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.permissions.update', targetUser.id), {
            onSuccess: () => {
                Swal.fire('สำเร็จ', 'อัปเดตสิทธิ์และบทบาทเรียบร้อย', 'success');
                router.visit(route('admin.users.index'));
            }
        });
    };

    const filteredRoles = availableRoles.filter((role: string) => {
        if (auth.user.role !== 'super_admin' && role === 'super_admin') return false;
        return true;
    });

    const isLocked = data.role === 'super_admin';

    const ToggleCircle = ({ checked }: { checked: boolean }) => (
        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
            {checked && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            )}
        </div>
    );

    return (
        <AdminLayout header={
            <div className="flex items-center space-x-4">
                <Link
                    href={route('admin.users.index') as string}
                    className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
                    title="ย้อนกลับ"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    จัดการสิทธิ์และบทบาท: {targetUser.name}
                </h2>
            </div>
        }>
            <Head title="User Permissions" />
            <div className="py-0 max-w-7xl mx-auto px-4">
                <form onSubmit={submit} className="space-y-6">

                    {/* ส่วนที่ 1: เลือก Role */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">บทบาทผู้ใช้งาน (Role)</label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {filteredRoles.map((role: string) => (
                                <option key={role} value={role} className="capitalize">
                                    {role.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                        {auth.user.role === 'super_admin' && (
                            <p className="mt-2 text-xs text-gray-500 italic">
                                * Super Admin จะเข้าถึงได้ทุกเมนูโดยอัตโนมัติ
                            </p>
                        )}
                    </div>

                    {/* ส่วนที่ 2: เลือกเมนู */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
                            <h3 className="font-bold text-gray-700">รายการเมนูที่อนุญาตให้เข้าถึง</h3>
                            {isLocked && (
                                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium">
                                    Super Admin เข้าถึงได้ทุกเมนู
                                </span>
                            )}
                        </div>

                        <div className={`p-3 space-y-2 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                            {menuTree.map((parent) => (
                                <div key={parent.id} className="rounded-xl border border-gray-100 overflow-hidden">

                                    {/* เมนูหลัก (Parent) */}
                                    <div
                                        onClick={() => handleToggle(parent.id)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{parent.title}</p>
                                            {parent.description && (
                                                <p className="text-xs text-gray-400 mt-0.5">{parent.description}</p>
                                            )}
                                        </div>
                                        <ToggleCircle checked={data.menu_ids.includes(parent.id)} />
                                    </div>

                                    {/* เมนูย่อย (Children) */}
                                    {parent.children.length > 0 && (
                                        <div className="bg-gray-50/60 border-t border-gray-100 divide-y divide-gray-100">
                                            {parent.children.map((child) => (
                                                <div
                                                    key={child.id}
                                                    onClick={() => handleToggle(child.id)}
                                                    className="flex items-center justify-between px-4 py-2.5 pl-10 hover:bg-indigo-50/60 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-700 font-medium">{child.title}</p>
                                                            {child.description && (
                                                                <p className="text-xs text-gray-400">{child.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ToggleCircle checked={data.menu_ids.includes(child.id)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex gap-3">
                            <Link
                                href={route('admin.users.index')}
                                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                            >
                                {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
