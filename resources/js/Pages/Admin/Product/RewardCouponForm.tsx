import React from 'react';

interface RewardCouponFormProps {
    data: any;
    setData: any;
    errors: any;
    isExisting: boolean;
    typeLabel: string;
    typeIcon: string;
    productTypes: { id: string, label: string }[];
    pointProcesses: any[];
    onTypeChange?: (newType: string) => void;
    remark?: string
}



export default function RewardCouponForm({ data, setData, errors, isExisting, typeLabel, typeIcon, productTypes, pointProcesses }: RewardCouponFormProps) {

    React.useEffect(() => {
        // ทำงานเฉพาะตอนสร้างใหม่ (isExisting = false) และยังไม่มีการเลือก type_ref
        if (!isExisting && !data.type_ref && pointProcesses.length > 0) {
            // หา Process ที่มี code เป็น 'REDEEM' (ปรับเปลี่ยนรหัสได้ตามฐานข้อมูลของคุณ)
            const defaultProcess = pointProcesses.find(p =>
                p.process_code.toUpperCase() === 'REDEEM'
            );

            if (defaultProcess) {
                setData('type_ref', defaultProcess.id);
            }
        }
    }, [pointProcesses, isExisting]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1: รูปภาพ & รหัส */}
            <div className="md:col-span-1 text-center">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4 border border-gray-200 overflow-hidden relative group">
                    {data.image_url ? (
                        <img src={data.image_url} alt="Product" className={`w-full h-full object-cover ${isExisting ? 'opacity-75' : ''}`} />
                    ) : (
                        <div className="flex flex-col items-center"><span className="text-4xl mb-2">{typeIcon}</span><span>No Image</span></div>
                    )}
                </div>

                <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700">รหัสสินค้า (PID)</label>
                    <input
                        type="text"
                        value={data.pid}
                        disabled={true} // Reward มาจาก Search เสมอ ห้ามแก้
                        className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                    />
                    {errors.pid && <div className="text-red-500 text-xs mt-1">{errors.pid}</div>}
                </div>

                <div className="text-left mt-2">
                    <label className="block text-xs text-gray-500">URL รูปภาพ</label>
                    <input
                        type="text"
                        value={data.image_url}
                        disabled={isExisting}
                        readOnly
                        onChange={e => setData('image_url', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md text-xs text-gray-500"
                    />
                </div>
            </div>

            {/* Column 2: ข้อมูลสินค้า */}
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อรายการ</label>
                    <input
                        type="text"
                        value={data.pname}
                        disabled={isExisting}
                        onChange={e => setData('pname', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                    {errors.pname && <div className="text-red-500 text-xs mt-1">{errors.pname}</div>}
                </div>

                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                        Type Reference (อ้างอิงเงื่อนไขคะแนน)
                    </label>
                    <select
                        value={data.type_ref || ''}
                        disabled={isExisting}
                        onChange={e => setData('type_ref', parseInt(e.target.value) || null)}
                        className="block w-full border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="">-- ไม่ระบุ (กำหนดคะแนนเอง) --</option>
                        {pointProcesses.map((p: any) => (
                            <option key={p.id} value={p.id}>
                                {p.process_name} ({p.process_code})
                            </option>
                        ))}
                    </select>
                    {/* แสดงข้อความเตือนเพื่อให้ Admin ทราบว่ามีการเลือกให้อัตโนมัติ */}
                    {/* {!isExisting && data.type_ref && (
                        <p className="text-[10px] text-green-600 mt-1 font-bold">
                            * ระบบเลือก "{pointProcesses.find(p => p.id === data.type_ref)?.process_name}" ให้อัตโนมัติ
                        </p>
                    )} */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ประเภท</label>
                        <select
                            value={data.product_type}
                            disabled={isExisting}
                            onChange={e => setData('product_type', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {/* กรองเอาเฉพาะ Type ที่ไม่ใช่ Privilege (หรือจะเอาหมดก็ได้แล้วแต่ logic) */}
                            {productTypes.filter(t => t.id !== 'privilege').map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ระดับสมาชิกขั้นต่ำ</label>
                        <select
                            value={data.tier_level}
                            disabled={isExisting}
                            onChange={e => setData('tier_level', parseInt(e.target.value))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="1">Silver</option>
                            <option value="2">Gold</option>
                            <option value="3">Platinum</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">คะแนนที่ใช้แลก (Redeem)</label>
                        <input
                            type="number"
                            value={data.redeem_point}
                            disabled={isExisting}
                            onChange={e => setData('redeem_point', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        />
                        {errors.redeem_point && <div className="text-red-500 text-xs mt-1">{errors.redeem_point}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">จำนวนในสต็อก</label>
                        <input
                            type="number"
                            value={data.stock_qty}
                            disabled={isExisting}
                            onChange={e => setData('stock_qty', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        />
                        {errors.stock_qty && <div className="text-red-500 text-xs mt-1">{errors.stock_qty}</div>}
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
                {/* ★ เพิ่มส่วน Remark สำหรับกรอกเงื่อนไข ★ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 font-bold">เงื่อนไขการใช้งาน (Remark)</label>
                    <textarea
                        rows={4}
                        value={data.remark || ''}
                        onChange={e => setData('remark', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                        disabled={isExisting}
                        placeholder="กรอกเงื่อนไขการใช้งาน (Remark)"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">* เงื่อนไขนี้จะไปแสดงในหน้าแอปฯ เมื่อผู้ใช้กดดูรายละเอียดคูปอง</p>
                </div>
                <div className="flex items-center mt-4">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        disabled={isExisting}
                        onChange={e => setData('is_active', e.target.checked)}
                        className="h-4 w-4 border-gray-300 rounded text-blue-600"
                    />
                    <label className="ml-2 text-gray-700">เปิดใช้งานทันที</label>
                </div>
            </div>
        </div>
    );
}