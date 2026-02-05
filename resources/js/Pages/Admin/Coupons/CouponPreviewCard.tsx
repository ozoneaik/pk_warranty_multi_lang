import React from 'react';
import { Image, Eye, Ticket } from 'lucide-react';

interface CouponData {
    name: string;
    discount_value: string | number;
    discount_unit: string; // 'BAHT' | 'PERCENT' | 'POINT'
    image_file: File | null;
    image_url: string | null;
}

export default function CouponPreviewCard({ data }: { data: CouponData }) {
    const buttonText = "แลกคูปอง";

    // จัดการรูปภาพ
    const getDisplayImage = () => {
        if (data.image_file) {
            return URL.createObjectURL(data.image_file);
        }
        return data.image_url || null;
    };

    const displayImage = getDisplayImage();

    // จัดการหน่วยส่วนลด
    const getDiscountLabel = () => {
        const val = data.discount_value || 0;
        switch (data.discount_unit) {
            case 'PERCENT': return `${val}%`;
            case 'POINT': return `${val} คะแนน`;
            default: return `${val} ฿`; // BAHT
        }
    };

    return (
        <div className="sticky top-6 transition-all duration-300">
            {/* กรอบ Preview สำหรับ Admin */}
            <div className="bg-gray-100/50 p-6 rounded-2xl border-2 border-gray-300 border-dashed flex flex-col items-center">
                <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm font-medium">
                    <Eye className="w-4 h-4" /> Live User Preview
                </div>

                {/* --- Card UI (จำลองหน้าบ้าน Coupon) --- */}
                {/* เอกลักษณ์ของคูปอง: border-dashed */}
                <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 overflow-hidden w-full max-w-[280px] mx-auto transform hover:scale-[1.02] transition-transform duration-300 relative">

                    {/* Header จำลอง */}
                    <div className="bg-blue-50 px-4 py-2 text-[10px] text-center text-blue-600 font-bold border-b border-blue-100 tracking-wider uppercase flex items-center justify-center gap-1">
                        <Ticket className="w-3 h-3" /> Coupon Item
                    </div>

                    {/* Card Content */}
                    <div className="relative group flex flex-col h-full">

                        {/* Image Area */}
                        <div className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden relative border-b border-dashed border-gray-200">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt="Preview"
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-gray-300">
                                    <Image className="w-10 h-10 mb-2 opacity-40" />
                                    <span className="text-xs font-medium">No Image</span>
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="p-4 flex flex-col gap-3">
                            <div>
                                {/* Name */}
                                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[40px] leading-snug">
                                    {data.name || "ชื่อคูปองส่วนลด..."}
                                </h3>

                                {/* Discount Badge */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[10px] font-extrabold text-blue-600 shadow-sm">
                                        %
                                    </div>
                                    <span className="text-base font-black text-gray-700">
                                        ส่วนลด {getDiscountLabel()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button (สีฟ้า) */}
                            <button disabled className="w-full py-2 bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md opacity-90 hover:bg-blue-600 transition-colors">
                                {buttonText}
                            </button>
                        </div>
                    </div>
                </div>
                {/* --- จบ Card UI --- */}

                <p className="text-[10px] text-center text-gray-400 mt-4 px-4">
                    * คูปองจะแสดงผลด้วยกรอบเส้นประ (Dashed Border) และธีมสีฟ้าในแอปพลิเคชัน
                </p>
            </div>
        </div>
    );
};