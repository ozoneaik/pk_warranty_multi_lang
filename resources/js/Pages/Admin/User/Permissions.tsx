import React, { useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { ShieldCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionKey = 'can_read' | 'can_create' | 'can_update' | 'can_delete';

interface ActionSet {
    can_read: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
}

interface PermissionForm {
    permissions: Record<string, Record<number, ActionSet>>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_ACTIONS: ActionSet = {
    can_read: false, can_create: false, can_update: false, can_delete: false,
};

const ACTION_CONFIG: { key: ActionKey; label: string; activeClass: string; headerClass: string }[] = [
    { key: 'can_read',   label: 'อ่าน',  activeClass: 'bg-blue-600 border-blue-600 text-white',    headerClass: 'text-blue-600' },
    { key: 'can_create', label: 'สร้าง', activeClass: 'bg-emerald-600 border-emerald-600 text-white', headerClass: 'text-emerald-600' },
    { key: 'can_update', label: 'แก้ไข', activeClass: 'bg-amber-500 border-amber-500 text-white',   headerClass: 'text-amber-600' },
    { key: 'can_delete', label: 'ลบ',   activeClass: 'bg-rose-600 border-rose-600 text-white',     headerClass: 'text-rose-600' },
];

// ─── Sub Components ───────────────────────────────────────────────────────────

const ActionToggle = ({
    cfg, checked, onChange,
}: {
    cfg: typeof ACTION_CONFIG[0];
    checked: boolean;
    onChange: () => void;
}) => (
    <button
        type="button"
        onClick={onChange}
        title={cfg.label}
        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
            checked ? cfg.activeClass : 'bg-white border-gray-200 text-gray-300 hover:border-gray-300'
        }`}
    >
        {cfg.label[0]}
    </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Permissions({ roles, menus, currentPermissions }: any) {

    const initialPermissions = roles.reduce(
        (acc: Record<string, Record<number, ActionSet>>, role: string) => {
            acc[role] = currentPermissions[role] ?? {};
            return acc;
        },
        {}
    );

    const { data, setData, post, processing } = useForm<PermissionForm>({
        permissions: initialPermissions,
    });

    // สร้าง Tree จาก flat list
    const menuTree = useMemo(() => {
        const parents = menus.filter((m: any) => !m.parent_id);
        return parents.map((p: any) => ({
            ...p,
            children: menus.filter((c: any) => c.parent_id === p.id),
        }));
    }, [menus]);

    const handleToggle = (role: string, menuId: number, key: ActionKey) => {
        const rolePerms = data.permissions[role] ?? {};
        const menuActions = rolePerms[menuId] ?? { ...EMPTY_ACTIONS };
        setData('permissions', {
            ...data.permissions,
            [role]: {
                ...rolePerms,
                [menuId]: { ...menuActions, [key]: !menuActions[key] },
            },
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.permissions.update'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'สำเร็จ',
                    text: 'บันทึกการตั้งค่าสิทธิ์เรียบร้อยแล้ว',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
        });
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight">จัดการสิทธิ์ตามบทบาท</h2>
                    <p className="text-sm text-gray-500 font-normal mt-0.5">กำหนดสิทธิ์การเข้าถึงเมนูสำหรับแต่ละบทบาท (Role)</p>
                </div>
            }
        >
            <Head title="Role Permissions" />

            <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" style={{ minWidth: `${180 + roles.length * 200}px` }}>

                        {/* ─── Header ─── */}
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">
                                    เมนูระบบ
                                </th>
                                {roles.map((role: string) => (
                                    <th key={role} className="px-4 py-4 text-center">
                                        <span className="inline-block px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-2">
                                            {role}
                                        </span>
                                        {/* Column sub-headers */}
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            {ACTION_CONFIG.map(cfg => (
                                                <span key={cfg.key} className={`text-[10px] font-bold w-8 text-center ${cfg.headerClass}`}>
                                                    {cfg.label}
                                                </span>
                                            ))}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* ─── Body ─── */}
                        <tbody>
                            {menuTree.map((parent: any) => (
                                <React.Fragment key={parent.id}>
                                    {/* Parent Row */}
                                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 group-hover:text-indigo-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    <ShieldCheck className="h-4 w-4" />
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{parent.title}</span>
                                            </div>
                                        </td>
                                        {roles.map((role: string) => (
                                            <td key={role} className="px-4 py-3.5">
                                                <div className="flex items-center justify-center gap-1">
                                                    {ACTION_CONFIG.map(cfg => (
                                                        <ActionToggle
                                                            key={cfg.key}
                                                            cfg={cfg}
                                                            checked={data.permissions[role]?.[parent.id]?.[cfg.key] ?? false}
                                                            onChange={() => handleToggle(role, parent.id, cfg.key)}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Child Rows */}
                                    {parent.children.map((child: any) => (
                                        <tr key={child.id} className="border-b border-gray-50 bg-gray-50/30 hover:bg-indigo-50/20 transition-colors">
                                            <td className="px-6 py-3 pl-14">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600 font-medium">{child.title}</span>
                                                </div>
                                            </td>
                                            {roles.map((role: string) => (
                                                <td key={role} className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {ACTION_CONFIG.map(cfg => (
                                                            <ActionToggle
                                                                key={cfg.key}
                                                                cfg={cfg}
                                                                checked={data.permissions[role]?.[child.id]?.[cfg.key] ?? false}
                                                                onChange={() => handleToggle(role, child.id, cfg.key)}
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ─── Footer ─── */}
                <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-start gap-3 text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200 w-full md:w-auto shadow-sm">
                        <svg className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            <strong className="text-gray-700">หมายเหตุ:</strong> สิทธิ์ที่ตั้งค่าตรงนี้เป็นค่าเริ่มต้นของ Role — สามารถปรับรายบุคคลได้ที่หน้า <span className="underline decoration-indigo-300 underline-offset-2">จัดการผู้ใช้</span>
                        </span>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {processing ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าสิทธิ์'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
