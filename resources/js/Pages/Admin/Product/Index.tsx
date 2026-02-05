import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import MobileAuthenticatedLayout from '@/Layouts/MobileAuthenticatedLayout';
import { Link } from "lucide-react";

export default function RewardIndex({ rewards, filters }: { rewards: any, filters: any }) {

    const [filterValues, setFilterValues] = useState({
        search: filters.search || '',
        status: filters.status || '',
    });

    const handleFilterChange = (name: string, value: string) => {
        const newFilters = { ...filterValues, [name]: value };
        setFilterValues(newFilters);

        router.get(route('products.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
            router.delete(route('products.destroy', id));
        }
    }

    return (
        <MobileAuthenticatedLayout>
            <Head title="รายการของรางวัล" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between mb-6">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อหรือรหัส..."
                                value={filterValues.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="rounded-md border-gray-300 text-sm"
                            />
                            <select
                                value={filterValues.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="rounded-md border-gray-300 text-sm"
                            >
                                <option value="">สถานะทั้งหมด</option>
                                <option value="1">ใช้งาน</option>
                                <option value="0">ปิดการใช้งาน</option>
                            </select>
                        </div>
                        <Link href={route('products.create')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            + สร้างของรางวัล
                        </Link>
                    </div>

                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส / ชื่อรางวัล</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Points (S/G/P)</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {rewards.data.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold">{item.reward_code}</div>
                                            <div className="text-xs text-gray-500">{item.reward_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            {item.points_silver} / {item.points_gold} / {item.points_platinum}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            {item.quota_limit_total}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <Link href={route('products.edit', item.id)} className="text-blue-600 mr-3">แก้ไข</Link>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600">ลบ</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* ส่วน Pagination เรียกใช้ Pagination Component */}
                </div>
            </div>
        </MobileAuthenticatedLayout>
    );
}