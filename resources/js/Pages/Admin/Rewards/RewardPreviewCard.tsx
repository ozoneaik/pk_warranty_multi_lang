// resources/js/Components/Admin/RewardPreviewCard.tsx
import React from 'react';
import { Image, Eye } from 'lucide-react';

interface RewardData {
    reward_name: string;
    // เพิ่ม field member_group เพื่อใช้ตัดสินใจเลือกคะแนนที่จะโชว์
    member_group: string;
    points_silver: number;
    points_gold: number;
    points_platinum: number;
    image_file: File | null;
    image_url: string | null;
}

export default function RewardPreviewCard({ data }: { data: RewardData }) {
    const buttonText = "แลกของรางวัล";

    // --- Logic เลือกคะแนนที่จะแสดง ---
    // ถ้าเลือกเฉพาะกลุ่ม ให้โชว์คะแนนกลุ่มนั้น
    // ถ้าเลือก All ให้โชว์ Silver (เป็นฐาน) หรืออาจจะทำเป็น logic อื่นตามต้องการ
    let displayPoints = 0;

    switch (data.member_group) {
        case 'Gold':
            displayPoints = data.points_gold;
            break;
        case 'Platinum':
            displayPoints = data.points_platinum;
            break;
        case 'Silver':
        default:
            // กรณีเป็น All หรือ Silver ให้ใช้ Silver เป็นตัวตั้งต้น
            // หรือถ้า Silver เป็น 0 อาจจะไปเช็ค Gold/Platinum ต่อก็ได้
            displayPoints = data.points_silver > 0 ? data.points_silver : (data.points_gold > 0 ? data.points_gold : data.points_platinum);
            break;
    }

    return (
        <div className="sticky top-6 transition-all duration-300">
            <div className="bg-gray-100/50 p-6 rounded-2xl border border-gray-200 border-dashed flex flex-col items-center">
                <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm font-medium">
                    <Eye className="w-4 h-4" /> Live Preview
                </div>

                {/* --- Card UI --- */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-[280px] mx-auto transition-all duration-300">
                    {/* Header จำลอง */}
                    <div className="bg-gray-50 px-4 py-2 text-[10px] text-center text-gray-400 font-medium border-b uppercase tracking-wider">
                        User View Example
                    </div>

                    {/* Card Body */}
                    <div className="relative group">
                        {/* Image Area */}
                        <div className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                            {data.image_file || data.image_url ? (
                                <img
                                    src={data.image_file ? URL.createObjectURL(data.image_file) : (data.image_url || '')}
                                    alt="Preview"
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center">
                                    <Image className="w-10 h-10 mb-2 opacity-50" />
                                    <span className="text-xs">No Image</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex flex-col gap-3">
                            {/* Name */}
                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[40px] leading-tight">
                                {data.reward_name || "ชื่อของรางวัล..."}
                            </h3>

                            {/* Points (ส่วนที่แก้ไข) */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center text-[10px] font-bold text-yellow-600 shadow-sm">
                                    P
                                </div>
                                <span className="text-base font-black text-gray-700">
                                    {/* ใช้ตัวแปรที่คำนวณไว้ด้านบน */}
                                    {displayPoints.toLocaleString()}
                                    <span className="text-[10px] font-normal text-gray-400 ml-1">คะแนน</span>
                                </span>
                            </div>

                            {/* Button */}
                            <button disabled className="w-full py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-lg shadow-md opacity-90">
                                {buttonText}
                            </button>
                        </div>
                    </div>
                </div>
                {/* --- End Card UI --- */}

                <p className="text-xs text-center text-gray-400 mt-4 px-4">
                    * Preview นี้แสดงคะแนนของระดับ {data.member_group === 'all' ? 'Silver' : data.member_group}
                </p>
            </div>
        </div>
    );
};