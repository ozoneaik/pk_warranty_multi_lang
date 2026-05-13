// import React, { useMemo } from 'react';
// import AdminLayout from '@/Layouts/AdminLayout';
// import { Head, useForm } from '@inertiajs/react';
// import Swal from 'sweetalert2';
// import { ShieldCheck } from 'lucide-react';

// // ─── Types ────────────────────────────────────────────────────────────────────

// type ActionKey = 'can_read' | 'can_create' | 'can_update' | 'can_delete';

// interface ActionSet {
//     can_read: boolean;
//     can_create: boolean;
//     can_update: boolean;
//     can_delete: boolean;
// }

// interface PermissionForm {
//     permissions: Record<string, Record<number, ActionSet>>;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const EMPTY_ACTIONS: ActionSet = {
//     can_read: false, can_create: false, can_update: false, can_delete: false,
// };

// const ACTION_CONFIG: { key: ActionKey; label: string; activeClass: string; headerClass: string }[] = [
//     { key: 'can_read',   label: 'อ่าน',  activeClass: 'bg-blue-600 border-blue-600 text-white',    headerClass: 'text-blue-600' },
//     { key: 'can_create', label: 'สร้าง', activeClass: 'bg-emerald-600 border-emerald-600 text-white', headerClass: 'text-emerald-600' },
//     { key: 'can_update', label: 'แก้ไข', activeClass: 'bg-amber-500 border-amber-500 text-white',   headerClass: 'text-amber-600' },
//     { key: 'can_delete', label: 'ลบ',   activeClass: 'bg-rose-600 border-rose-600 text-white',     headerClass: 'text-rose-600' },
// ];

// // ─── Sub Components ───────────────────────────────────────────────────────────

