import React, { useState } from 'react';
import { Gift, Settings, Calendar, Users, Award, Package, Info, Plus, Trash2, ArrowLeft, Save, Loader2, Image } from 'lucide-react';
import { router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrivilegePreviewCard from './PrivilegePreviewCard';

// --- Interfaces ---
interface QuotaRule {
    id: number;
    property: string;
    tier: string;
    frequency: string;
    quantity: number;
}

// --- Components ---
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
            <label className="font-medium text-gray-700 text-sm cursor-pointer" onClick={() => onChange(!checked)}>{label}</label>
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

// --- Main Component ---
const Create = () => {
    // Initial State
    const [data, setData] = useState({
        privilege_name: '',
        privilege_code: '',
        points_silver: 0,
        points_gold: 0,
        points_platinum: 0,

        member_group: 'all',
        birth_month: 'every_month',
        member_type: 'all',

        // Quota
        quota_rules: [
            { id: Date.now(), property: 'total', tier: 'all', frequency: 'all_time', quantity: 1 }
        ] as QuotaRule[],

        // Settings
        is_auto_timer: false,
        is_stock_control: false,
        is_thermal_printer: false,
        is_big_commerce: false,

        delivery_type: 'receive_at_store',
        visibility_settings: 'both',

        start_date: '',
        end_date: '',

        description: '',
        qr_code_description: '',

        is_active: true,
        image_file: null as File | null,
        image_url: ''
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- Helper Functions ---
    const addQuotaRule = () => setData(prev => ({ ...prev, quota_rules: [...prev.quota_rules, { id: Date.now(), property: 'total', tier: 'all', frequency: 'all_time', quantity: 1 }] }));
    const removeQuotaRule = (id: number) => setData(prev => ({ ...prev, quota_rules: prev.quota_rules.filter(rule => rule.id !== id) }));
    const updateQuotaRule = (id: number, field: keyof QuotaRule, value: any) => setData(prev => ({ ...prev, quota_rules: prev.quota_rules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // ส่งข้อมูลไปยัง Controller
        router.post(route('admin.privileges.store'), data as any, {
            forceFormData: true,
            onSuccess: () => setProcessing(false),
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 font-prompt">
                <div className="max-w-5xl mx-auto px-4 py-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Link href={route('admin.privileges.index')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                                    <ArrowLeft className="w-6 h-6" />
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">สร้างสิทธิพิเศษใหม่</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 ml-14">
                            <div className="p-2 bg-purple-600 rounded-lg shadow-sm">
                                <Gift className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-gray-600">กรอกข้อมูลเพื่อเพิ่มรายการสิทธิพิเศษในระบบ</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-6">
                                {/* Section 1: Basic Info */}
                                <SectionCard title="ข้อมูลพื้นฐาน" icon={Award}>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อสิทธิพิเศษ <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={data.privilege_name}
                                                    onChange={(e) => setData({ ...data, privilege_name: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    placeholder="เช่น ส่วนลดวันเกิด 20%"
                                                />
                                                {errors.privilege_name && <p className="text-red-500 text-xs mt-1">{errors.privilege_name}</p>}
                                            </div>
                                            {/* Code */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">โค้ดสิทธิพิเศษ <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={data.privilege_code}
                                                    onChange={(e) => setData({ ...data, privilege_code: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
                                                    placeholder="เช่น BDAY2024"
                                                />
                                                {errors.privilege_code && <p className="text-red-500 text-xs mt-1">{errors.privilege_code}</p>}
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">คะแนนที่ใช้แลก <span className="text-gray-400 text-xs font-normal">(ใส่ 0 หากเป็นสิทธิ์ฟรี)</span></label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {tiers.map((item) => (
                                                    <div key={item.tier} className={`border-2 rounded-lg p-4 ${item.color} bg-opacity-50`}>
                                                        <div className="text-sm font-semibold mb-2">{item.tier}</div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={item.val}
                                                                // @ts-ignore
                                                                onChange={(e) => setData({ ...data, [item.setter]: parseInt(e.target.value) || 0 })}
                                                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                                min="0"
                                                            />
                                                            <span className="text-sm font-medium text-gray-500">คะแนน</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Section 2: Conditions */}
                                <SectionCard title="เงื่อนไขการรับสิทธิ์" icon={Users}>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                                            {/* Member Group */}
                                            <div>
                                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                                    กลุ่มสมาชิก
                                                    <InfoTooltip text={<>กำหนดกลุ่มสมาชิกที่มีสิทธิ์เห็นรายการนี้ <br />เลือก "สมาชิกทั้งหมด" หากต้องการให้ทุกคนเห็น </>} />
                                                </label>
                                                <select
                                                    value={data.member_group}
                                                    onChange={(e) => setData({ ...data, member_group: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="all">สมาชิกทั้งหมด</option>
                                                    <option value="Silver">Silver</option>
                                                    <option value="Gold">Gold</option>
                                                    <option value="Platinum">Platinum</option>
                                                </select>
                                            </div>

                                            {/* Birth Month */}
                                            <div>
                                                <label className="flex items-center text-sm font-small text-gray-700 mb-2">
                                                    เดือนเกิด
                                                    <InfoTooltip text="เลือกเฉพาะเดือนเกิด หากต้องการให้เป็นของขวัญวันเกิด" />
                                                </label>
                                                <select
                                                    value={data.birth_month}
                                                    onChange={(e) => setData({ ...data, birth_month: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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

                                        {/* Quota Limits Table */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">จำกัดสิทธิ์ (Quota Limits)</h3>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                <div className="hidden md:grid grid-cols-12 gap-4 mb-2 px-2">
                                                    <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</div>
                                                    <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</div>
                                                    <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</div>
                                                    <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</div>
                                                    <div className="col-span-1"></div>
                                                </div>
                                                <div className="space-y-3">
                                                    {data.quota_rules.map((rule) => (
                                                        <div key={rule.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 transition-colors">
                                                            <div className="col-span-3">
                                                                <select value={rule.property} onChange={e => updateQuotaRule(rule.id, 'property', e.target.value)} className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"><option value="total">Total (รวมทั้งหมด)</option><option value="per_user">Per User (ต่อคน)</option></select>
                                                            </div>
                                                            <div className="col-span-3">
                                                                <select value={rule.tier} onChange={e => updateQuotaRule(rule.id, 'tier', e.target.value)} className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"><option value="all">All Tier</option><option value="silver">Silver</option><option value="gold">Gold</option><option value="platinum">Platinum</option></select>
                                                            </div>
                                                            <div className="col-span-3">
                                                                <select value={rule.frequency} onChange={e => updateQuotaRule(rule.id, 'frequency', e.target.value)} className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"><option value="all_time">All time</option><option value="daily">Per Day</option><option value="monthly">Per Month</option><option value="yearly">Per Year</option></select>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <input type="number" value={rule.quantity} onChange={e => updateQuotaRule(rule.id, 'quantity', parseInt(e.target.value) || 0)} className="w-full text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" min="0" />
                                                            </div>
                                                            <div className="col-span-1 flex justify-end">
                                                                <button type="button" onClick={() => removeQuotaRule(rule.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4"><button type="button" onClick={addQuotaRule} className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"><Plus className="w-4 h-4" /> เพิ่มเงื่อนไข</button></div>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Section 3: Settings */}
                                <SectionCard title="การตั้งค่าระบบ" icon={Settings}>
                                    <div className="space-y-1 divide-y divide-gray-100">
                                        <ToggleSwitch label="Auto Timer" checked={data.is_auto_timer} onChange={(val) => setData({ ...data, is_auto_timer: val })} description="จับเวลาถอยหลังอัตโนมัติเมื่อกดรับสิทธิ์" />
                                        <ToggleSwitch label="Stock Control" checked={data.is_stock_control} onChange={(val) => setData({ ...data, is_stock_control: val })} description="ตัดสต็อกเมื่อมีการกดรับสิทธิ์ (ถ้าปิดจะรับได้เรื่อยๆ ตาม Quota)" />
                                        <ToggleSwitch label="Thermal Printer" checked={data.is_thermal_printer} onChange={(val) => setData({ ...data, is_thermal_printer: val })} />
                                        <ToggleSwitch label="Connect BigCommerce" checked={data.is_big_commerce} onChange={(val) => setData({ ...data, is_big_commerce: val })} />
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">การมองเห็น (Visibility)</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['admin', 'user', 'both'].map((type) => (
                                                <label key={type} className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${data.visibility_settings === type ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                                                    <input type="radio" value={type} checked={data.visibility_settings === type} onChange={(e) => setData({ ...data, visibility_settings: e.target.value })} className="sr-only" />
                                                    <span className="capitalize font-medium">{type === 'both' ? 'Admin & User' : type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">รูปแบบการรับ (Delivery Type)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${data.delivery_type === 'delivery' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                                                <input type="radio" checked={data.delivery_type === 'delivery'} onChange={() => setData({ ...data, delivery_type: 'delivery' })} className="hidden" />
                                                <Package className="w-5 h-5" /> <span>จัดส่ง (Delivery)</span>
                                            </label>
                                            <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${data.delivery_type === 'receive_at_store' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                                                <input type="radio" checked={data.delivery_type === 'receive_at_store'} onChange={() => setData({ ...data, delivery_type: 'receive_at_store' })} className="hidden" />
                                                <Award className="w-5 h-5" /> <span>รับที่หน้าร้าน / ใช้สิทธิ์ทันที</span>
                                            </label>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Section 4: Period & Media */}
                                <SectionCard title="ระยะเวลาและรายละเอียด" icon={Calendar}>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label><input type="date" value={data.start_date} onChange={(e) => setData({ ...data, start_date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label><input type="date" value={data.end_date} onChange={(e) => setData({ ...data, end_date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" /></div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดเงื่อนไข</label>
                                            <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-purple-500" placeholder="รายละเอียดเงื่อนไขการใช้สิทธิ์..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพปก</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors relative bg-gray-50">
                                                {(data.image_file || data.image_url) ? (
                                                    <div className="flex flex-col items-center">
                                                        <img src={data.image_file ? URL.createObjectURL(data.image_file) : data.image_url} className="h-40 object-contain mb-4 rounded shadow-sm" alt="Preview" />
                                                        <button type="button" onClick={() => setData({ ...data, image_file: null, image_url: '' })} className="text-red-500 text-sm hover:underline font-medium">ลบรูปภาพ</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-center mb-2"><Image className="w-10 h-10 text-gray-400" /></div>
                                                        <input type="file" accept="image/*" onChange={(e) => setData({ ...data, image_file: e.target.files?.[0] || null })} className="hidden" id="privilege-img" />
                                                        <label htmlFor="privilege-img" className="cursor-pointer text-purple-600 font-medium hover:text-purple-800">คลิกเพื่ออัปโหลดรูปภาพ</label>
                                                        <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG (Max 2MB)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            </div>
                            <div className="hidden lg:block lg:col-span-4">
                                <PrivilegePreviewCard data={data} />
                            </div>
                        </div>

                        {/* Footer Action Bar */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-xl -mx-4 px-8 py-4 z-20 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">สถานะ:</span>
                                <button type="button" onClick={() => setData({ ...data, is_active: !data.is_active })} className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${data.is_active ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'}`}>
                                    {data.is_active ? '● เปิดใช้งาน' : '○ ปิดใช้งาน'}
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <Link href={route('admin.privileges.index')} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">ยกเลิก</Link>
                                <button type="submit" disabled={processing} className="px-8 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 shadow-md active:scale-95">
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Create;