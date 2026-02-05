import React, { useState } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import axios from 'axios';

/* =======================
   Types
======================= */
interface ToggleSwitchProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

interface Reward {
    id: number;
    reward_name: string;
    reward_code: string;
    rewards_id?: string;

    points_silver: number;
    points_gold: number;
    points_platinum: number;

    image_url?: string;
    description?: string;
    qr_code_description?: string;

    quota_limit_total: number;
    quota_limit_per_user: number;

    is_missions_only: boolean;
    is_auto_timer: boolean;
    is_stock_control: boolean;
    is_thermal_printer: boolean;
    is_big_commerce: boolean;
    is_active: boolean;

    delivery_type: string;
    visibility_settings: string;

    start_date?: string;
    end_date?: string;
}

interface CreateRewardProps {
    reward?: Reward | null;
    isEdit?: boolean;
}

/* =======================
   Toggle Switch Component
======================= */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    label,
    description,
    checked,
    onChange
}) => (
    <div className="flex items-start justify-between py-3 border-b last:border-0">
        <div>
            <h3 className="text-sm font-medium text-gray-900">{label}</h3>
            {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                checked ? 'bg-blue-600' : 'bg-gray-200'
            }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    </div>
);

/* =======================
   Main Component
======================= */
export default function CreateReward({
    reward = null,
    isEdit = false
}: CreateRewardProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        reward_name: reward?.reward_name ?? '',
        reward_code: reward?.reward_code ?? '',
        rewards_id: reward?.rewards_id ?? '',

        points_silver: reward?.points_silver ?? 0,
        points_gold: reward?.points_gold ?? 0,
        points_platinum: reward?.points_platinum ?? 0,

        image_url: reward?.image_url ?? '',
        description: reward?.description ?? '',
        qr_code_description: reward?.qr_code_description ?? '',

        quota_limit_total: reward?.quota_limit_total ?? 0,
        quota_limit_per_user: reward?.quota_limit_per_user ?? 1,

        is_missions_only: reward?.is_missions_only ?? false,
        is_auto_timer: reward?.is_auto_timer ?? false,
        is_stock_control: reward?.is_stock_control ?? false,
        is_thermal_printer: reward?.is_thermal_printer ?? false,
        is_big_commerce: reward?.is_big_commerce ?? false,
        is_active: reward?.is_active ?? true,

        delivery_type: reward?.delivery_type ?? 'receive_at_store',
        visibility_settings: reward?.visibility_settings ?? 'both',

        start_date: reward?.start_date
            ? new Date(reward.start_date).toISOString().slice(0, 16)
            : '',
        end_date: reward?.end_date
            ? new Date(reward.end_date).toISOString().slice(0, 16)
            : '',
    });

    const [isSearching, setIsSearching] = useState(false);

    /* =======================
       Search API
    ======================= */
    const handleSearch = async () => {
        if (!data.reward_code) {
            alert('กรุณากรอกรหัสสินค้าก่อนค้นหา');
            return;
        }

        setIsSearching(true);
        try {
            const res = await axios.get(route('products.search.api'), {
                params: { search: data.reward_code }
            });

            if (res.data.status === 'NEW') {
                const apiData = res.data.data;
                setData(prev => ({
                    ...prev,
                    reward_name: apiData.reward_name,
                    image_url: apiData.image_url ?? prev.image_url,
                    quota_limit_total: apiData.quota_limit_total ?? 0,
                }));
            }
        } catch (error: any) {
            alert(error?.response?.data?.error || 'ไม่พบข้อมูลสินค้า');
        } finally {
            setIsSearching(false);
        }
    };

    /* =======================
       Submit
    ======================= */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && reward) {
            put(route('products.update', reward.id));
        } else {
            post(route('products.store'));
        }
    };

    /* =======================
       Render
    ======================= */
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Head title={isEdit ? 'แก้ไขของรางวัล' : 'สร้างของรางวัล'} />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Toggles */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <ToggleSwitch
                            label="เปิดใช้งาน (Active)"
                            checked={data.is_active}
                            onChange={(val: boolean) => setData('is_active', val)}
                        />
                        <ToggleSwitch
                            label="Missions Only"
                            description="แสดงเฉพาะเมื่อทำภารกิจสำเร็จ"
                            checked={data.is_missions_only}
                            onChange={(val: boolean) => setData('is_missions_only', val)}
                        />
                        <ToggleSwitch
                            label="Auto Timer"
                            checked={data.is_auto_timer}
                            onChange={(val: boolean) => setData('is_auto_timer', val)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md"
                    >
                        {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>

                </form>
            </div>
        </div>
    );
}