// const ActionToggle = ({
//     cfg, checked, onChange,
// }: {
//     cfg: typeof ACTION_CONFIG[0];
//     checked: boolean;
//     onChange: () => void;
// }) => (
//     <button
//         type="button"
//         onClick={onChange}
//         title={cfg.label}
//         className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
//             checked ? cfg.activeClass : 'bg-white border-gray-200 text-gray-300 hover:border-gray-300'
//         }`}
//     >
//         {cfg.label[0]}
//     </button>
// );

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function Permissions({ roles, menus, currentPermissions }: any) {

//     const initialPermissions = roles.reduce(
//         (acc: Record<string, Record<number, ActionSet>>, role: string) => {
//             acc[role] = currentPermissions[role] ?? {};
//             return acc;
//         },
//         {}
//     );

//     const { data, setData, post, processing } = useForm<PermissionForm>({
//         permissions: initialPermissions,
//     });

//     // สร้าง Tree จาก flat list
//     const menuTree = useMemo(() => {
//         const parents = menus.filter((m: any) => !m.parent_id);
//         return parents.map((p: any) => ({
//             ...p,
//             children: menus.filter((c: any) => c.parent_id === p.id),
//         }));
//     }, [menus]);

//     const handleToggle = (role: string, menuId: number, key: ActionKey) => {
//         const rolePerms = data.permissions[role] ?? {};
//         const menuActions = rolePerms[menuId] ?? { ...EMPTY_ACTIONS };
//         setData('permissions', {
//             ...data.permissions,
//             [role]: {
//                 ...rolePerms,
//                 [menuId]: { ...menuActions, [key]: !menuActions[key] },
//             },
//         });
//     };

//     const submit = (e: React.FormEvent) => {
//         e.preventDefault();
//         post(route('admin.permissions.update'), {
//             onSuccess: () => {
//                 Swal.fire({
//                     title: 'สำเร็จ',
//                     text: 'บันทึกการตั้งค่าสิทธิ์เรียบร้อยแล้ว',
//                     icon: 'success',
//                     timer: 2000,
//                     showConfirmButton: false,
//                 });
//             },
//         });
//     };

//     // ─── Render ──────────────────────────────────────────────────────────────

//     return (
//         <AdminLayout
//             header={
//                 <div>
//                     <h2 className="font-bold text-2xl text-gray-800 leading-tight">จัดการสิทธิ์ตามบทบาท</h2>
//                     <p className="text-sm text-gray-500 font-normal mt-0.5">กำหนดสิทธิ์การเข้าถึงเมนูสำหรับแต่ละบทบาท (Role)</p>
//                 </div>
//             }
//         >
//             <Head title="Role Permissions" />

//             <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse" style={{ minWidth: `${180 + roles.length * 200}px` }}>

//                         {/* ─── Header ─── */}
//                         <thead className="bg-gray-50/80 border-b border-gray-100">
//                             <tr>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">
//                                     เมนูระบบ
//                                 </th>
//                                 {roles.map((role: string) => (
//                                     <th key={role} className="px-4 py-4 text-center">
//                                         <span className="inline-block px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-2">
//                                             {role}
//                                         </span>
//                                         {/* Column sub-headers */}
//                                         <div className="flex items-center justify-center gap-1 mt-1">
//                                             {ACTION_CONFIG.map(cfg => (
//                                                 <span key={cfg.key} className={`text-[10px] font-bold w-8 text-center ${cfg.headerClass}`}>
//                                                     {cfg.label}
//                                                 </span>
//                                             ))}
//                                         </div>
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>

//                         {/* ─── Body ─── */}
//                         <tbody>
//                             {menuTree.map((parent: any) => (
//                                 <React.Fragment key={parent.id}>
//                                     {/* Parent Row */}
//                                     <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
//                                         <td className="px-6 py-3.5">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 group-hover:text-indigo-500 group-hover:bg-white group-hover:shadow-sm transition-all">
//                                                     <ShieldCheck className="h-4 w-4" />
//                                                 </div>
//                                                 <span className="font-bold text-gray-900 text-sm">{parent.title}</span>
//                                             </div>
//                                         </td>
//                                         {roles.map((role: string) => (
//                                             <td key={role} className="px-4 py-3.5">
//                                                 <div className="flex items-center justify-center gap-1">
//                                                     {ACTION_CONFIG.map(cfg => (
//                                                         <ActionToggle
//                                                             key={cfg.key}
//                                                             cfg={cfg}
//                                                             checked={data.permissions[role]?.[parent.id]?.[cfg.key] ?? false}
//                                                             onChange={() => handleToggle(role, parent.id, cfg.key)}
//                                                         />
//                                                     ))}
//                                                 </div>
//                                             </td>
//                                         ))}
//                                     </tr>

//                                     {/* Child Rows */}
//                                     {parent.children.map((child: any) => (
//                                         <tr key={child.id} className="border-b border-gray-50 bg-gray-50/30 hover:bg-indigo-50/20 transition-colors">
//                                             <td className="px-6 py-3 pl-14">
//                                                 <div className="flex items-center gap-2">
//                                                     <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
//                                                     <span className="text-sm text-gray-600 font-medium">{child.title}</span>
//                                                 </div>
//                                             </td>
//                                             {roles.map((role: string) => (
//                                                 <td key={role} className="px-4 py-3">
//                                                     <div className="flex items-center justify-center gap-1">
//                                                         {ACTION_CONFIG.map(cfg => (
//                                                             <ActionToggle
//                                                                 key={cfg.key}
//                                                                 cfg={cfg}
//                                                                 checked={data.permissions[role]?.[child.id]?.[cfg.key] ?? false}
//                                                                 onChange={() => handleToggle(role, child.id, cfg.key)}
//                                                             />
//                                                         ))}
//                                                     </div>
//                                                 </td>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </React.Fragment>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* ─── Footer ─── */}
//                 <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
//                     <div className="flex items-start gap-3 text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200 w-full md:w-auto shadow-sm">
//                         <svg className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <span>
//                             <strong className="text-gray-700">หมายเหตุ:</strong> สิทธิ์ที่ตั้งค่าตรงนี้เป็นค่าเริ่มต้นของ Role — สามารถปรับรายบุคคลได้ที่หน้า <span className="underline decoration-indigo-300 underline-offset-2">จัดการผู้ใช้</span>
//                         </span>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={processing}
//                         className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {processing && (
//                             <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                             </svg>
//                         )}
//                         {processing ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าสิทธิ์'}
//                     </button>
//                 </div>
//             </form>
//         </AdminLayout>
//     );
// }

import React, { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconEye = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconPlus = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconPencil = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const IconTrash = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconSearch = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const IconLoader = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`${className} animate-spin`}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" /></svg>;

// ─── Types ────────────────────────────────────────────────────────────────────
type ActionKey = 'can_read' | 'can_create' | 'can_update' | 'can_delete';
interface ActionSet { can_read: boolean; can_create: boolean; can_update: boolean; can_delete: boolean; }
interface MenuData { id: number; title: string; description: string; parent_id: number | null; }
interface MenuTree extends MenuData { children: MenuData[]; }
interface PermissionForm { permissions: Record<string, Record<number, ActionSet>>; }

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_ACTIONS: ActionSet = { can_read: false, can_create: false, can_update: false, can_delete: false };
const MATRIX_CONFIG: { key: ActionKey; label: string; icon: any }[] = [
    { key: 'can_read', label: 'Read', icon: IconEye },
    { key: 'can_create', label: 'Create', icon: IconPlus },
    { key: 'can_update', label: 'Update', icon: IconPencil },
    { key: 'can_delete', label: 'Delete', icon: IconTrash },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Permissions({ roles, menus, currentPermissions }: any) {
    const [searchQuery, setSearchQuery] = useState('');

    const initialPermissions = roles.reduce((acc: Record<string, Record<number, ActionSet>>, role: string) => {
        acc[role] = currentPermissions[role] ?? {};
        return acc;
    }, {});

    const { data, setData, post, processing, isDirty } = useForm<PermissionForm>({
        permissions: initialPermissions,
    });

    // ─── Logic ───
    const filteredMenuTree = useMemo(() => {
        const parents = menus.filter((m: MenuData) => !m.parent_id);
        const tree = parents.map((p: MenuData) => ({
            ...p,
            children: menus.filter((c: MenuData) => c.parent_id === p.id),
        }));

        if (!searchQuery) return tree;
        const q = searchQuery.toLowerCase();
        return tree.map((parent: any) => {
            const matchParent = parent.title.toLowerCase().includes(q);
            const matchingChildren = parent.children.filter((c: any) => c.title.toLowerCase().includes(q));
            if (matchParent || matchingChildren.length > 0) {
                return { ...parent, children: matchingChildren.length > 0 ? matchingChildren : parent.children };
            }
            return null;
        }).filter(Boolean);
    }, [menus, searchQuery]);

    const handleToggle = (role: string, menuId: number, key: ActionKey) => {
        const rolePerms = data.permissions[role] ?? {};
        const menuActions = rolePerms[menuId] ?? { ...EMPTY_ACTIONS };
        setData('permissions', {
            ...data.permissions,
            [role]: { ...rolePerms, [menuId]: { ...menuActions, [key]: !menuActions[key] } },
        });
    };

    const handleBulkRole = (role: string, state: boolean) => {
        const newRolePerms: Record<number, ActionSet> = {};
        menus.forEach((m: MenuData) => {
            newRolePerms[m.id] = { can_read: state, can_create: state, can_update: state, can_delete: state };
        });
        setData('permissions', { ...data.permissions, [role]: newRolePerms });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.permissions.update'), {
            onSuccess: () => {
                Swal.fire({ title: 'Saved successfully', text: 'บันทึกการตั้งค่าสิทธิ์เรียบร้อยแล้ว', icon: 'success', timer: 2000, showConfirmButton: false });
            },
        });
    };

    // ─── Sub-Component ───
    const MatrixToggle = ({ checked, onChange, icon: Icon, label }: any) => (
        <button
            type="button"
            onClick={onChange}
            title={label}
            className={`
                flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-md border transition-all duration-200 flex-shrink-0
                hover:scale-105 active:scale-95
                ${checked 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white text-slate-300 border-slate-200 hover:border-slate-300 hover:text-slate-500 hover:bg-slate-50'
                }
            `}
        >
            <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </button>
    );

    // ─── Render ───
    return (
        <AdminLayout>
            <Head title="Role Permissions" />

            {/* ─── STICKY HEADER & ACTION BAR ─── */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                    <h1 className="font-bold text-lg md:text-xl text-slate-900">จัดการสิทธิ์ตามบทบาท (Role Permissions)</h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">กำหนดสิทธิ์การเข้าถึงเมนูสำหรับแต่ละบทบาท</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {isDirty && (
                        <span className="text-xs font-medium text-amber-600 flex justify-center items-center gap-1.5 animate-pulse bg-amber-50 px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-amber-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Unsaved Changes
                        </span>
                    )}
                    <button
                        onClick={submit}
                        disabled={!isDirty || processing}
                        className="w-full sm:w-auto justify-center px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {processing ? <IconLoader /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        บันทึกการตั้งค่าสิทธิ์
                    </button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    
                    {/* ─── TOOLBAR & SEARCH ─── */}
                    <div className="px-4 md:px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="ค้นหาเมนูระบบ..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border-slate-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            {MATRIX_CONFIG.map(cfg => (
                                <span key={cfg.key} className="flex items-center gap-1.5"><cfg.icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                            ))}
                        </div>
                    </div>

                    {/* ─── TABLE MATRIX ─── */}
                    <div className="overflow-x-auto pb-4 hide-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-[800px]">
                            <thead>
                                <tr>
                                    {/* Column: Menu Name (Sticky Left for Desktop & Mobile) */}
                                    <th className="sticky left-0 z-20 bg-white border-b border-r border-slate-200 px-3 md:px-5 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px] sm:w-[180px] md:w-[280px] shadow-[1px_0_0_0_#e2e8f0]">
                                        เมนูระบบ
                                    </th>
                                    
                                    {/* Columns: Roles */}
                                    {roles.map((role: string, index: number) => (
                                        <th key={role} className={`bg-slate-50 border-b border-slate-200 px-2 md:px-4 py-4 text-center min-w-[130px] md:min-w-[180px] ${index !== roles.length - 1 ? 'border-r' : ''}`}>
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="inline-block px-2 md:px-3.5 py-1 md:py-1.5 rounded-md bg-white text-slate-700 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-slate-200 shadow-sm whitespace-nowrap">
                                                    {role.replace('_', ' ')}
                                                </span>
                                                <div className="flex gap-1 md:gap-1.5 opacity-100 md:opacity-0 md:hover:opacity-100 focus-within:opacity-100 transition-opacity mt-1">
                                                    <button onClick={() => handleBulkRole(role, true)} type="button" className="text-[9px] md:text-[10px] bg-white border border-slate-200 px-1.5 py-1 md:px-2 md:py-1 rounded text-slate-600 hover:bg-slate-100 font-medium transition-colors">Check All</button>
                                                    <button onClick={() => handleBulkRole(role, false)} type="button" className="text-[9px] md:text-[10px] bg-white border border-slate-200 px-1.5 py-1 md:px-2 md:py-1 rounded text-slate-600 hover:bg-slate-100 font-medium transition-colors">Clear</button>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMenuTree.length === 0 ? (
                                    <tr>
                                        <td colSpan={roles.length + 1} className="py-12 text-center text-sm text-slate-500">
                                            ไม่พบเมนูที่ตรงกับ "{searchQuery}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMenuTree.map((parent: any) => (
                                        <React.Fragment key={parent.id}>
                                            {/* Parent Row */}
                                            <tr className="group">
                                                <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-b border-r border-slate-100 px-3 md:px-5 py-3 shadow-[1px_0_0_0_#f1f5f9] transition-colors w-[120px] sm:w-[180px] md:w-[280px]">
                                                    <span className="font-bold text-slate-900 text-[11px] md:text-sm flex items-center gap-1.5 md:gap-2 truncate">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 flex-shrink-0"></div>
                                                        <span className="truncate" title={parent.title}>{parent.title}</span>
                                                    </span>
                                                </td>
                                                {roles.map((role: string, index: number) => (
                                                    <td key={role} className={`border-b border-slate-100 px-2 md:px-4 py-2 group-hover:bg-slate-50/50 transition-colors ${index !== roles.length - 1 ? 'border-r' : ''}`}>
                                                        <div className="flex items-center justify-center gap-1 md:gap-1.5">
                                                            {MATRIX_CONFIG.map(cfg => (
                                                                <MatrixToggle
                                                                    key={cfg.key}
                                                                    icon={cfg.icon}
                                                                    label={cfg.label}
                                                                    checked={data.permissions[role]?.[parent.id]?.[cfg.key] ?? false}
                                                                    onChange={() => handleToggle(role, parent.id, cfg.key)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Child Rows */}
                                            {parent.children.map((child: any, childIdx: number) => {
                                                const isLastChild = childIdx === parent.children.length - 1;
                                                return (
                                                    <tr key={child.id} className="group">
                                                        <td className={`sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-r border-slate-100 px-3 md:px-5 py-2.5 shadow-[1px_0_0_0_#f1f5f9] transition-colors w-[120px] sm:w-[180px] md:w-[280px] ${isLastChild ? 'border-b' : ''}`}>
                                                            <div className="flex items-center gap-1.5 md:gap-3 pl-1 md:pl-2 overflow-hidden">
                                                                <div className="w-3 h-3 md:w-4 md:h-4 border-l-2 border-b-2 border-slate-200 rounded-bl-md -mt-2 md:-mt-3 flex-shrink-0" />
                                                                <span className="text-[10px] md:text-sm text-slate-600 font-medium truncate" title={child.title}>{child.title}</span>
                                                            </div>
                                                        </td>
                                                        {roles.map((role: string, index: number) => (
                                                            <td key={role} className={`px-2 md:px-4 py-2 group-hover:bg-slate-50/50 transition-colors ${isLastChild ? 'border-b border-slate-100' : ''} ${index !== roles.length - 1 ? 'border-r border-slate-100' : ''}`}>
                                                                <div className="flex items-center justify-center gap-1 md:gap-1.5">
                                                                    {MATRIX_CONFIG.map(cfg => (
                                                                        <MatrixToggle
                                                                            key={cfg.key}
                                                                            icon={cfg.icon}
                                                                            label={cfg.label}
                                                                            checked={data.permissions[role]?.[child.id]?.[cfg.key] ?? false}
                                                                            onChange={() => handleToggle(role, child.id, cfg.key)}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ─── FOOTER INFO ─── */}
                    <div className="bg-slate-50 border-t border-slate-200 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-slate-500 gap-4">
                        <div className="flex items-start md:items-center gap-2 bg-white px-3 py-2 md:px-4 md:py-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
                            <svg className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 md:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="leading-relaxed"><strong className="text-slate-700">หมายเหตุ:</strong> สิทธิ์ที่ตั้งค่าตรงนี้เป็นค่าเริ่มต้น สามารถปรับแต่งเป็นรายบุคคลได้ที่ <Link href={route('admin.users.index')} className="text-indigo-600 font-medium hover:underline">จัดการผู้ใช้</Link></span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* ซ่อน Scrollbar ของ Container บน Mobile เพื่อความคลีน (เสริม CSS) */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .hide-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9; 
                }
                .hide-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1; 
                    border-radius: 4px;
                }
                .hide-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; 
                }
            `}} />
        </AdminLayout>
    );
}