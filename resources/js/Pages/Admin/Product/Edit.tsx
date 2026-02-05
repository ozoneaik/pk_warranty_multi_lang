import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import RewardCouponForm from './RewardCouponForm';
import PrivilegeForm from './PrivilegeForm';
import CouponForm from './CouponForm';
import Swal from 'sweetalert2';

// กำหนด Configuration
const PRODUCT_TYPES = [
    { id: 'reward', label: 'ของรางวัล (Reward)', color: 'blue', icon: '🎁' },
    { id: 'privilege', label: 'สิทธิพิเศษ (Privilege)', color: 'purple', icon: '⭐' },
    { id: 'coupon', label: 'คูปอง (Coupon)', color: 'orange', icon: '🎫' },
];
const GLOBAL_POINT_RATE = 0.25;
export default function EditProduct({ product, pointProcesses = [] }: { product: any, pointProcesses: any[] }) {

    // ใช้ State จัดการประเภทสินค้า (เผื่อต้องการเปลี่ยนประเภทตอนแก้ไข)
    const [currentType, setCurrentType] = useState(product.product_type);
    const currentTypeConfig = PRODUCT_TYPES.find(t => t.id === currentType) || PRODUCT_TYPES[0];

    // Define Interface
    interface ProductForm {
        pid: string;
        pname: string;
        discount_amount: number;
        point_value_rate: number;
        image_url: string;
        tier_level: number;
        product_type: string;
        redeem_point: number;
        earn_point: number;
        stock_qty: number;
        expired_at: string | null;
        is_active: boolean;
        type_ref: number | null;
        expiry_type: string;
        expiry_days: number | null;
        usage_limit_type: string;
        usage_limit_amount: number | null;
        remark: string;
    }

    const { data, setData, put, processing, errors, transform } = useForm<ProductForm>({
        pid: product.pid,
        pname: product.pname,
        discount_amount: Number(product.discount_amount),
        point_value_rate: Number(product.point_value_rate),
        image_url: product.image_url || '',
        tier_level: Number(product.tier_level),
        product_type: product.product_type,
        redeem_point: Number(product.redeem_point),
        earn_point: Number(product.earn_point || 0),
        stock_qty: Number(product.stock_qty),
        expired_at: product.expired_at || '',
        is_active: Boolean(product.is_active),
        type_ref: product.type_ref ? Number(product.type_ref) : null,
        expiry_type: product.expiry_type || 'static',
        expiry_days: product.expiry_days ? Number(product.expiry_days) : null,
        usage_limit_type: product.usage_limit_type || 'unlimited',
        usage_limit_amount: product.usage_limit_amount ? Number(product.usage_limit_amount) : 1,
        remark: product.remark || '',
    });

    // Transform ข้อมูลก่อนส่ง
    transform((data) => ({
        ...data,
        // ถ้าเป็น static ให้ส่งวันที่ ถ้าไม่ใช่ให้ล้างเป็น null
        expired_at: data.expiry_type === 'static' ? data.expired_at : null,

        // ถ้าเป็น dynamic ให้ส่งจำนวนวัน ถ้าไม่ใช่ให้ล้างเป็น null
        expiry_days: data.expiry_type === 'dynamic' ? Number(data.expiry_days) : null,

        redeem_point: Number(data.redeem_point),
        earn_point: Number(data.earn_point),
        stock_qty: Number(data.stock_qty),
        product_type: currentType,
        usage_limit_amount: data.usage_limit_type !== 'unlimited' ? Number(data.usage_limit_amount) : null,
        remark: data.remark || '',
    }));

    // Update Product Type in form data when tab changes
    useEffect(() => {
        setData('product_type', currentType);
    }, [currentType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = route('admin.products.update', product.id) as string;

        put(url, {
            onSuccess: () => {
                // Redirect handled by controller
                Toast.fire({
                    icon: 'success',
                    title: 'อัพเดทสําเร็จ',
                });
            },
            onError: () => {
                console.error(errors);
                Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบฟิลด์ต่างๆ", "error");
            },
        });
    };

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // Helper functions for styles
    const getBorderColor = () => {
        switch (currentType) {
            case 'reward': return 'border-blue-500';
            case 'privilege': return 'border-purple-500';
            case 'coupon': return 'border-orange-500';
            default: return 'border-gray-200';
        }
    };

    const getBtnColor = () => {
        switch (currentType) {
            case 'reward': return 'bg-blue-600 hover:bg-blue-700';
            case 'privilege': return 'bg-purple-600 hover:bg-purple-700';
            case 'coupon': return 'bg-orange-600 hover:bg-orange-700';
            default: return 'bg-gray-600';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.products.index') as string}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">แก้ไขสินค้า: {product.pid}</h2>
                </div>
            }
        >
            <Head title="แก้ไขสินค้า" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">

                    {/* Tabs เลือกประเภท (เผื่อต้องการเปลี่ยนประเภทสินค้า) */}
                    <div className="mb-6 bg-white rounded-lg shadow p-2 flex space-x-2">
                        {PRODUCT_TYPES.map((type) => {
                            const isLocked = true;
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    // ห้ามกดถ้า Locked และไม่ใช่ Tab ปัจจุบัน
                                    disabled={isLocked && currentType !== type.id}
                                    onClick={() => !isLocked && setCurrentType(type.id)}
                                    className={`flex-1 py-3 rounded-md text-sm font-bold transition-all duration-200 flex items-center justify-center space-x-2
                                        ${currentType === type.id
                                            ? `bg-${type.color}-50 text-${type.color}-700 ring-2 ring-${type.color}-500`
                                            : 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-60' // Style สำหรับปุ่มที่ถูก Disable
                                        }
                                    `}
                                >
                                    <span className="text-xl">{type.icon}</span>
                                    <span>{type.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className={`bg-white p-6 rounded-lg shadow border-t-4 ${getBorderColor()}`}>
                        <form onSubmit={handleSubmit}>

                            {/* เลือกแสดง Component ตามประเภทสินค้า */}
                            {currentType === 'privilege' ? (
                                <PrivilegeForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    isExisting={false} // ในหน้า Edit ต้องเป็น false เพื่อให้แก้ไขได้
                                    pointProcesses={pointProcesses}
                                    isEdit={true}
                                />
                            ) : currentType === 'coupon' ? (
                                <CouponForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    isExisting={false}
                                    typeLabel={currentTypeConfig.label}
                                    typeIcon={currentTypeConfig.icon}
                                    productTypes={PRODUCT_TYPES}
                                    pointRate={GLOBAL_POINT_RATE}
                                />
                            ) : (
                                <RewardCouponForm
                                    data={data}
                                    setData={setData}
                                    errors={errors}
                                    isExisting={false} // ในหน้า Edit ต้องเป็น false เพื่อให้แก้ไขได้
                                    typeLabel={currentTypeConfig.label}
                                    typeIcon={currentTypeConfig.icon}
                                    productTypes={PRODUCT_TYPES}
                                    pointProcesses={pointProcesses}
                                />
                            )}

                            <div className="pt-6 border-t mt-6 flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`flex-1 font-bold py-2 px-4 rounded transition text-white ${getBtnColor()} disabled:opacity-50`}
                                >
                                    {processing ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                </button>
                                <Link
                                    href={route('admin.products.index') as string}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}