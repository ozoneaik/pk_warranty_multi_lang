import React from 'react';
import { useForm, Link } from '@inertiajs/react';

interface PointFormData {
    process_code: string;
    process_name: string;
    transaction_type: 'earn' | 'redeem';
    default_point: number;
    point_silver: number;
    point_gold: number;
    point_platinum: number;
    description: string;
    is_active: boolean;
}

interface PointFormProps {
    initialData?: Partial<PointFormData> & { id?: number | string };
    isEdit?: boolean;
}

export default function PointForm({ initialData = {}, isEdit = false }: PointFormProps) {
    const { data, setData, post, put, processing, errors } = useForm<PointFormData>({
        process_code: initialData.process_code || '',
        process_name: initialData.process_name || '',
        transaction_type: (initialData.transaction_type as 'earn' | 'redeem') || 'earn',
        default_point: initialData.default_point ?? 0,
        point_silver: initialData.point_silver ?? 0,
        point_gold: initialData.point_gold ?? 0,
        point_platinum: initialData.point_platinum ?? 0,
        description: initialData.description || '',
        is_active: initialData.is_active !== undefined ? Boolean(initialData.is_active) : true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.points.update', initialData.id) as string);
        } else {
            post(route('admin.points.store') as string);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">รหัสเงื่อนไข (Process Code)</label>
                    <input
                        type="text"
                        value={data.process_code}
                        onChange={e => setData('process_code', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="e.g., BIRTHDAY_POINT"
                    />
                    {errors.process_code && <div className="text-red-500 text-xs mt-1">{errors.process_code}</div>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อเงื่อนไข</label>
                    <input
                        type="text"
                        value={data.process_name}
                        onChange={e => setData('process_name', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="e.g., คะแนนวันเกิด"
                    />
                    {errors.process_name && <div className="text-red-500 text-xs mt-1">{errors.process_name}</div>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">ประเภทธุรกรรม</label>
                <select
                    value={data.transaction_type}
                    onChange={e => setData('transaction_type', e.target.value as 'earn' | 'redeem')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="earn">ได้รับแต้ม (Earn)</option>
                    <option value="redeem">ใช้แต้ม (Redeem)</option>
                </select>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">การตั้งค่าคะแนน</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Default Point</label>
                        <input
                            type="number"
                            value={data.default_point}
                            onChange={e => setData('default_point', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm font-bold"
                        />
                        {errors.default_point && <div className="text-red-500 text-xs mt-1">{errors.default_point}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Silver Point</label>
                        <input
                            type="number"
                            value={data.point_silver}
                            onChange={e => setData('point_silver', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            placeholder="Optional"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-yellow-600">Gold Point</label>
                        <input
                            type="number"
                            value={data.point_gold}
                            onChange={e => setData('point_gold', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-yellow-300 ring-1 ring-yellow-200 rounded-md shadow-sm"
                            placeholder="Optional"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-purple-600">Platinum Point</label>
                        <input
                            type="number"
                            value={data.point_platinum}
                            onChange={e => setData('point_platinum', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full border-purple-300 ring-1 ring-purple-200 rounded-md shadow-sm"
                            placeholder="Optional"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">* หาก Silver/Gold/Platinum เป็น 0 ระบบจะใช้ค่า Default Point แทน</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">รายละเอียดเพิ่มเติม (Optional)</label>
                <textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    rows={3}
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={e => setData('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">เปิดใช้งาน (Active)</label>
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isEdit ? 'บันทึกการแก้ไข' : 'สร้างเงื่อนไขใหม่'}
                </button>
                <Link href={route('admin.points.index') as string} className="text-gray-600 hover:text-gray-900">ยกเลิก</Link>
            </div>
        </form>
    );
}