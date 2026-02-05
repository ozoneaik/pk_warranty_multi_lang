import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Gift, Settings, Calendar, Users, Award, Package, Info,
    Plus, Trash2, ArrowLeft, Save, Loader2, Image, Ticket, QrCode, Link as LinkIcon
} from 'lucide-react';

// --- Components (Reused Style) ---
const InfoTooltip = ({ text }: { text: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block ml-1 align-middle">
            <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                <Info className="w-4 h-4" />
            </button>
            {show && <div className="absolute z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-6 leading-relaxed">{text}<div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div></div>}
        </div>
    );
};

const ToggleSwitch = ({ label, checked, onChange, description = "" }: { label: string; checked: boolean; onChange: (val: boolean) => void; description?: string; }) => (
    <div className="flex items-start justify-between py-3">
        <div className="flex-1 pr-4">
            <label className="font-medium text-gray-700 text-sm cursor-pointer select-none" onClick={() => onChange(!checked)}>{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-purple-600' : 'bg-gray-200'}`}>
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// --- Types ---
interface CouponData {
    id: number;
    name: string;
    code: string | null;
    image_url: string | null;
    is_auto_generate_code?: boolean | number;
    member_group?: string[] | null;
    birth_month?: string | null;
    quota_limit_total?: number | string | null;
    quota_limit_user?: number | string | null;
    member_type?: string | null;
    is_link_traffic_source?: boolean | number;
    is_new_member_only?: boolean | number;
    is_auto_timer?: boolean | number;
    is_big_commerce?: boolean | number;
    discount_value?: number | string | null;
    discount_unit?: string | null;
    min_order_amount?: number | string | null;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    expiry_mode?: string | null;
    expiry_dynamic_value?: number | string | null;
    expiry_dynamic_unit?: string | null;
    is_expiry_notification?: boolean | number;
    show_in_new_member_menu?: boolean | number;
    qr_code_description?: string | null;
    external_link?: string | null;
    redeemed_channels?: string[] | null;
    is_active?: boolean | number;
    [key: string]: any;
}

interface CouponFormState {
    _method: string;
    name: string;
    code: string;
    is_auto_generate_code: boolean;
    member_group: string[];
    birth_month: string;
    quota_limit_total: string;
    quota_limit_user: string;
    member_type: string;
    is_link_traffic_source: boolean;
    is_new_member_only: boolean;
    is_auto_timer: boolean;
    is_big_commerce: boolean;
    discount_value: string;
    discount_unit: string;
    min_order_amount: string;
    image_file: File | null;
    description: string;
    start_date: string;
    end_date: string;
    expiry_mode: string;
    expiry_dynamic_value: string;
    expiry_dynamic_unit: string;
    is_expiry_notification: boolean;
    show_in_new_member_menu: boolean;
    qr_code_description: string;
    external_link: string;
    redeemed_channels: string[];
    is_active: boolean;
}

export default function CouponEdit({ coupon }: { coupon: CouponData }) {

    const formatDate = (dateString: string | null | undefined) => {
        return dateString ? dateString.substring(0, 16).replace(' ', 'T') : '';
    };

    const generateRandomCode = (length = 8) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const { data, setData, post, processing, errors } = useForm<CouponFormState>({
        _method: 'PUT',
        name: coupon.name || '',
        code: coupon.code || '',
        is_auto_generate_code: Boolean(coupon.is_auto_generate_code),
        member_group: Array.isArray(coupon.member_group) ? coupon.member_group : [],
        birth_month: coupon.birth_month || 'ALL',
        quota_limit_total: coupon.quota_limit_total ? String(coupon.quota_limit_total) : '',
        quota_limit_user: coupon.quota_limit_user ? String(coupon.quota_limit_user) : '',
        member_type: coupon.member_type || 'ALL',

        is_link_traffic_source: Boolean(coupon.is_link_traffic_source),
        is_new_member_only: Boolean(coupon.is_new_member_only),
        is_auto_timer: Boolean(coupon.is_auto_timer),
        is_big_commerce: Boolean(coupon.is_big_commerce),

        discount_value: coupon.discount_value ? String(coupon.discount_value) : '',
        discount_unit: coupon.discount_unit || 'BAHT',
        min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : '',

        image_file: null,
        description: coupon.description || '',

        start_date: formatDate(coupon.start_date),
        end_date: formatDate(coupon.end_date),
        expiry_mode: coupon.expiry_mode || 'DATE',
        expiry_dynamic_value: coupon.expiry_dynamic_value ? String(coupon.expiry_dynamic_value) : '',
        expiry_dynamic_unit: coupon.expiry_dynamic_unit || 'DAYS',
        is_expiry_notification: Boolean(coupon.is_expiry_notification),
        show_in_new_member_menu: Boolean(coupon.show_in_new_member_menu),

        qr_code_description: coupon.qr_code_description || '',
        external_link: coupon.external_link || '',
        redeemed_channels: Array.isArray(coupon.redeemed_channels) ? coupon.redeemed_channels : [],

        is_active: Boolean(coupon.is_active)
    });

    const handleSwitchChange = (field: keyof CouponFormState, value: boolean) => {
        let newData: any = { ...data, [field]: value };

        // Logic for Auto Generate Code (Edit Mode)
        if (field === 'is_auto_generate_code') {
            // ถ้าเปิด Auto และ Code ว่าง ให้ Gen ใหม่
            // ถ้ามี Code อยู่แล้ว ให้คงเดิม (หรือถ้าอยากให้ Gen ทับเลยก็เอา condition !data.code ออก)
            newData.code = value && !data.code ? generateRandomCode() : data.code;
        }
        setData(newData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.coupons.update', coupon.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`แก้ไขคูปอง: ${coupon.name}`} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 font-prompt pb-20">
                <div className="max-w-5xl mx-auto px-4 py-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Link href={route('admin.coupons.index')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                                    <ArrowLeft className="w-6 h-6" />
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">แก้ไขคูปอง</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 ml-14">
                            <div className="p-2 bg-yellow-500 rounded-lg shadow-sm">
                                <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-gray-600">แก้ไขข้อมูลคูปองส่วนลดและเงื่อนไขต่างๆ</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. Basic Info */}
                        <SectionCard title="ข้อมูลพื้นฐาน" icon={Settings}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อคูปอง <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="ระบุชื่อคูปอง..."
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รหัสคูปอง (Code) <span className="text-red-500">*</span></label>
                                    <div className="flex gap-3 items-start">
                                        <input
                                            type="text"
                                            value={data.code}
                                            disabled={data.is_auto_generate_code}
                                            onChange={e => setData('code', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 font-mono"
                                            placeholder="เช่น SUMMER2024"
                                        />
                                    </div>
                                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                </div>
                                <div className="flex items-end pb-3">
                                    <ToggleSwitch
                                        label="สุ่มรหัสอัตโนมัติ (Auto Generate)"
                                        checked={data.is_auto_generate_code}
                                        onChange={(val) => handleSwitchChange('is_auto_generate_code', val)}
                                    />
                                </div>
                            </div>

                            <hr className="border-gray-100 my-6" />

                            {/* Targeting */}
                            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">กลุ่มเป้าหมายและการจำกัดสิทธิ์</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">กลุ่มสมาชิก</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                        // Mock Logic for Single Select -> Array
                                        value={data.member_group.length > 0 ? data.member_group[0] : 'all'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('member_group', val === 'all' ? [] : [val]);
                                        }}
                                    >
                                        <option value="all">สมาชิกทั้งหมด</option>
                                        <option value="VIP">VIP</option>
                                        <option value="General">General</option>
                                        <option value="Wholesale">Wholesale</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">เดือนเกิด</label>
                                    <select
                                        value={data.birth_month}
                                        onChange={e => setData('birth_month', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                    >
                                        <option value="ALL">ทุกเดือน</option>
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i} value={String(i + 1)}>เดือน {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">จำกัดจำนวนสิทธิ์ (ทั้งหมด)</label>
                                    <input type="number" value={data.quota_limit_total} onChange={e => setData('quota_limit_total', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" placeholder="ไม่จำกัด ใส่ 0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">จำกัดจำนวนสิทธิ์ (ต่อคน)</label>
                                    <input type="number" value={data.quota_limit_user} onChange={e => setData('quota_limit_user', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" placeholder="ไม่จำกัด ใส่ 0" />
                                </div>
                            </div>

                            <div className="mt-6 space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <ToggleSwitch label="เฉพาะสมาชิกใหม่เท่านั้น" checked={data.is_new_member_only} onChange={(val) => setData('is_new_member_only', val)} />
                                <ToggleSwitch label="Enable link traffic source" checked={data.is_link_traffic_source} onChange={(val) => setData('is_link_traffic_source', val)} />
                                <ToggleSwitch label="Auto Timer" checked={data.is_auto_timer} onChange={(val) => setData('is_auto_timer', val)} />
                            </div>
                        </SectionCard>

                        {/* 2. Conditions */}
                        <SectionCard title="เงื่อนไขและมูลค่า" icon={Award}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">มูลค่าส่วนลด</label>
                                    <div className="flex rounded-md shadow-sm">
                                        <input type="number" value={data.discount_value} onChange={e => setData('discount_value', e.target.value)} className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:ring-purple-500 focus:border-purple-500" placeholder="0.00" />
                                        <select value={data.discount_unit} onChange={e => setData('discount_unit', e.target.value)} className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-lg hover:bg-gray-100">
                                            <option value="BAHT">บาท (฿)</option>
                                            <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                                            <option value="POINT">คะแนน (Points)</option>
                                        </select>
                                    </div>
                                    {errors.discount_value && <p className="text-red-500 text-xs mt-1">{errors.discount_value}</p>}
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ยอดสั่งซื้อขั้นต่ำ</label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">฿</span>
                                        </div>
                                        <input type="number" value={data.min_order_amount} onChange={e => setData('min_order_amount', e.target.value)} className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 3. Duration */}
                        <SectionCard title="ระยะเวลาการใช้งาน" icon={Calendar}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">เริ่มต้น</label>
                                    <input type="datetime-local" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">สิ้นสุด</label>
                                    <input type="datetime-local" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบวันหมดอายุ</label>
                                    <select value={data.expiry_mode} onChange={e => setData('expiry_mode', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500 bg-white">
                                        <option value="DATE">ตามวันที่ (Date)</option>
                                        <option value="DYNAMIC">นับจากวันที่ได้รับ (Dynamic)</option>
                                    </select>
                                </div>

                                {data.expiry_mode === 'DYNAMIC' && (
                                    <div className="flex gap-4 items-end animate-fade-in">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเวลา</label>
                                            <input type="number" value={data.expiry_dynamic_value} onChange={e => setData('expiry_dynamic_value', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">หน่วย</label>
                                            <select value={data.expiry_dynamic_unit} onChange={e => setData('expiry_dynamic_unit', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500 bg-white">
                                                <option value="DAYS">วัน (Days)</option>
                                                <option value="MONTHS">เดือน (Months)</option>
                                                <option value="YEARS">ปี (Years)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <ToggleSwitch label="แจ้งเตือนเมื่อใกล้หมดอายุ (Notification)" checked={data.is_expiry_notification} onChange={(val) => setData('is_expiry_notification', val)} />
                            </div>
                        </SectionCard>

                        {/* 4. Details & Media */}
                        <SectionCard title="รูปภาพและรายละเอียด" icon={Image}>
                            <div className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพปก</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors relative bg-gray-50 cursor-pointer" onClick={() => document.getElementById('coupon-img')?.click()}>
                                        {(data.image_file || coupon.image_url) ? (
                                            <div className="flex flex-col items-center">
                                                <img src={data.image_file ? URL.createObjectURL(data.image_file) : coupon.image_url!} className="h-40 object-contain mb-4 rounded shadow-sm" alt="Preview" />
                                                <span className="text-purple-600 text-sm hover:underline font-medium">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-center mb-2"><Image className="w-10 h-10 text-gray-400" /></div>
                                                <span className="text-purple-600 font-medium hover:text-purple-800">อัปโหลดรูปภาพ</span>
                                                <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG (Max 2MB)</p>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => setData('image_file', e.target.files?.[0] || null)} className="hidden" id="coupon-img" />
                                    </div>
                                    {errors.image_file && <p className="text-red-500 text-xs mt-1">{errors.image_file}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด / เงื่อนไขการใช้งาน</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm leading-relaxed"
                                        placeholder="ระบุรายละเอียดเพิ่มเติม..."
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* 5. Channels */}
                        <SectionCard title="QR Code และช่องทาง" icon={QrCode}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบายใต้ QR Code</label>
                                    <textarea value={data.qr_code_description} onChange={(e) => setData('qr_code_description', e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500 resize-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> External Link</label>
                                        <input type="text" value={data.external_link} onChange={e => setData('external_link', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Channel Redeemed</label>
                                        {/* Mock Select for Channels */}
                                        <select
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                                            value={data.redeemed_channels.length > 0 ? data.redeemed_channels[0] : ''}
                                            onChange={(e) => setData('redeemed_channels', e.target.value ? [e.target.value] : [])}
                                        >
                                            <option value="">เลือกช่องทาง...</option>
                                            <option value="POS">POS</option>
                                            <option value="App">Application</option>
                                            <option value="Web">Website</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Footer Action Bar (Sticky) */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-xl -mx-4 px-8 py-4 z-20 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                <span className="text-sm font-medium text-gray-600">สถานะ:</span>
                                <button type="button" onClick={() => setData('is_active', !data.is_active)} className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${data.is_active ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'}`}>
                                    {data.is_active ? '● เปิดใช้งาน' : '○ ปิดใช้งาน'}
                                </button>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Link href={route('admin.coupons.index')} className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center">ยกเลิก</Link>
                                <button type="submit" disabled={processing} className="flex-1 sm:flex-none px-8 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95">
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};