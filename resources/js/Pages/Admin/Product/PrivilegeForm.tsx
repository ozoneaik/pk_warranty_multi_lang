import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Image as ImageIcon,
    Calendar,
    Lock,
    Info,
    TrendingUp,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const DEFAULT_PRIVILEGE_IMAGE = "https://pumpkin-image-sku.s3.ap-southeast-1.amazonaws.com/pumpkin-image-logo/logo.png";

interface PrivilegeFormProps {
    data: any;
    setData: any;
    errors: any;
    isExisting: boolean;
    pointProcesses: any[];
    isEdit?: boolean;
}

export default function PrivilegeForm({ data, setData, errors, isExisting, pointProcesses, isEdit = false }: PrivilegeFormProps) {
    const [mode, setMode] = useState<'process' | 'search'>(data.type_ref ? 'process' : 'process');
    const [searchCode, setSearchCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedProcess, setSelectedProcess] = useState<any>(null);

    // 1. กำหนดค่าเริ่มต้นเมื่อ Component โหลดครั้งแรก
    useEffect(() => {
        if (!data.image_url) {
            setData((prev: any) => ({
                ...prev,
                image_url: DEFAULT_PRIVILEGE_IMAGE,
                stock_qty: 999999,
                redeem_point: 0
            }));
        }
    }, []);

    // 2. Sync ข้อมูลเงื่อนไข (Process) เมื่อมีการเปลี่ยน type_ref หรือ pid
    useEffect(() => {
        if (data.type_ref) {
            const process = pointProcesses.find((p: any) => p.id === data.type_ref);
            if (process) setSelectedProcess(process);
        } else if (mode === 'process' && data.pid) {
            const process = pointProcesses.find((p: any) => p.process_code === data.pid);
            if (process) {
                setSelectedProcess(process);
                if (!data.type_ref) setData('type_ref', process.id);
            }
        }
    }, [data.type_ref, data.pid, pointProcesses, mode]);

    // 3. คำนวณคะแนน (Earn Point) อัตโนมัติเมื่อเปลี่ยนระดับสมาชิก (Tier Level)
    useEffect(() => {
        if (isEdit) return; // ถ้าเป็นการแก้ไข จะไม่คำนวณทับค่าเดิมที่เซฟไว้

        if (selectedProcess) {
            let points = selectedProcess.default_point;

            switch (data.tier_level) {
                case 1: points = selectedProcess.point_silver || points; break;
                case 2: points = selectedProcess.point_gold || points; break;
                case 3: points = selectedProcess.point_platinum || points; break;
            }

            if (data.earn_point !== points) {
                setData('earn_point', points);
            }
        }
    }, [data.tier_level, selectedProcess, isEdit]);

    // --- ส่วนของ Handler Functions (สำหรับจัดการเหตุการณ์ต่างๆ) ---

    // ฟังก์ชันเมื่อเปลี่ยนการเลือก Process ใน Mode: Process
    const handleProcessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = e.target.value;
        const process = pointProcesses.find((p: any) => p.process_code === selectedCode);

        if (process) {
            setSelectedProcess(process);

            let initialPoints = process.default_point;
            switch (data.tier_level) {
                case 1: initialPoints = process.point_silver || initialPoints; break;
                case 2: initialPoints = process.point_gold || initialPoints; break;
                case 3: initialPoints = process.point_platinum || initialPoints; break;
            }

            setData((prev: any) => ({
                ...prev,
                pid: process.process_code,
                pname: process.process_name,
                earn_point: isEdit ? data.earn_point : initialPoints,
                image_url: DEFAULT_PRIVILEGE_IMAGE,
                stock_qty: 999999,
                redeem_point: 0,
                type_ref: process.id
            }));
        }
    };

    // ฟังก์ชันเมื่อเปลี่ยนการอ้างอิงเงื่อนไขใน Mode: Search
    const handleTypeRefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const process = pointProcesses.find((p: any) => p.id === selectedId);

        setData('type_ref', selectedId || null);

        if (process) {
            setSelectedProcess(process);
        } else {
            setSelectedProcess(null);
        }
    };

    // ฟังก์ชันค้นหาสินค้าจากรหัส (API Search)
    const handleProductSearch = async () => {
        if (!searchCode) return;
        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await axios.get(route('admin.products.search.api'), {
                params: { search: searchCode, type: 'privilege' }
            });

            const result = response.data;
            const productData = result.data;

            setData((prev: any) => ({
                ...prev,
                pid: productData.pid,
                pname: productData.pname,
                image_url: productData.image_url || DEFAULT_PRIVILEGE_IMAGE,
                stock_qty: 999999,
                redeem_point: 0,
                earn_point: 0,
                type_ref: null
            }));
            setSelectedProcess(null);

        } catch (error: any) {
            setSearchError(error.response?.data?.error || 'ไม่พบข้อมูลสินค้า');
            setData((prev: any) => ({ ...prev, pid: '', pname: '', image_url: DEFAULT_PRIVILEGE_IMAGE }));
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* --- Section: Mode Selection --- */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex inline-flex w-full md:w-auto">
                <button
                    type="button"
                    className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-sm font-semibold transition-all ${mode === 'process'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    onClick={() => setMode('process')}
                    disabled={isExisting}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    เลือกจากเงื่อนไข (Process)
                </button>
                <button
                    type="button"
                    className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-sm font-semibold transition-all ${mode === 'search'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    onClick={() => setMode('search')}
                    disabled={isExisting}
                >
                    <Search className="w-4 h-4 inline mr-2" />
                    ค้นหาสินค้า (Product)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Left Column: Image & Basic Info --- */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                            <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
                            รูปภาพสิทธิพิเศษ
                        </h3>
                        <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 overflow-hidden group relative">
                            <img
                                src={data.image_url || DEFAULT_PRIVILEGE_IMAGE}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                            {isSearching && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-2">รหัสอ้างอิง (PID)</label>
                        <input
                            type="text"
                            value={data.pid}
                            disabled={isExisting || mode === 'process'}
                            className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm font-mono"
                        />
                        {errors.pid && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" />{errors.pid}</p>}
                    </div>
                </div>

                {/* --- Right Column: Main Form --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mode Specific Search/Select */}
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-inner">
                        {mode === 'process' ? (
                            <div>
                                <label className="block text-sm font-bold text-purple-900 mb-0">เลือกเงื่อนไข</label>
                                <select
                                    className="w-full border-purple-200 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm"
                                    onChange={handleProcessChange}
                                    disabled={isExisting}
                                    value={data.pid || ''}
                                >
                                    <option value="">-- กรุณาเลือกเงื่อนไขคะแนน --</option>
                                    {pointProcesses.map((p: any) => (
                                        <option key={p.process_code} value={p.process_code}>
                                            {p.process_name} (S:{p.point_silver} G:{p.point_gold} P:{p.point_platinum})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">ค้นหาจากรหัสสินค้า</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border-gray-300 rounded-lg text-sm focus:ring-purple-500"
                                        placeholder="ตัวอย่าง: PUM-12345"
                                        value={searchCode}
                                        onChange={(e) => setSearchCode(e.target.value)}
                                        disabled={isExisting}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleProductSearch}
                                        disabled={isSearching || isExisting || !searchCode}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center"
                                    >
                                        {isSearching ? 'ค้นหา...' : 'ตรวจสอบ'}
                                    </button>
                                </div>
                                {searchError && <p className="text-red-500 text-xs mt-2">{searchError}</p>}
                            </div>
                        )}
                    </div>
                    {mode === 'search' && (<div className="bg-gray-50 p-3 rounded border border-gray-200"> <label className="block text-sm font-medium text-gray-700 mb-1"> Type Reference (อ้างอิงเงื่อนไขคะแนน) </label> <select value={data.type_ref || ''} disabled={isExisting} onChange={handleTypeRefChange} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm" > <option value="">-- ไม่ระบุ (กำหนดคะแนนเอง) --</option> {pointProcesses.map((p: any) => (<option key={p.id} value={p.id}> {p.process_name} ({p.process_code}) </option>))} </select> <p className="text-xs text-gray-500 mt-1"> * หากเลือก Type ระบบจะคำนวณแต้มให้ตามเงื่อนไขนั้นๆ </p> </div>)}
                    {/* Basic Field: Product Name */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อรายการสิทธิพิเศษ</label>
                        <input
                            type="text"
                            value={data.pname}
                            disabled={isExisting}
                            onChange={e => setData('pname', e.target.value)}
                            className="w-full border-gray-200 rounded-lg focus:ring-purple-500 font-semibold"
                            placeholder="ระบุชื่อที่ต้องการให้แสดงบนแอปฯ"
                        />
                        {errors.pname && <p className="text-red-500 text-xs mt-1">{errors.pname}</p>}
                    </div>

                    {/* Section: Point Logic */}
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-green-900 mb-2">ระดับสมาชิกขั้นต่ำ</label>
                            <select
                                value={data.tier_level}
                                disabled={isExisting}
                                onChange={e => setData('tier_level', parseInt(e.target.value))}
                                className="w-full border-green-200 rounded-lg shadow-sm text-sm"
                            >
                                <option value="1">🥈 Silver</option>
                                <option value="2">🥇 Gold</option>
                                <option value="3">💎 Platinum</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-green-900 mb-2 underline decoration-green-400">คะแนนที่จะได้รับ (Earn Point)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-green-600 font-bold">+</span>
                                </div>
                                <input
                                    type="number"
                                    value={data.earn_point}
                                    disabled={isExisting}
                                    onChange={e => setData('earn_point', parseInt(e.target.value) || 0)}
                                    className="w-full pl-8 border-green-200 rounded-lg bg-white font-bold text-green-700 text-lg"
                                />
                            </div>
                            <p className="text-[10px] text-green-600 mt-1">
                                {selectedProcess ? `✓ ลิงก์ข้อมูลจากเงื่อนไข ${selectedProcess.process_name}` : '* ระบุคะแนนด้วยตนเอง'}
                            </p>
                        </div>
                    </div>

                    {/* Section: Limits and Expiry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                การหมดอายุ
                            </h4>
                            <div className="space-y-4">
                                <select
                                    value={data.expiry_type || 'none'}
                                    onChange={e => setData((prev: any) => ({ ...prev, expiry_type: e.target.value }))}
                                    className="w-full border-blue-200 rounded-lg text-sm"
                                >
                                    <option value="none">ไม่มีวันหมดอายุ</option>
                                    <option value="static">กำหนดวันที่แน่นอน</option>
                                    <option value="dynamic">นับจากวันที่ลูกค้ากดรับ (วัน)</option>
                                </select>
                                {data.expiry_type === 'static' && (
                                    <input type="date" value={data.expired_at || ''} onChange={e => setData((prev: any) => ({ ...prev, expired_at: e.target.value }))} className="w-full border-blue-200 rounded-lg text-sm" />
                                )}
                                {data.expiry_type === 'dynamic' && (
                                    <div className="relative">
                                        <input type="number" value={data.expiry_days || ''} onChange={e => setData((prev: any) => ({ ...prev, expiry_days: e.target.value }))} className="w-full border-blue-200 rounded-lg text-sm pr-10" placeholder="จำนวนวัน" />
                                        <span className="absolute right-3 top-2 text-xs text-blue-400">วัน</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                            <h4 className="text-sm font-bold text-amber-900 mb-4 flex items-center">
                                <Lock className="w-4 h-4 mr-2" />
                                ข้อจำกัดการใช้
                            </h4>
                            <div className="space-y-4">
                                <select
                                    value={data.usage_limit_type || 'unlimited'}
                                    onChange={e => setData((prev: any) => ({ ...prev, usage_limit_type: e.target.value }))}
                                    className="w-full border-amber-200 rounded-lg text-sm"
                                >
                                    <option value="unlimited">ไม่จำกัดการแลก</option>
                                    <option value="once">ครั้งเดียวเท่านั้น</option>
                                    <option value="monthly">จำกัดต่อเดือน</option>
                                    <option value="yearly">จำกัดต่อปี</option>
                                </select>
                                {data.usage_limit_type !== 'unlimited' && (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.usage_limit_amount || 1}
                                            onChange={e => setData((prev: any) => ({ ...prev, usage_limit_amount: parseInt(e.target.value) || 1 }))}
                                            className="w-full border-amber-200 rounded-lg text-sm pr-12"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-amber-400">ครั้ง</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Remark */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                            <Info className="w-4 h-4 mr-2 text-indigo-500" />
                            เงื่อนไขการใช้งาน (Remark)
                        </label>
                        <textarea
                            rows={3}
                            value={data.remark || ''}
                            onChange={e => setData('remark', e.target.value)}
                            className="w-full border-gray-200 rounded-xl text-sm focus:ring-purple-500"
                            placeholder="ระบุข้อความที่จะแสดงให้ลูกค้าเห็น เช่น ใช้ได้เฉพาะสาขาที่ร่วมรายการ..."
                        />
                    </div>

                    <div className="flex items-center p-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="sr-only peer"
                                disabled={isExisting}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            <span className="ml-3 text-sm font-bold text-gray-700">เปิดใช้งานรายการนี้</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}