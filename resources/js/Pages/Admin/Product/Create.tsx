import React, { useState, useEffect } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import axios from 'axios';

// --- Custom Toggle Switch Component ---
const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className="flex items-start justify-between py-3 border-b last:border-0">
        <div>
            <h3 className="text-sm font-medium text-gray-900">{label}</h3>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

export default function CreateReward({ reward = null, isEdit = false }) {

    // ตั้งค่า Default Form
    const { data, setData, post, put, processing, errors, reset } = useForm({
        reward_name: reward?.reward_name || '',
        reward_code: reward?.reward_code || '',
        rewards_id: reward?.rewards_id || '',

        // Points
        points_silver: reward?.points_silver || 0,
        points_gold: reward?.points_gold || 0,
        points_platinum: reward?.points_platinum || 0,

        // Details
        image_url: reward?.image_url || '',
        description: reward?.description || '',
        qr_code_description: reward?.qr_code_description || '',

        // Quota
        quota_limit_total: reward?.quota_limit_total || 0,
        quota_limit_per_user: reward?.quota_limit_per_user || 1,

        // Conditions
        is_missions_only: reward?.is_missions_only ? true : false,
        is_auto_timer: reward?.is_auto_timer ? true : false,
        is_stock_control: reward?.is_stock_control ? true : false,
        is_thermal_printer: reward?.is_thermal_printer ? true : false,
        is_big_commerce: reward?.is_big_commerce ? true : false,
        is_active: reward?.is_active ?? true,

        // Settings
        delivery_type: reward?.delivery_type || 'receive_at_store',
        visibility_settings: reward?.visibility_settings || 'both',

        // Dates (แปลง format ให้เข้ากับ input datetime-local)
        start_date: reward?.start_date ? new Date(reward.start_date).toISOString().slice(0, 16) : '',
        end_date: reward?.end_date ? new Date(reward.end_date).toISOString().slice(0, 16) : '',
    });

    const [isSearching, setIsSearching] = useState(false);

    // ฟังก์ชันค้นหา API
    const handleSearch = async () => {
        if (!data.reward_code) return alert('กรุณากรอกรหัสสินค้าก่อนค้นหา');

        setIsSearching(true);
        try {
            const res = await axios.get(route('products.search.api'), {
                params: { search: data.reward_code }
            });

            if (res.data.status === 'EXISTING') {
                alert('สินค้านี้มีอยู่ในระบบแล้ว ระบบจะดึงข้อมูลเดิมมาแสดง');
                // ถ้าอยาก Redirect ไปหน้า Edit เลยก็ได้ แต่ที่นี้ Fill ข้อมูลให้ก่อน
            } else if (res.data.status === 'NEW') {
                const apiData = res.data.data;
                setData(prev => ({
                    ...prev,
                    reward_name: apiData.reward_name,
                    image_url: apiData.image_url || prev.image_url,
                    quota_limit_total: apiData.quota_limit_total || 0,
                }));
                alert('ดึงข้อมูลสินค้าเรียบร้อย');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'ไม่พบข้อมูลสินค้า');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('products.update', reward.id));
        } else {
            post(route('products.store'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head title={isEdit ? "แก้ไขของรางวัล" : "สร้างของรางวัล"} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? "แก้ไขของรางวัล (Edit Reward)" : "สร้างของรางวัล (Create Reward)"}
                    </h1>
                    <Link
                        href={route('products.index')}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        &larr; กลับหน้ารายการ
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* --- Card 1: ข้อมูลหลัก --- */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">ข้อมูลของรางวัล</h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* รหัสสินค้า + ปุ่มค้นหา */}
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">รหัสรางวัล / SKU</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        value={data.reward_code}
                                        onChange={e => setData('reward_code', e.target.value)}
                                        className="flex-1 block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="เช่น 6oV5ID6FlR"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {isSearching ? '...' : 'Search'}
                                    </button>
                                </div>
                                {errors.reward_code && <p className="mt-1 text-sm text-red-600">{errors.reward_code}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">ชื่อของรางวัล <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.reward_name}
                                    onChange={e => setData('reward_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {errors.reward_name && <p className="mt-1 text-sm text-red-600">{errors.reward_name}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">รูปภาพ URL</label>
                                <input
                                    type="text"
                                    value={data.image_url}
                                    onChange={e => setData('image_url', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                {data.image_url && (
                                    <div className="mt-2">
                                        <img src={data.image_url} alt="Preview" className="h-24 w-24 object-cover rounded border" />
                                    </div>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- Card 2: คะแนนตาม Tier --- */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">คะแนนที่ใช้แลก (Points)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Silver Point</label>
                                <input
                                    type="number"
                                    value={data.points_silver}
                                    onChange={e => setData('points_silver', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-yellow-600 uppercase tracking-wide">Gold Point</label>
                                <input
                                    type="number"
                                    value={data.points_gold}
                                    onChange={e => setData('points_gold', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-yellow-400 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">Platinum Point</label>
                                <input
                                    type="number"
                                    value={data.points_platinum}
                                    onChange={e => setData('points_platinum', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- Card 3: เงื่อนไข & Settings --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ซ้าย: Toggles */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Condition Settings</h2>
                            <div className="space-y-2">
                                <ToggleSwitch
                                    label="เปิดใช้งาน (Active)"
                                    checked={data.is_active}
                                    onChange={val => setData('is_active', val)}
                                />
                                <ToggleSwitch
                                    label="Missions Only"
                                    description="แสดงเฉพาะเมื่อทำภารกิจสำเร็จ"
                                    checked={data.is_missions_only}
                                    onChange={val => setData('is_missions_only', val)}
                                />
                                <ToggleSwitch
                                    label="Auto Timer"
                                    description="จับเวลาอัตโนมัติเมื่อกดแลก"
                                    checked={data.is_auto_timer}
                                    onChange={val => setData('is_auto_timer', val)}
                                />
                                <ToggleSwitch
                                    label="Stock Control"
                                    description="ตัดจำนวนสินค้าเมื่อมีการแลก"
                                    checked={data.is_stock_control}
                                    onChange={val => setData('is_stock_control', val)}
                                />
                                <ToggleSwitch
                                    label="Thermal Printer"
                                    description="พิมพ์คูปองออกเครื่องพิมพ์"
                                    checked={data.is_thermal_printer}
                                    onChange={val => setData('is_thermal_printer', val)}
                                />
                            </div>
                        </div>

                        {/* ขวา: Quota & Date */}
                        <div className="space-y-6">
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">ระยะเวลา & Quota</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700">วันที่เริ่มต้น</label>
                                            <input
                                                type="datetime-local"
                                                value={data.start_date}
                                                onChange={e => setData('start_date', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700">ถึงวันที่</label>
                                            <input
                                                type="datetime-local"
                                                value={data.end_date}
                                                onChange={e => setData('end_date', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-700">จำกัดจำนวนรวม (Total Quota)</label>
                                        <input
                                            type="number"
                                            value={data.quota_limit_total}
                                            onChange={e => setData('quota_limit_total', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-700">จำกัดต่อผู้ใช้ (Limit Per User)</label>
                                        <input
                                            type="number"
                                            value={data.quota_limit_per_user}
                                            onChange={e => setData('quota_limit_per_user', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">การจัดส่ง</h2>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" value="receive_at_store" checked={data.delivery_type === 'receive_at_store'} onChange={e => setData('delivery_type', e.target.value)} className="mr-2" />
                                        รับที่ร้าน
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" value="delivery" checked={data.delivery_type === 'delivery'} onChange={e => setData('delivery_type', e.target.value)} className="mr-2" />
                                        จัดส่งตามที่อยู่
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link
                            href={route('products.index')}
                            className="px-6 py-2.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            ยกเลิก
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 rounded-md text-white hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50"
                        >
                            {processing ? 'กำลังบันทึก...' : (isEdit ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}