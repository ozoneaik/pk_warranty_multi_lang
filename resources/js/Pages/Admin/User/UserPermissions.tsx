// resources/js/Pages/Admin/User/UserPermissions.tsx
import React, { useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface UserPermissionsData {
    role: string;
    menu_ids: number[];
}

export default function UserPermissions({ auth, targetUser, menus, currentPermissions, availableRoles, rolePermissionsMap }: any) {

    const isFirstRender = useRef(true);

    // เพิ่ม field 'role' ใน useForm
    const { data, setData, post, processing } = useForm<UserPermissionsData>({
        role: targetUser.role || 'staff',
        menu_ids: currentPermissions || []
    });

    useEffect(() => {
        // ถ้าเป็นการโหลดครั้งแรก ให้ข้ามการทำงานในนี้ไปก่อน 
        // เพื่อให้ menu_ids ใช้ค่าที่ส่งมาจาก Controller (currentPermissions)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // ถ้ามีการเปลี่ยน Role จริงๆ (หลังจากโหลดหน้าเสร็จแล้ว)
        if (rolePermissionsMap && rolePermissionsMap[data.role]) {
            const defaultMenuIds = rolePermissionsMap[data.role];
            setData('menu_ids', defaultMenuIds);
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
        if (auth.user.role !== 'super_admin' && role === 'super_admin') {
            return false;
        }
        return true;
    });

    return (
        <AuthenticatedLayout header={
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
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">จัดการสิทธิ์และบทบาท: {targetUser.name}</h2>
            </div>
        }>
            <Head title="User Permissions" />
            <div className="py-12 max-w-2xl mx-auto px-4">
                <form onSubmit={submit} className="space-y-6">

                    {/* ส่วนที่ 1: เลือกบทบาท (Role) */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">บทบาทผู้ใช้งาน (Role)</label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {/* 3. ใช้ filteredRoles แทน availableRoles เดิม */}
                            {filteredRoles.map((role: string) => (
                                <option key={role} value={role} className="capitalize">
                                    {role.replace('_', ' ')}
                                </option>
                            ))}
                        </select>

                        {/* แสดงข้อความเตือนเฉพาะ super_admin เท่านั้น */}
                        {auth.user.role === 'super_admin' && (
                            <p className="mt-2 text-xs text-gray-500 italic">
                                * Super Admin จะเข้าถึงได้ทุกเมนูโดยอัตโนมัติ
                            </p>
                        )}
                    </div>

                    {/* ส่วนที่ 2: เลือกเมนู (Permissions) */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-gray-50 border-b">
                            <h3 className="font-bold text-gray-700">รายการเมนูที่อนุญาตให้เข้าถึง</h3>
                        </div>

                        {/* ปิดการเลือกเมนูถ้าเป็น Super Admin เพราะได้ทุกอย่างอยู่แล้ว */}
                        <div className={`p-2 ${data.role === 'super_admin' ? 'opacity-50 pointer-events-none' : ''}`}>
                            {menus.map((menu: any) => (
                                <div
                                    key={menu.id}
                                    onClick={() => handleToggle(menu.id)}
                                    className="flex items-center justify-between p-4 hover:bg-indigo-50 cursor-pointer rounded-lg transition-colors"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">{menu.title}</p>
                                        <p className="text-xs text-gray-500">{menu.description}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${data.menu_ids.includes(menu.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                        {data.menu_ids.includes(menu.id) && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex gap-3">
                            <Link href={route('admin.users.index')} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-600">ยกเลิก</Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md"
                            >
                                {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}