import React, { useEffect, useMemo, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AdminLayout from '@/Layouts/AdminLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionKey = 'can_read' | 'can_create' | 'can_update' | 'can_delete';

interface ActionSet {
    can_read: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
}

interface MenuData {
    id: number;
    title: string;
    description: string;
    parent_id: number | null;
}

interface MenuTree extends MenuData {
    children: MenuData[];
}

interface FormData {
    role: string;
    permissions: Record<number, ActionSet>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_ACTIONS: ActionSet = {
    can_read: false, can_create: false, can_update: false, can_delete: false,
};

const ACTION_CONFIG: { key: ActionKey; label: string; activeClass: string }[] = [
    { key: 'can_read',   label: 'อ่าน',  activeClass: 'bg-blue-600 border-blue-600 text-white' },
    { key: 'can_create', label: 'สร้าง', activeClass: 'bg-emerald-600 border-emerald-600 text-white' },
    { key: 'can_update', label: 'แก้ไข', activeClass: 'bg-amber-500 border-amber-500 text-white' },
    { key: 'can_delete', label: 'ลบ',   activeClass: 'bg-rose-600 border-rose-600 text-white' },
];

// ─── Sub Components ───────────────────────────────────────────────────────────

const ActionBadge = ({
    cfg, checked, onClick,
}: {
    cfg: typeof ACTION_CONFIG[0];
    checked: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all select-none ${
            checked
                ? cfg.activeClass
                : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
        }`}
    >
        {cfg.label}
    </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserPermissions({
    auth, targetUser, menus, currentPermissions, availableRoles, rolePermissionsMap,
}: any) {
    const isFirstRender = useRef(true);

    const { data, setData, post, processing } = useForm<FormData>({
        role: targetUser.role || 'staff',
        permissions: currentPermissions || {},
    });

    // สร้าง Tree จาก flat list
    const menuTree = useMemo<MenuTree[]>(() => {
        const parents: MenuData[] = menus.filter((m: MenuData) => !m.parent_id);
        return parents.map((p: MenuData) => ({
            ...p,
            children: menus.filter((c: MenuData) => c.parent_id === p.id),
        }));
    }, [menus]);

    // เมื่อเปลี่ยน Role → autofill ด้วย permissions ของ Role นั้น
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        setData('permissions', rolePermissionsMap?.[data.role] ?? {});
    }, [data.role]);

    const handleToggle = (menuId: number, key: ActionKey) => {
        const current = data.permissions[menuId] ?? { ...EMPTY_ACTIONS };
        setData('permissions', {
            ...data.permissions,
            [menuId]: { ...current, [key]: !current[key] },
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.permissions.update', targetUser.id), {
            onSuccess: () => {
                Swal.fire('สำเร็จ', 'อัปเดตสิทธิ์และบทบาทเรียบร้อย', 'success');
                router.visit(route('admin.users.index'));
            },
        });
    };

    const filteredRoles = availableRoles.filter((role: string) =>
        !(auth.user.role !== 'super_admin' && role === 'super_admin')
    );

    const isLocked = data.role === 'super_admin';

    // ─── Row Component ───────────────────────────────────────────────────────

    const MenuRow = ({ menu, depth = 0 }: { menu: MenuData; depth?: number }) => {
        const actions = data.permissions[menu.id] ?? EMPTY_ACTIONS;
        return (
            <div className={`flex items-center justify-between py-2.5 px-4 ${depth > 0 ? 'pl-10 bg-gray-50/60' : ''}`}>
                <div className="flex items-center gap-2 min-w-0">
                    {depth > 0 && <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />}
                    <div className="min-w-0">
                        <p className={`font-semibold truncate ${depth > 0 ? 'text-gray-600 text-sm' : 'text-gray-900 text-sm'}`}>
                            {menu.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    {ACTION_CONFIG.map(cfg => (
                        <ActionBadge
                            key={cfg.key}
                            cfg={cfg}
                            checked={actions[cfg.key]}
                            onClick={() => !isLocked && handleToggle(menu.id, cfg.key)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // ─── Render ──────────────────────────────────────────────────────────────

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
                    จัดการสิทธิ์: {targetUser.name}
                </h2>
            </div>
        }>
            <Head title="User Permissions" />
            <div className="max-w-4xl mx-auto px-4">
                <form onSubmit={submit} className="space-y-6">

                    {/* Role Selector */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">บทบาทผู้ใช้งาน (Role)</label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {filteredRoles.map((role: string) => (
                                <option key={role} value={role}>{role.replace('_', ' ')}</option>
                            ))}
                        </select>
                        {auth.user.role === 'super_admin' && (
                            <p className="mt-2 text-xs text-gray-400 italic">
                                * Super Admin เข้าถึงได้ทุกเมนูโดยอัตโนมัติ
                            </p>
                        )}
                    </div>

                    {/* Menu Permissions */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

                        {/* Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                            <h3 className="font-bold text-gray-700">สิทธิ์การเข้าถึงเมนู</h3>
                            <div className="flex items-center gap-1.5">
                                {isLocked
                                    ? <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium">Super Admin เข้าถึงได้ทุกเมนู</span>
                                    : ACTION_CONFIG.map(cfg => (
                                        <span key={cfg.key} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.activeClass}`}>
                                            {cfg.label}
                                        </span>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Menu List */}
                        <div className={`divide-y divide-gray-100 ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
                            {menuTree.map(parent => (
                                <div key={parent.id}>
                                    <MenuRow menu={parent} depth={0} />
                                    {parent.children.map(child => (
                                        <div key={child.id} className="border-t border-gray-100">
                                            <MenuRow menu={child} depth={1} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-5 bg-gray-50 border-t flex gap-3">
                            <Link
                                href={route('admin.users.index')}
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
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
