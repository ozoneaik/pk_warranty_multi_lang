// import React, { useEffect, useMemo, useRef } from 'react';
// import { Head, useForm, Link, router } from '@inertiajs/react';
// import Swal from 'sweetalert2';
// import AdminLayout from '@/Layouts/AdminLayout';

// // ─── Types ────────────────────────────────────────────────────────────────────

// type ActionKey = 'can_read' | 'can_create' | 'can_update' | 'can_delete';

// interface ActionSet {
//     can_read: boolean;
//     can_create: boolean;
//     can_update: boolean;
//     can_delete: boolean;
// }

// interface MenuData {
//     id: number;
//     title: string;
//     description: string;
//     parent_id: number | null;
// }

// interface MenuTree extends MenuData {
//     children: MenuData[];
// }

// interface FormData {
//     role: string;
//     permissions: Record<number, ActionSet>;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const EMPTY_ACTIONS: ActionSet = {
//     can_read: false, can_create: false, can_update: false, can_delete: false,
// };

// const ACTION_CONFIG: { key: ActionKey; label: string; activeClass: string }[] = [
//     { key: 'can_read',   label: 'อ่าน',  activeClass: 'bg-blue-600 border-blue-600 text-white' },
//     { key: 'can_create', label: 'สร้าง', activeClass: 'bg-emerald-600 border-emerald-600 text-white' },
//     { key: 'can_update', label: 'แก้ไข', activeClass: 'bg-amber-500 border-amber-500 text-white' },
//     { key: 'can_delete', label: 'ลบ',   activeClass: 'bg-rose-600 border-rose-600 text-white' },
// ];

// // ─── Sub Components ───────────────────────────────────────────────────────────

