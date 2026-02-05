import React, { useState } from 'react';
import { Gift, Settings, Calendar, Users, Award, Package, Info, Search, Loader2, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// --- Interfaces ---
interface QuotaRule {
    id: number;
    property: string;
    tier: string;
    frequency: string;
    quantity: number;
    [key: string]: any;
}

// รับ Props reward ที่ส่งมาจาก Controller
interface EditProps {
    reward: any;
}

// --- Components (เหมือนหน้า Create) ---
const InfoTooltip = ({ text }: { text: React.ReactNode }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block">
            <button type="button" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"><Info className="w-4 h-4" /></button>
            {show && <div className="absolute z-10 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 left-6">{text}<div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div></div>}
        </div>
    );
};

const ToggleSwitch = ({ label, checked, onChange, description = "" }: { label: string; checked: boolean; onChange: (val: boolean) => void; description?: string; }) => (
    <div className="flex items-start justify-between py-3">
        <div className="flex-1">
            <label className="font-medium text-gray-700 text-sm">{label}</label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center gap-2"><Icon className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-semibold text-gray-800">{title}</h2></div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// --- Main Component ---
const Edit = ({ reward }: EditProps) => {

    // แปลงข้อมูล Quota Rules จาก DB ให้เป็น State (ถ้าไม่มีให้สร้าง Default)
    const initialQuotaRules: QuotaRule[] = (reward.quota_rules && reward.quota_rules.length > 0)
        ? reward.quota_rules.map((r: any, index: number) => ({ ...r, id: Date.now() + index })) // Generate ID for React Key
        : [{ id: Date.now(), property: 'total', tier: 'all', frequency: 'all_time', quantity: 1 }];

    // Initial State จากข้อมูลเดิม
    const [data, setData] = useState({
        // Fields
        reward_name: reward.reward_name || '',
        reward_code: reward.reward_code || '',
        rewards_id: reward.rewards_id || '',
        points_silver: reward.points_silver || 0,
        points_gold: reward.points_gold || 0,
        points_platinum: reward.points_platinum || 0,
        member_group: reward.member_group || '',
        birth_month: reward.birth_month || 'every_month',
        member_type: reward.member_type || 'all',
        category_id: reward.category || '', // Map category -> category_id

        // Rules
        quota_rules: initialQuotaRules,

        // Booleans (Convert 1/0 to true/false)
        is_missions_only: Boolean(reward.is_missions_only),
        is_auto_timer: Boolean(reward.is_auto_timer),
        is_stock_control: Boolean(reward.is_stock_control),
        is_thermal_printer: Boolean(reward.is_thermal_printer),
        is_big_commerce: Boolean(reward.is_big_commerce),
        is_active: Boolean(reward.is_active),

        // Settings
        delivery_type: reward.delivery_type || 'receive_at_store',
        visibility_settings: reward.visibility_settings || 'both',

        // Dates (ตัดเอาเฉพาะ YYYY-MM-DD)
        start_date: reward.start_date ? reward.start_date.split('T')[0] : '',
        end_date: reward.end_date ? reward.end_date.split('T')[0] : '',

        description: reward.description || '',

        // Images
        image_file: null as File | null,
        image_url: reward.image_url || '' // URL รูปเดิมจาก DB
    });

    const [processing, setProcessing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Functions (เหมือนเดิม) ---
    const addQuotaRule = () => setData(prev => ({ ...prev, quota_rules: [...prev.quota_rules, { id: Date.now(), property: 'total', tier: 'all', frequency: 'all_time', quantity: 1 }] }));
    const removeQuotaRule = (id: number) => setData(prev => ({ ...prev, quota_rules: prev.quota_rules.filter(rule => rule.id !== id) }));
    const updateQuotaRule = (id: number, field: keyof QuotaRule, value: any) => setData(prev => ({ ...prev, quota_rules: prev.quota_rules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule) }));

    // Search API (ถ้าต้องการให้แก้รหัสแล้วดึงข้อมูลใหม่ได้ในหน้า Edit)
    const handleSearchApi = async () => {
        if (!data.rewards_id) return alert("กรุณากรอกรหัสรางวัลก่อนค้นหา");
        setIsSearching(true);
        try {
            const response = await axios.get(route('admin.rewards.search.api'), { params: { search: data.rewards_id } });
            const resData = response.data;

            if (resData.status === 'NEW') {
                // Update บาง field เท่านั้นเพื่อไม่ให้ทับข้อมูลที่ User อาจจะแก้ไปแล้ว
                setData(prev => ({
                    ...prev,
                    reward_name: resData.data.reward_name || prev.reward_name,
                    // image_url: resData.data.image_url || prev.image_url, // แล้วแต่ Policy ว่าจะให้ทับรูปไหม
                }));
                alert('ดึงชื่อสินค้าเรียบร้อย');
            } else {
                alert('ไม่พบข้อมูลใหม่ หรือ รหัสนี้มีอยู่แล้ว');
            }
        } catch (error) { console.error(error); alert("ไม่พบข้อมูล"); } finally { setIsSearching(false); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const submitData = {
            ...data,
            category: data.category_id,
            quota_rules: data.quota_rules,
            _method: 'put' // [สำคัญ] บอก Laravel ว่าเป็นการ Update (เพราะส่งผ่าน POST Form Data)
        };

        router.post(route('admin.rewards.update', reward.id), submitData as any, {
            forceFormData: true,
            onSuccess: () => setProcessing(false),
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
                console.error('Validation Errors:', err);
                alert('เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูล');
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
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link href={route('admin.rewards.index')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                                    <ArrowLeft className="w-6 h-6" />
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">แก้ไขของรางวัล</h1>
                                    <p className="text-gray-600 text-sm mt-1">รหัส: {reward.rewards_id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section 1: Basic Info */}
                        <SectionCard title="ข้อมูลพื้นฐาน" icon={Award}>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">รหัสรางวัล <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <input type="text" value={data.rewards_id} onChange={(e) => setData({ ...data, rewards_id: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                            <button type="button" onClick={handleSearchApi} disabled={isSearching} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.rewards_id && <p className="text-red-500 text-xs mt-1">{errors.rewards_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อของรางวัล <span className="text-red-500">*</span></label>
                                        <input type="text" value={data.reward_name} onChange={(e) => setData({ ...data, reward_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    {/* Category Select ... (ใส่เหมือน Create) */}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-3">คะแนนแต่ละระดับ</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {tiers.map((item) => (
                                            <div key={item.tier} className={`border-2 rounded-lg p-4 ${item.color}`}>
                                                <div className="text-sm font-semibold mb-2">{item.tier}</div>
                                                <div className="flex items-center gap-2">
                                                    <input type="number" value={item.val} onChange={(e) => setData({ ...data, [item.setter]: parseInt(e.target.value) || 0 })} className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg" min="0" />
                                                    <span className="text-sm font-medium">คะแนน</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Section 2: Conditions (เหมือน Create เป๊ะ) */}
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">เดือนเกิด</label>
                                        <select value={data.birth_month} onChange={(e) => setData({ ...data, birth_month: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
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

                                {/* Quota Table */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quota limits</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="hidden md:grid grid-cols-12 gap-4 mb-2 px-2">
                                            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Limit property</div>
                                            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</div>
                                            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Limit frequency</div>
                                            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Limit quantity</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        <div className="space-y-3">
                                            {data.quota_rules.map((rule) => (
                                                <div key={rule.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                    <div className="col-span-3">
                                                        <select value={rule.property} onChange={e => updateQuotaRule(rule.id, 'property', e.target.value)} className="block w-full py-2 text-sm border-gray-300 rounded-md">
                                                            <option value="total">Total (ทั้งหมด)</option>
                                                            <option value="per_user">Per User (ต่อคน)</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <select value={rule.tier} onChange={e => updateQuotaRule(rule.id, 'tier', e.target.value)} className="block w-full py-2 text-sm border-gray-300 rounded-md">
                                                            <option value="all">All Tier</option>
                                                            <option value="silver">Silver</option>
                                                            <option value="gold">Gold</option>
                                                            <option value="platinum">Platinum</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <select value={rule.frequency} onChange={e => updateQuotaRule(rule.id, 'frequency', e.target.value)} className="block w-full py-2 text-sm border-gray-300 rounded-md">
                                                            <option value="all_time">All time</option>
                                                            <option value="daily">Per Day</option>
                                                            <option value="monthly">Per Month</option>
                                                            <option value="yearly">Per Year</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <input type="number" value={rule.quantity} onChange={e => updateQuotaRule(rule.id, 'quantity', parseInt(e.target.value) || 0)} className="block w-full py-2 text-sm border-gray-300 rounded-md" min="0" />
                                                    </div>
                                                    <div className="col-span-1 flex justify-end">
                                                        <button type="button" onClick={() => removeQuotaRule(rule.id)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4"><button type="button" onClick={addQuotaRule} className="flex items-center gap-2 text-sm font-medium text-blue-600"><Plus className="w-4 h-4" /> Add Property</button></div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Section 3: Settings (เหมือนเดิม) */}
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
                                {/* Visibility & Delivery (เหมือน Create) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">การมองเห็น</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['admin', 'user', 'both'].map((type) => (
                                            <label key={type} className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer ${data.visibility_settings === type ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                                                <input type="radio" value={type} checked={data.visibility_settings === type} onChange={(e) => setData({ ...data, visibility_settings: e.target.value })} className="sr-only" />
                                                <span className={`text-sm font-medium ${data.visibility_settings === type ? 'text-blue-700' : 'text-gray-700'}`}>{type}</span>
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
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label><input type="date" value={data.start_date} onChange={(e) => setData({ ...data, start_date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label><input type="date" value={data.end_date} onChange={(e) => setData({ ...data, end_date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">รายละเอียด</label>
                                    <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
                                </div>
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพรางวัล</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
                                        {(data.image_file || data.image_url) ? (
                                            <div className="flex flex-col items-center">
                                                {/* Show Preview from File OR URL */}
                                                <img src={data.image_file ? URL.createObjectURL(data.image_file) : data.image_url} alt="Preview" className="h-32 object-contain mb-4 rounded-md shadow-sm" />
                                                <button type="button" onClick={() => setData({ ...data, image_file: null, image_url: '' })} className="text-red-500 text-sm hover:underline">ลบรูปภาพ</button>
                                            </div>
                                        ) : (
                                            <>
                                                <input type="file" accept="image/*" onChange={(e) => setData({ ...data, image_file: e.target.files?.[0] || null })} className="hidden" id="image-upload" />
                                                <label htmlFor="image-upload" className="cursor-pointer text-blue-600">คลิกเพื่ออัปโหลด</label>
                                             </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg rounded-t-xl -mx-4 px-8 py-4 z-10">
                            <div className="max-w-5xl mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">สถานะ:</span>
                                    <button type="button" onClick={() => setData({ ...data, is_active: !data.is_active })} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${data.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {data.is_active ? '✓ เปิดใช้งาน' : '✕ ปิดใช้งาน'}
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={route('admin.rewards.index')} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">ยกเลิก</Link>
                                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        บันทึกการแก้ไข
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

export default Edit;