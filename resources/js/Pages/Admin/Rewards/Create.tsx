import React, { useState } from 'react';
import { AlertCircle, Gift, Settings, Image, Calendar, Users, Award, Package, Info, Search, Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RewardPreviewCard from './RewardPreviewCard';

// --- Interfaces ---
interface QuotaRule {
    id: number;
    property: string;   // 'total' | 'per_user'
    tier: string;       // 'all' | 'silver' | 'gold' | 'platinum'
    frequency: string;  // 'all_time' | 'daily' | 'monthly' | 'yearly'
    quantity: number;
}

// --- Components ---
const InfoTooltip = ({ text }: { text: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block ml-1 align-middle">
            <button
                type="button"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
                <Info className="w-4 h-4" />
            </button>
            {show && (
                <div className="absolute z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-6 leading-relaxed">
                    {text}
                    {/* Arrow */}
                    <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
                </div>
            )}
        </div>
    );
};

const ToggleSwitch = ({ label, checked, onChange, description = "" }: { label: string; checked: boolean; onChange: (val: boolean) => void; description?: string; }) => (
    <div className="flex items-start justify-between py-3">
        <div className="flex-1 pr-4">
            <label className="font-medium text-gray-700 text-sm cursor-pointer" onClick={() => onChange(!checked)}>{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// --- Main Component ---
const Create = () => {
    // Initial State
    const [data, setData] = useState({
        reward_name: '',
        rewards_id: '',
        reward_code: '',
        points_silver: 0,
        points_gold: 0,
        points_platinum: 0,
        member_group: 'all', // Default to 'all' or empty based on preference
        birth_month: 'every_month',
        member_type: 'all',
        category_id: '',

        // New Quota Rules Array
        quota_rules: [
            { id: Date.now(), property: 'total', tier: 'all', frequency: 'all_time', quantity: 1 }
        ] as QuotaRule[],

        is_missions_only: false,
        is_auto_timer: false,
        is_stock_control: true,
        is_thermal_printer: false,
        is_big_commerce: false,
        delivery_type: 'receive_at_store',
        visibility_settings: 'both',
        start_date: '',
        end_date: '',
        description: '',
        is_active: true,
        image_file: null as File | null,
        image_url: ''
    });

    const [processing, setProcessing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Quota Management Functions ---
    const addQuotaRule = () => {
        setData(prev => ({
            ...prev,
            quota_rules: [
                ...prev.quota_rules,
                { id: Date.now(), property: 'total', tier: 'all', frequency: 'all_time', quantity: 1 }
            ]
        }));
    };

    const removeQuotaRule = (id: number) => {
        setData(prev => ({
            ...prev,
            quota_rules: prev.quota_rules.filter(rule => rule.id !== id)
        }));
    };

    const updateQuotaRule = (id: number, field: keyof QuotaRule, value: any) => {
        setData(prev => ({
            ...prev,
            quota_rules: prev.quota_rules.map(rule =>
                rule.id === id ? { ...rule, [field]: value } : rule
            )
        }));
    };

    // --- Search API ---
    const handleSearchApi = async () => {
        if (!data.rewards_id) {
            alert("กรุณากรอกรหัสรางวัลก่อนค้นหา");
            return;
        }

        setIsSearching(true);
        try {
            // Adjust the route name as needed for your setup
            const response = await axios.get(route('admin.rewards.search.api'), {
                params: { search: data.rewards_id }
            });

            const resData = response.data;

            if (resData.status === 'EXISTING') {
                alert(`พบข้อมูลซ้ำ! รหัสสินค้านี้มีอยู่แล้ว: ${resData.data.reward_name}`);
            } else if (resData.status === 'NEW') {

                // Map flat API data to Quota Rules
                const newRules: QuotaRule[] = [];
                // If API returns a total quota, map it to a rule
                if (resData.data.quota_limit_total && resData.data.quota_limit_total > 0) {
                    newRules.push({
                        id: Date.now(),
                        property: 'total',
                        tier: 'all',
                        frequency: 'all_time',
                        quantity: resData.data.quota_limit_total
                    });
                } else {
                    // Default rule if none found
                    newRules.push({ id: Date.now(), property: 'total', tier: 'all', frequency: 'all_time', quantity: 1 });
                }

                setData(prev => ({
                    ...prev,
                    reward_id: resData.data.reward_id,
                    reward_name: resData.data.reward_name || prev.reward_name,
                    image_url: resData.data.image_url || '',
                    is_stock_control: resData.data.is_stock_control,
                    is_active: resData.data.is_active,
                    quota_rules: newRules
                }));
            }

        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                alert("ไม่พบข้อมูลสินค้าจากระบบภายนอก");
            } else {
                alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const submitData = {
            ...data,
            category: data.category_id,
            quota_rules: data.quota_rules
        };

        router.post(route('admin.rewards.store'), submitData as any, {
            forceFormData: true,
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
                console.error('Validation Errors:', err);
            },
            onFinish: () => setProcessing(false)
        });
    };

    const tiers = [
        { tier: 'Silver', color: 'bg-gray-100 text-gray-700 border-gray-300', val: data.points_silver, setter: 'points_silver' },
        { tier: 'Gold', color: 'bg-yellow-50 text-yellow-700 border-yellow-300', val: data.points_gold, setter: 'points_gold' },
        { tier: 'Platinum', color: 'bg-slate-100 text-slate-700 border-slate-300', val: data.points_platinum, setter: 'points_platinum' }
    ];

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-prompt">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link href={route('admin.rewards.index')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                                    <ArrowLeft className="w-6 h-6" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">ตั้งค่ารางวัล</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-600 rounded-xl">
                                <Gift className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">สร้างของรางวัล</h1>
                        </div>
                        <p className="text-gray-600 ml-16">กรอกข้อมูลเพื่อเพิ่มรางวัลใหม่ในระบบ</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-6">
                                {/* Section 1: Basic Info */}
                                <SectionCard title="ข้อมูลพื้นฐาน" icon={Award}>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Reward Code + Search */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    รหัสรางวัล <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={data.rewards_id}
                                                        onChange={(e) => setData({ ...data, rewards_id: e.target.value })}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchApi(); } }}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    // placeholder="REWARD001"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSearchApi}
                                                        disabled={isSearching}
                                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center min-w-[50px]"
                                                    >
                                                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">กดปุ่มค้นหาเพื่อดึงข้อมูลจาก Warranty API</p>
                                            </div>

                                            {/* Reward Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ชื่อของรางวัล <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.reward_name}
                                                    onChange={(e) => setData({ ...data, reward_name: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="เช่น สว่านไร้สาย"
                                                />
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพรางวัล</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors relative">
                                                {(data.image_file || data.image_url) ? (
                                                    <div className="flex flex-col items-center">
                                                        <img
                                                            src={data.image_file ? URL.createObjectURL(data.image_file) : data.image_url}
                                                            alt="Preview"
                                                            className="h-32 object-contain mb-4 rounded-md shadow-sm"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setData({ ...data, image_file: null, image_url: '' })}
                                                            className="text-red-500 text-sm hover:underline"
                                                        >
                                                            ลบรูปภาพ
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setData({ ...data, image_file: e.target.files?.[0] || null })}
                                                            className="hidden"
                                                            id="image-upload"
                                                        />
                                                        <label htmlFor="image-upload" className="cursor-pointer">
                                                            <span className="text-blue-600 font-medium hover:text-blue-700">คลิกเพื่ออัปโหลด</span>
                                                            <span className="text-gray-600"> หรือลากไฟล์มาวาง</span>
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF สูงสุด 2MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                โค้ดส่วนลด / สิทธิพิเศษ (Privilege Code)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.reward_code}
                                                onChange={(e) => setData({ ...data, reward_code: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="เช่น SUMMER2024 (ถ้ามี)"
                                            />
                                            {errors.reward_code && <p className="text-red-500 text-xs mt-1">{errors.reward_code}</p>}
                                        </div>

                                        {/* Points Tiers */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                คะแนนแต่ละระดับ
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {tiers.map((item) => (
                                                    <div key={item.tier} className={`border-2 rounded-lg p-4 ${item.color}`}>
                                                        <div className="text-sm font-semibold mb-2">{item.tier}</div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={item.val}
                                                                // @ts-ignore
                                                                onChange={(e) => setData({ ...data, [item.setter]: parseInt(e.target.value) || 0 })}
                                                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                min="0"
                                                            />
                                                            <span className="text-sm font-medium">คะแนน</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Section 2: Conditions */}
                                <SectionCard title="เงื่อนไขการแลก" icon={Users}>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Member Group - Updated */}
                                            <div>
                                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                    กลุ่มสมาชิก
                                                    <InfoTooltip text="กำหนดกลุ่มสมาชิกที่คุณต้องการจะมอบให้ ถ้าไม่ต้องการที่จะกำหนด เลือกสมาชิกทั้งหมด" />
                                                </label>
                                                <select
                                                    value={data.member_group}
                                                    onChange={(e) => setData({ ...data, member_group: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="all">สมาชิกทั้งหมด</option>
                                                    <option value="Silver">Silver</option>
                                                    <option value="Gold">Gold</option>
                                                    <option value="Platinum">Platinum</option>
                                                </select>
                                            </div>

                                            {/* Birth Month */}
                                            <div>
                                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">เดือนเกิด
                                                    <InfoTooltip text="กำหนดกลุ่มสมาชิกที่คุณต้องการจะมอบให้ ถ้าไม่ต้องการที่จะกำหนด เลือกสมาชิกทั้งหมด" />
                                                </label>
                                                <select
                                                    value={data.birth_month}
                                                    onChange={(e) => setData({ ...data, birth_month: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="every_month">ทุกเดือน</option>
                                                    <option value="january">มกราคม</option>
                                                    <option value="february">กุมภาพันธ์</option>
                                                    <option value="march">มีนาคม</option>
                                                    <option value="april">เมษายน</option>
                                                    <option value="may">พฤษภาคม</option>
                                                    <option value="june">มิถุนายน</option>
                                                    <option value="july">กรกฎาคม</option>
                                                    <option value="august">สิงหาคม</option>
                                                    <option value="september">กันยายน</option>
                                                    <option value="october">ตุลาคม</option>
                                                    <option value="november">พฤศจิกายน</option>
                                                    <option value="december">ธันวาคม</option>
                                                </select>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        {/* Quota Limits Table (New UI) */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quota limits</h3>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">

                                                {/* Desktop Header */}
                                                <div className="hidden md:grid grid-cols-12 gap-4 mb-2 px-2">
                                                    <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Limit property</div>
                                                    <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</div>
                                                    <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Limit frequency</div>
                                                    <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Limit quantity</div>
                                                    <div className="col-span-1"></div>
                                                </div>

                                                {/* Rows */}
                                                <div className="space-y-3">
                                                    {data.quota_rules.map((rule) => (
                                                        <div key={rule.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">

                                                            {/* Property */}
                                                            <div className="col-span-4">
                                                                <label className="md:hidden text-xs font-bold text-gray-500 block mb-1 uppercase">Limit property</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={rule.property}
                                                                        onChange={e => updateQuotaRule(rule.id, 'property', e.target.value)}
                                                                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
                                                                    >
                                                                        <option value="total">Total (ทั้งหมด)</option>
                                                                        <option value="per_user">Per User (ต่อคน)</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {/* Tier */}
                                                            <div className="col-span-2">
                                                                <label className="md:hidden text-xs font-bold text-gray-500 block mb-1 uppercase">Tier</label>
                                                                <select
                                                                    value={rule.tier}
                                                                    onChange={e => updateQuotaRule(rule.id, 'tier', e.target.value)}
                                                                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
                                                                >
                                                                    <option value="all">All Tier</option>
                                                                    <option value="silver">Silver</option>
                                                                    <option value="gold">Gold</option>
                                                                    <option value="platinum">Platinum</option>
                                                                </select>
                                                            </div>

                                                            {/* Frequency */}
                                                            <div className="col-span-3">
                                                                <label className="md:hidden text-xs font-bold text-gray-500 block mb-1 uppercase">Limit frequency</label>
                                                                <select
                                                                    value={rule.frequency}
                                                                    onChange={e => updateQuotaRule(rule.id, 'frequency', e.target.value)}
                                                                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
                                                                >
                                                                    <option value="all_time">All time</option>
                                                                    <option value="daily">Per Day</option>
                                                                    <option value="monthly">Per Month</option>
                                                                    <option value="yearly">Per Year</option>
                                                                </select>
                                                            </div>

                                                            {/* Quantity */}
                                                            <div className="col-span-2">
                                                                <label className="md:hidden text-xs font-bold text-gray-500 block mb-1 uppercase">Limit quantity</label>
                                                                <input
                                                                    type="number"
                                                                    value={rule.quantity}
                                                                    onChange={e => updateQuotaRule(rule.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                    className="block w-full py-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                                    min="0"
                                                                />
                                                            </div>

                                                            {/* Delete Button */}
                                                            <div className="col-span-1 flex justify-end md:justify-center pt-1 md:pt-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeQuotaRule(rule.id)}
                                                                    className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                                    title="Remove rule"
                                                                // disabled={data.quota_rules.length === 1}
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Button */}
                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={addQuotaRule}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Property
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Section 3: Settings */}
                                <SectionCard title="การตั้งค่า" icon={Settings}>
                                    <div className="space-y-1 divide-y divide-gray-100">
                                        <ToggleSwitch
                                            label="เฉพาะภารกิจ (Missions Only)"
                                            checked={data.is_missions_only}
                                            onChange={(val) => setData({ ...data, is_missions_only: val })}
                                            description="แสดงเฉพาะในภารกิจพิเศษ"
                                        />
                                        <ToggleSwitch
                                            label="ตั้งเวลาอัตโนมัติ (Auto Timer)"
                                            checked={data.is_auto_timer}
                                            onChange={(val) => setData({ ...data, is_auto_timer: val })}
                                        />
                                        <ToggleSwitch
                                            label="ควบคุมสต็อก (Stock Control)"
                                            checked={data.is_stock_control}
                                            onChange={(val) => setData({ ...data, is_stock_control: val })}
                                        />
                                        <ToggleSwitch
                                            label="พิมพ์ใบเสร็จแบบความร้อน"
                                            checked={data.is_thermal_printer}
                                            onChange={(val) => setData({ ...data, is_thermal_printer: val })}
                                        />
                                        <ToggleSwitch
                                            label="เชื่อมต่อ BigCommerce"
                                            checked={data.is_big_commerce}
                                            onChange={(val) => setData({ ...data, is_big_commerce: val })}
                                        />
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">การมองเห็น</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['admin', 'user', 'both'].map((type) => (
                                                    <label
                                                        key={type}
                                                        className={`relative flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${data.visibility_settings === type
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            value={type}
                                                            checked={data.visibility_settings === type}
                                                            onChange={(e) => setData({ ...data, visibility_settings: e.target.value })}
                                                            className="sr-only"
                                                        />
                                                        <span className={`text-sm font-medium ${data.visibility_settings === type ? 'text-blue-700' : 'text-gray-700'}`}>
                                                            {type === 'both' ? 'ทั้งหมด' : type === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3 mt-3">รูปแบบการรับ</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <label className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${data.delivery_type === 'delivery' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                                    <input
                                                        type="radio"
                                                        checked={data.delivery_type === 'delivery'}
                                                        onChange={() => setData({ ...data, delivery_type: 'delivery' })}
                                                        className="text-blue-600"
                                                    />
                                                    <Package className="w-5 h-5" />
                                                    <span className="text-sm font-medium">จัดส่ง</span>
                                                </label>
                                                <label className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${data.delivery_type === 'receive_at_store' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                                    <input
                                                        type="radio"
                                                        checked={data.delivery_type === 'receive_at_store'}
                                                        onChange={() => setData({ ...data, delivery_type: 'receive_at_store' })}
                                                        className="text-blue-600"
                                                    />
                                                    <Award className="w-5 h-5" />
                                                    <span className="text-sm font-medium">รับที่ร้าน</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Section 4: Period & Media */}
                                <SectionCard title="ระยะเวลาและรายละเอียด" icon={Calendar}>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
                                                <input
                                                    type="date"
                                                    value={data.start_date}
                                                    onChange={(e) => setData({ ...data, start_date: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                                                <input
                                                    type="date"
                                                    value={data.end_date}
                                                    onChange={(e) => setData({ ...data, end_date: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">รายละเอียด</label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData({ ...data, description: e.target.value })}
                                                rows={4}
                                                maxLength={2000}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="อธิบายรายละเอียดของรางวัล..."
                                            />
                                        </div>

                                        {/* Image Upload
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพรางวัล</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors relative">
                                        {(data.image_file || data.image_url) ? (
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={data.image_file ? URL.createObjectURL(data.image_file) : data.image_url}
                                                    alt="Preview"
                                                    className="h-32 object-contain mb-4 rounded-md shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setData({ ...data, image_file: null, image_url: '' })}
                                                    className="text-red-500 text-sm hover:underline"
                                                >
                                                    ลบรูปภาพ
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setData({ ...data, image_file: e.target.files?.[0] || null })}
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <label htmlFor="image-upload" className="cursor-pointer">
                                                    <span className="text-blue-600 font-medium hover:text-blue-700">คลิกเพื่ออัปโหลด</span>
                                                    <span className="text-gray-600"> หรือลากไฟล์มาวาง</span>
                                                </label>
                                                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF สูงสุด 2MB</p>
                                             </>
                                        )}
                                    </div>
                                </div> */}
                                    </div>
                                </SectionCard>
                            </div>
                            <div className="hidden lg:block lg:col-span-4">
                                {/* ✅ เรียกใช้ Component ที่แยกไว้ ส่ง data เข้าไป */}
                                <RewardPreviewCard data={data} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg rounded-t-xl -mx-4 px-8 py-4 z-10">
                            <div className="max-w-5xl mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">สถานะ:</span>
                                    <button
                                        type="button"
                                        onClick={() => setData({ ...data, is_active: !data.is_active })}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${data.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {data.is_active ? '✓ เปิดใช้งาน' : '✕ ปิดใช้งาน'}
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                        ยกเลิก
                                    </button>
                                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2">
                                        {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>

    );
};

export default Create;