import React, { useState } from 'react';
import axios from 'axios';
import couponImg from '../../../assets/images/coupon.jpg';

const CUSTOM_COUPON_IMG = couponImg;

interface CouponFormProps {
    data: any;
    setData: any;
    errors: any;
    pointRate: number;
    isExisting: boolean;
    typeLabel: string;
    typeIcon: string;
    productTypes: { id: string, label: string }[];
    onTypeChange?: (newType: string) => void;
}

export default function CouponForm({ data, setData, errors, isExisting, typeLabel, typeIcon, productTypes, onTypeChange, pointRate }: CouponFormProps) {
    const [couponMode, setCouponMode] = useState<'manual' | 'premium'>('manual');
    const [searchCode, setSearchCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const POINT_RATE = 0.25;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseFloat(e.target.value) || 0;
        const calculatedPoints = Math.ceil(amount / pointRate);
        setData((prev: any) => ({
            ...prev,
            discount_amount: amount,
            redeem_point: calculatedPoints
        }));
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const points = parseInt(e.target.value) || 0;
        const calculatedAmount = points * POINT_RATE;
        setData((prev: any) => ({
            ...prev,
            redeem_point: points,
            discount_amount: calculatedAmount
        }));
    };

    const handlePremiumSearch = async () => {
        if (!searchCode) return;
        setIsSearching(true);
        try {
            const response = await axios.get(route('admin.products.search.api'), {
                params: { search: searchCode, type: 'coupon' }
            });
            const productData = response.data.data;

            setData((prev: any) => ({
                ...prev,
                pid: productData.pid,
                pname: `[พรีเมียม] ${productData.pname}`,
                image_url: productData.image_url,
            }));
        } catch (error) {
            alert('ไม่พบข้อมูลสินค้าพรีเมียม');
        } finally {
            setIsSearching(false);
        }
    };

    const toggleMode = (mode: 'manual' | 'premium') => {
        setCouponMode(mode);
        if (mode === 'manual') {
            setData((prev: any) => ({
                ...prev,
                pid: `CPN-${Date.now()}`,
                image_url: CUSTOM_COUPON_IMG
            }));
        } else {
            setData((prev: any) => ({ ...prev, pid: '', image_url: '' }));
        }
    };

    return (
        <div className="space-y-6 text-left">
            {/* Sub-tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg w-full sm:w-80">
                <button type="button" onClick={() => toggleMode('manual')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${couponMode === 'manual' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
                    คูปองส่วนลดทั่วไป
                </button>
                {/* <button type="button" onClick={() => toggleMode('premium')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${couponMode === 'premium' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
                    แลกสินค้าพรีเมียม
                </button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    {couponMode === 'premium' && (
                        <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                            <label className="block text-xs font-bold text-orange-800 mb-1">ค้นหารหัสสินค้าพรีเมียม</label>
                            <div className="flex gap-2">
                                <input type="text" value={searchCode} onChange={e => setSearchCode(e.target.value)} className="flex-1 border-gray-300 rounded-md text-sm p-1" placeholder="เช่น 20017" />
                                <button type="button" onClick={handlePremiumSearch} className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700">{isSearching ? '...' : 'ดึงข้อมูล'}</button>
                            </div>
                        </div>
                    )}

                    <div className="w-full h-48 bg-orange-50 rounded-lg flex items-center justify-center text-gray-400 mb-4 border border-orange-100 overflow-hidden relative group">
                        {data.image_url ? (
                            <img src={data.image_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <span className="text-4xl">{typeIcon}</span>
                                <p className="text-xs text-gray-400 mt-2">พรีวิวรูปภาพ</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">URL รูปภาพสินค้า</label>
                        <input
                            type="text"
                            value={data.image_url}
                            onChange={e => setData('image_url', e.target.value)}
                            className="mt-1 block w-full text-xs border-gray-300 rounded-md shadow-sm"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 font-bold">รหัสอ้างอิง (PID)</label>
                        <input type="text" value={data.pid} onChange={e => setData((prev: any) => ({ ...prev, pid: e.target.value }))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm" />
                        {errors.pid && <div className="text-red-500 text-xs mt-1">{errors.pid}</div>}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 font-bold">ชื่อคูปอง / รายการ</label>
                        <input
                            type="text"
                            value={data.pname}
                            onChange={e => setData('pname', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            placeholder="เช่น ส่วนลดเงินสด 100 บาท"
                        />
                        {errors.pname && <div className="text-red-500 text-xs mt-1">{errors.pname}</div>}
                    </div>

                    {/* ★ เพิ่มส่วน Remark สำหรับกรอกเงื่อนไข ★ */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">เงื่อนไขการใช้งาน (Remark)</label>
                        <textarea
                            rows={5}
                            value={data.remark}
                            onChange={e => setData('remark', e.target.value)}
                            className="w-full border-gray-300 rounded-md text-sm"
                            placeholder="ระบุเงื่อนไขเป็นข้อๆ เพื่อให้อ่านง่ายบนมือถือ..."
                        />
                        <p className="text-[10px] text-blue-500 mt-1">💡 แนะนำ: ใส่เครื่องหมาย • หน้าข้อความเพื่อความสวยงาม</p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center">
                            💰 คำนวณแต้มอัตโนมัติ (อัตรา 1 แต้ม = {pointRate} บาท)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">มูลค่าคูปอง (บาท)</label>
                                <input
                                    type="number"
                                    value={data.discount_amount}
                                    onChange={handleAmountChange}
                                    className="w-full border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-orange-700 mb-1">แต้มที่ต้องใช้แลก</label>
                                <input
                                    type="number"
                                    value={data.redeem_point}
                                    onChange={e => setData('redeem_point', e.target.value)}
                                    className="w-full border-orange-400 font-bold text-orange-600 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
                        <h4 className="text-sm font-bold text-blue-800 mb-3 tracking-wide">📅 เงื่อนไขวันหมดอายุคูปอง</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">รูปแบบการหมดอายุ</label>
                                <select value={data.expiry_type || 'static'} onChange={e => setData((prev: any) => ({ ...prev, expiry_type: e.target.value }))} className="mt-1 block w-full border-gray-300 rounded-md text-sm">
                                    <option value="static">กำหนดวันที่แน่นอน (Static)</option>
                                    <option value="dynamic">นับจากวันที่ลูกค้ากดรับ (Dynamic)</option>
                                </select>
                            </div>
                            {data.expiry_type === 'static' ? (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">หมดอายุวันที่</label>
                                    <input type="date" value={data.expired_at || ''} onChange={e => setData((prev: any) => ({ ...prev, expired_at: e.target.value }))} className="mt-1 block w-full border-gray-300 rounded-md text-sm" />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">จำนวนวันที่ใช้ได้ (วัน)</label>
                                    <input type="number" value={data.expiry_days || ''} onChange={e => setData((prev: any) => ({ ...prev, expiry_days: e.target.value }))} className="mt-1 block w-full border-gray-300 rounded-md text-sm" placeholder="เช่น 30" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ส่วนการจำกัดสิทธิ์การแลก */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mt-4">
                        <h4 className="text-sm font-bold text-purple-800 mb-3 tracking-wide flex items-center">
                            🔒 จำกัดสิทธิ์การแลก
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">รูปแบบการจำกัดสิทธิ์</label>
                                <select
                                    value={data.usage_limit_type || 'unlimited'}
                                    onChange={e => setData((prev: any) => ({ ...prev, usage_limit_type: e.target.value }))}
                                    className="mt-1 block w-full border-gray-300 rounded-md text-sm"
                                >
                                    <option value="unlimited">ไม่จำกัด</option>
                                    <option value="once">ครั้งเดียวตลอดชีพ</option>
                                    <option value="monthly">จำกัดครั้งต่อเดือน</option>
                                </select>
                            </div>

                            {/* ★ แก้ไขตรงนี้: จะแสดงช่องกรอกตัวเลขก็ต่อเมื่อไม่ได้เลือก 'unlimited' เท่านั้น ★ */}
                            {data.usage_limit_type && data.usage_limit_type !== 'unlimited' ? (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">จำนวนครั้งที่อนุญาต</label>
                                    <input
                                        type="number"
                                        value={data.usage_limit_amount || 1}
                                        onChange={e => setData((prev: any) => ({ ...prev, usage_limit_amount: parseInt(e.target.value) || 1 }))}
                                        className="mt-1 block w-full border-gray-300 rounded-md text-sm"
                                        min="1"
                                    />
                                </div>
                            ) : (
                                /* แสดงข้อความบอกสถานะแทนช่องกรอก เพื่อให้ UI ไม่แหว่ง */
                                <div className="flex items-end pb-2">
                                    <span className="text-xs text-gray-500 italic">ไม่จำกัดจำนวน</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-bold">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ระดับสมาชิกที่ใช้ได้</label>
                            <select value={data.tier_level} onChange={e => setData((prev: any) => ({ ...prev, tier_level: parseInt(e.target.value) }))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="1">Silver ขึ้นไป</option>
                                <option value="2">Gold ขึ้นไป</option>
                                <option value="3">Platinum เท่านั้น</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">จำนวนในสต็อก</label>
                            <input type="number" value={data.stock_qty} onChange={e => setData((prev: any) => ({ ...prev, stock_qty: parseInt(e.target.value) || 0 }))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">วันหมดอายุ (ถ้ามี)</label>
                        <input
                            type="date"
                            value={data.expired_at || ''}
                            disabled={isExisting}
                            onChange={e => setData('expired_at', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        />
                        {errors.expired_at && <div className="text-red-500 text-xs mt-1">{errors.expired_at}</div>}
                    </div>

                    <div className="flex items-center mt-4">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            disabled={isExisting}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="h-4 w-4 border-gray-300 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <label className="ml-2 text-gray-700">เปิดใช้งานทันที</label>
                    </div>
                </div>
            </div>
        </div>
    );
}