// const ActionBadge = ({
//     cfg, checked, onClick,
// }: {
//     cfg: typeof ACTION_CONFIG[0];
//     checked: boolean;
//     onClick: () => void;
// }) => (
//     <button
//         type="button"
//         onClick={onClick}
//         className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all select-none ${
//             checked
//                 ? cfg.activeClass
//                 : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
//         }`}
//     >
//         {cfg.label}
//     </button>
// );

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function UserPermissions({
//     auth, targetUser, menus, currentPermissions, availableRoles, rolePermissionsMap,
// }: any) {
//     const isFirstRender = useRef(true);

//     const { data, setData, post, processing } = useForm<FormData>({
//         role: targetUser.role || 'staff',
//         permissions: currentPermissions || {},
//     });

//     // สร้าง Tree จาก flat list
//     const menuTree = useMemo<MenuTree[]>(() => {
//         const parents: MenuData[] = menus.filter((m: MenuData) => !m.parent_id);
//         return parents.map((p: MenuData) => ({
//             ...p,
//             children: menus.filter((c: MenuData) => c.parent_id === p.id),
//         }));
//     }, [menus]);

//     // เมื่อเปลี่ยน Role → autofill ด้วย permissions ของ Role นั้น
//     useEffect(() => {
//         if (isFirstRender.current) { isFirstRender.current = false; return; }
//         setData('permissions', rolePermissionsMap?.[data.role] ?? {});
//     }, [data.role]);

//     const handleToggle = (menuId: number, key: ActionKey) => {
//         const current = data.permissions[menuId] ?? { ...EMPTY_ACTIONS };
//         setData('permissions', {
//             ...data.permissions,
//             [menuId]: { ...current, [key]: !current[key] },
//         });
//     };

//     const submit = (e: React.FormEvent) => {
//         e.preventDefault();
//         post(route('admin.users.permissions.update', targetUser.id), {
//             onSuccess: () => {
//                 Swal.fire('สำเร็จ', 'อัปเดตสิทธิ์และบทบาทเรียบร้อย', 'success');
//                 router.visit(route('admin.users.index'));
//             },
//         });
//     };

//     const filteredRoles = availableRoles.filter((role: string) =>
//         !(auth.user.role !== 'super_admin' && role === 'super_admin')
//     );

//     const isLocked = data.role === 'super_admin';

//     // ─── Row Component ───────────────────────────────────────────────────────

//     const MenuRow = ({ menu, depth = 0 }: { menu: MenuData; depth?: number }) => {
//         const actions = data.permissions[menu.id] ?? EMPTY_ACTIONS;
//         return (
//             <div className={`flex items-center justify-between py-2.5 px-4 ${depth > 0 ? 'pl-10 bg-gray-50/60' : ''}`}>
//                 <div className="flex items-center gap-2 min-w-0">
//                     {depth > 0 && <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />}
//                     <div className="min-w-0">
//                         <p className={`font-semibold truncate ${depth > 0 ? 'text-gray-600 text-sm' : 'text-gray-900 text-sm'}`}>
//                             {menu.title}
//                         </p>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
//                     {ACTION_CONFIG.map(cfg => (
//                         <ActionBadge
//                             key={cfg.key}
//                             cfg={cfg}
//                             checked={actions[cfg.key]}
//                             onClick={() => !isLocked && handleToggle(menu.id, cfg.key)}
//                         />
//                     ))}
//                 </div>
//             </div>
//         );
//     };

//     // ─── Render ──────────────────────────────────────────────────────────────

//     return (
//         <AdminLayout header={
//             <div className="flex items-center space-x-4">
//                 <Link
//                     href={route('admin.users.index') as string}
//                     className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
//                     title="ย้อนกลับ"
//                 >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                     </svg>
//                 </Link>
//                 <h2 className="font-semibold text-xl text-gray-800 leading-tight">
//                     จัดการสิทธิ์: {targetUser.name}
//                 </h2>
//             </div>
//         }>
//             <Head title="User Permissions" />
//             <div className="max-w-4xl mx-auto px-4">
//                 <form onSubmit={submit} className="space-y-6">

//                     {/* Role Selector */}
//                     <div className="bg-white rounded-xl shadow-sm border p-6">
//                         <label className="block text-sm font-bold text-gray-700 mb-2">บทบาทผู้ใช้งาน (Role)</label>
//                         <select
//                             value={data.role}
//                             onChange={e => setData('role', e.target.value)}
//                             className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
//                         >
//                             {filteredRoles.map((role: string) => (
//                                 <option key={role} value={role}>{role.replace('_', ' ')}</option>
//                             ))}
//                         </select>
//                         {auth.user.role === 'super_admin' && (
//                             <p className="mt-2 text-xs text-gray-400 italic">
//                                 * Super Admin เข้าถึงได้ทุกเมนูโดยอัตโนมัติ
//                             </p>
//                         )}
                        
//                         <div className="mt-4 flex items-start gap-3 text-sm text-blue-600 bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
//                             <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <div className="space-y-1">
//                                 <strong className="text-blue-700">ลำดับความสำคัญของสิทธิ์:</strong>
//                                 <p className="text-blue-600 leading-relaxed">
//                                     ระบบใช้ตรรกะแบบ <strong className="text-blue-800">"สิทธิ์รายบุคคลมีอำนาจเหนือ Role"</strong> หมายความว่าหากคุณมีการบันทึกสิทธิ์ในหน้านี้ ระบบจะยึดตามสิ่งที่คุณติ๊กไว้เป็นสำคัญ แม้ว่าบทบาท (Role) ของเขาจะมีสิทธิ์มากกว่าหรือน้อยกว่าก็ตาม 
//                                     <span className="block mt-1 text-xs italic text-blue-500">* หากต้องการกลับไปใช้ค่าเริ่มต้นตาม Role ให้เปลี่ยนบทบาทด้านบนอีกครั้งก่อนบันทึก</span>
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Menu Permissions */}
//                     <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

//                         {/* Header */}
//                         <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
//                             <h3 className="font-bold text-gray-700">สิทธิ์การเข้าถึงเมนู</h3>
//                             <div className="flex items-center gap-1.5">
//                                 {isLocked
//                                     ? <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium">Super Admin เข้าถึงได้ทุกเมนู</span>
//                                     : ACTION_CONFIG.map(cfg => (
//                                         <span key={cfg.key} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.activeClass}`}>
//                                             {cfg.label}
//                                         </span>
//                                     ))
//                                 }
//                             </div>
//                         </div>

//                         {/* Menu List */}
//                         <div className={`divide-y divide-gray-100 ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
//                             {menuTree.map(parent => (
//                                 <div key={parent.id}>
//                                     <MenuRow menu={parent} depth={0} />
//                                     {parent.children.map(child => (
//                                         <div key={child.id} className="border-t border-gray-100">
//                                             <MenuRow menu={child} depth={1} />
//                                         </div>
//                                     ))}
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Footer */}
//                         <div className="p-5 bg-gray-50 border-t flex gap-3">
//                             <Link
//                                 href={route('admin.users.index')}
//                                 className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
//                             >
//                                 ยกเลิก
//                             </Link>
//                             <button
//                                 type="submit"
//                                 disabled={processing}
//                                 className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
//                             >
//                                 {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูลทั้งหมด'}
//                             </button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </AdminLayout>
//     );
// }
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AdminLayout from '@/Layouts/AdminLayout';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconEye = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconPlus = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconPencil = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const IconTrash = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconSearch = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const IconLoader = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`${className} animate-spin`}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" /></svg>;
const IconShieldAlert = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// ─── Types ────────────────────────────────────────────────────────────────────
type ActionKey = 'can_read' | 'can_create' | 'can_update' | 'can_delete';
interface ActionSet { can_read: boolean; can_create: boolean; can_update: boolean; can_delete: boolean; }
interface MenuData { id: number; title: string; description: string; parent_id: number | null; }
interface MenuTree extends MenuData { children: MenuData[]; }
interface FormData { role: string; permissions: Record<number, ActionSet>; }

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_ACTIONS: ActionSet = { can_read: false, can_create: false, can_update: false, can_delete: false };
const MATRIX_CONFIG: { key: ActionKey; label: string; icon: any }[] = [
    { key: 'can_read', label: 'Read', icon: IconEye },
    { key: 'can_create', label: 'Create', icon: IconPlus },
    { key: 'can_update', label: 'Update', icon: IconPencil },
    { key: 'can_delete', label: 'Delete', icon: IconTrash },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserPermissions({
    auth, targetUser, menus, currentPermissions, availableRoles, rolePermissionsMap,
}: any) {
    const isFirstRender = useRef(true);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, isDirty } = useForm<FormData>({
        role: targetUser.role || 'staff',
        permissions: currentPermissions || {},
    });

    // ─── Logic ───
    const filteredMenuTree = useMemo<MenuTree[]>(() => {
        const parents: MenuData[] = menus.filter((m: MenuData) => !m.parent_id);
        const tree = parents.map((p: MenuData) => ({
            ...p,
            children: menus.filter((c: MenuData) => c.parent_id === p.id),
        }));

        if (!searchQuery) return tree;
        const q = searchQuery.toLowerCase();
        return tree.map(parent => {
            const matchParent = parent.title.toLowerCase().includes(q);
            const matchingChildren = parent.children.filter((c: { title: string; }) => c.title.toLowerCase().includes(q));
            if (matchParent || matchingChildren.length > 0) {
                return { ...parent, children: matchingChildren.length > 0 ? matchingChildren : parent.children };
            }
            return null;
        }).filter(Boolean) as MenuTree[];
    }, [menus, searchQuery]);

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

    const handleResetToRole = () => {
        setData('permissions', rolePermissionsMap?.[data.role] ?? {});
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.permissions.update', targetUser.id), {
            onSuccess: () => {
                Swal.fire({ title: 'Saved successfully', text: 'อัปเดตสิทธิ์ผู้ใช้งานเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#0f172a' });
                router.visit(route('admin.users.index'));
            },
        });
    };

    const filteredRoles = availableRoles.filter((role: string) =>
        !(auth.user.role !== 'super_admin' && role === 'super_admin')
    );

    const isLocked = data.role === 'super_admin';

    // ─── Sub-Component ───
    const MatrixToggle = ({ checked, onChange, icon: Icon, label, disabled }: any) => (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            title={label}
            className={`
                flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                ${checked 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white text-slate-300 border-slate-200 hover:border-slate-300 hover:text-slate-500 hover:bg-slate-50'
                }
            `}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <Head title={`Permissions - ${targetUser.name}`} />

            {/* ─── STICKY HEADER & ACTION BAR ─── */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.users.index')}
                        className="p-2 text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            จัดการสิทธิ์: <span className="text-indigo-600">{targetUser.name}</span>
                        </h1>
                        <p className="text-sm text-slate-500">{targetUser.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isDirty && !isLocked && (
                        <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5 animate-pulse bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Unsaved Changes
                        </span>
                    )}
                    <button
                        onClick={submit}
                        disabled={!isDirty || processing || isLocked}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {processing ? <IconLoader /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                
                {/* ─── ROLE SELECTOR CARD ─── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">บทบาทผู้ใช้งาน (Role)</label>
                        <select
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full border-slate-200 bg-slate-50 rounded-lg focus:ring-slate-900 focus:border-slate-900 text-sm font-medium transition-colors"
                        >
                            {filteredRoles.map((role: string) => (
                                <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-sm text-slate-600 flex items-start gap-3">
                            <IconShieldAlert className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="text-slate-800 block mb-1">สิทธิ์รายบุคคล (Individual Override)</strong>
                                ระบบจะใช้ตรรกะแบบ "สิทธิ์รายบุคคลมีอำนาจเหนือ Role" หากมีการปรับแต่งในหน้านี้ ระบบจะยึดตามที่บันทึกไว้เป็นสำคัญ
                                <button 
                                    type="button" 
                                    onClick={handleResetToRole}
                                    disabled={isLocked || !isDirty}
                                    className="block mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 disabled:opacity-40 disabled:no-underline"
                                >
                                    คลิกที่นี่เพื่อคืนค่าสิทธิ์ดั้งเดิมของบทบาท (Role Default)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── SUPER ADMIN STATE ─── */}
                {isLocked ? (
                    <div className="bg-slate-900 rounded-xl p-8 text-center shadow-lg border border-slate-800">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Super Admin Privileges</h3>
                        <p className="text-slate-400 max-w-md mx-auto text-sm">
                            ผู้ใช้งานที่มีบทบาทนี้ จะมีสิทธิ์เข้าถึงทุกระบบและทุกเมนูโดยอัตโนมัติ ไม่สามารถจำกัดหรือแก้ไขสิทธิ์รายบุคคลได้
                        </p>
                    </div>
                ) : (
                    
                /* ─── PERMISSION MATRIX ─── */
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    
                    {/* Toolbar & Search */}
                    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="relative w-full sm:w-72">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="ค้นหาเมนู..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border-slate-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900 transition-all bg-white"
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            {MATRIX_CONFIG.map(cfg => (
                                <span key={cfg.key} className="flex items-center gap-1.5"><cfg.icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                            ))}
                        </div>
                    </div>

                    {/* Matrix Body */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <tbody>
                                {filteredMenuTree.length === 0 ? (
                                    <tr>
                                        <td className="py-12 text-center text-slate-500">
                                            ไม่พบเมนูที่ตรงกับ "{searchQuery}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMenuTree.map((parent) => {
                                        const parentActions = data.permissions[parent.id] ?? EMPTY_ACTIONS;
                                        return (
                                            <React.Fragment key={parent.id}>
                                                {/* Parent Row */}
                                                <tr className="group">
                                                    <td className="bg-white group-hover:bg-slate-50/80 border-b border-slate-100 px-5 py-3 transition-colors">
                                                        <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                                                            {parent.title}
                                                        </span>
                                                    </td>
                                                    <td className="border-b border-slate-100 px-5 py-3 group-hover:bg-slate-50/80 transition-colors w-48">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {MATRIX_CONFIG.map(cfg => (
                                                                <MatrixToggle
                                                                    key={cfg.key}
                                                                    icon={cfg.icon}
                                                                    label={cfg.label}
                                                                    checked={parentActions[cfg.key]}
                                                                    onChange={() => handleToggle(parent.id, cfg.key)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Child Rows */}
                                                {parent.children.map((child, childIdx) => {
                                                    const childActions = data.permissions[child.id] ?? EMPTY_ACTIONS;
                                                    const isLastChild = childIdx === parent.children.length - 1;
                                                    return (
                                                        <tr key={child.id} className="group">
                                                            <td className={`bg-white group-hover:bg-slate-50/80 px-5 py-2.5 transition-colors ${isLastChild ? 'border-b border-slate-200' : ''}`}>
                                                                <div className="flex items-center gap-3 pl-2">
                                                                    <div className="w-4 h-4 border-l-2 border-b-2 border-slate-200 rounded-bl-md -mt-3 flex-shrink-0" />
                                                                    <span className="text-sm text-slate-600 font-medium truncate">{child.title}</span>
                                                                </div>
                                                            </td>
                                                            <td className={`px-5 py-2.5 group-hover:bg-slate-50/80 transition-colors ${isLastChild ? 'border-b border-slate-200' : ''}`}>
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    {MATRIX_CONFIG.map(cfg => (
                                                                        <MatrixToggle
                                                                            key={cfg.key}
                                                                            icon={cfg.icon}
                                                                            label={cfg.label}
                                                                            checked={childActions[cfg.key]}
                                                                            onChange={() => handleToggle(child.id, cfg.key)}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>
        </AdminLayout>
    );
}
