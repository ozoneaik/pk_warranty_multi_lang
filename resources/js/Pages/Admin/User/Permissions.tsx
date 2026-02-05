import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { ArrowLeft, ShieldCheck } from 'lucide-react'; // นำเข้า Icon เพื่อความสวยงาม

interface PermissionForm {
    permissions: Record<string, number[]>;
}

export default function Permissions({ roles, menus, currentPermissions }: any) {

    const initialPermissions = roles.reduce((acc: Record<string, number[]>, role: string) => {
        acc[role] = Array.isArray(currentPermissions[role]) ? currentPermissions[role] : [];
        return acc;
    }, {} as Record<string, number[]>);

    const { data, setData, post, processing } = useForm<PermissionForm>({
        permissions: initialPermissions
    });

    const handleCheck = (role: string, menuId: number) => {
        const currentRolePerms = data.permissions[role] || [];
        const isExist = currentRolePerms.includes(menuId);

        let newSelection = isExist
            ? currentRolePerms.filter(id => id !== menuId)
            : [...currentRolePerms, menuId];

        setData('permissions', {
            ...data.permissions,
            [role]: newSelection
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.permissions.update'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'สำเร็จ',
                    text: 'บันทึกการตั้งค่าสิทธิ์เริ่มต้นของแต่ละบทบาทเรียบร้อย',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h2 className="font-bold text-xl text-gray-800">จัดการสิทธิ์ตามบทบาท</h2>
                            <p className="text-sm text-gray-500">กำหนดค่าเริ่มต้นสำหรับ Admin และ Staff</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Role Permissions" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-6 font-bold text-gray-600 w-1/3">เมนูระบบ</th>
                                        {roles.map((role: string) => (
                                            <th key={role} className="p-6 text-center">
                                                <span className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest">
                                                    {role}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {menus.map((menu: any) => (
                                        <tr key={menu.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all text-gray-500">
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{menu.title}</div>
                                                        <div className="text-xs text-gray-400 font-mono italic">{menu.route_name || 'No route'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {roles.map((role: string) => (
                                                <td key={role} className="p-6 text-center">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={data.permissions[role]?.includes(menu.id)}
                                                            onChange={() => handleCheck(role, menu.id)}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                    </label>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-500">
                                <span className="font-bold text-indigo-600">หมายเหตุ:</span> สิทธิ์ที่ตั้งค่าตรงนี้เป็นเพียงสิทธิ์เริ่มต้น (Default) คุณยังสามารถปรับเปลี่ยนรายบุคคลได้ที่หน้าจัดการผู้ใช้
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full md:w-auto px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
                            >
                                {processing ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าสิทธิ์'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}