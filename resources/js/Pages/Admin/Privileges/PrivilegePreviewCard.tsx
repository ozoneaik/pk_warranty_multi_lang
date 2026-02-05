import React from 'react';
import { Image, Eye, Sparkles } from 'lucide-react';

interface PrivilegeData {
    privilege_name: string;
    points_silver: number;
    image_file: File | null;
    image_url: string | null;
}

export default function PrivilegePreviewCard({ data }: { data: PrivilegeData }) {
    const buttonText = "รับสิทธิพิเศษ";

    // คำนวณคะแนน (ถ้าเป็น 0 ให้แสดงว่าฟรี หรือ รับสิทธิ์)
    const points = data.points_silver || 0;
    const isFree = points === 0;

    // หา URL รูปภาพ
    const getDisplayImage = () => {
        if (data.image_file) {
            return URL.createObjectURL(data.image_file);
        }
        return data.image_url || null;
    };

    const displayImage = getDisplayImage();

    return (
        <div className="sticky top-6 transition-all duration-300">
            {/* กรอบ Preview สำหรับ Admin */}
            <div className="bg-gray-100/50 p-6 rounded-2xl border-2 border-gray-300 border-dashed flex flex-col items-center">
                <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm font-medium">
                    <Eye className="w-4 h-4" /> Live User Preview
                </div>

                {/* --- Card UI (จำลองหน้าบ้าน) --- */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-[280px] mx-auto transform hover:scale-[1.02] transition-transform duration-300">

                    {/* Header จำลอง Application Bar */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 text-[10px] text-center text-green-600 font-bold border-b border-green-100 tracking-wider uppercase flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3" /> Privilege Item
                    </div>

                    {/* Card Content */}
                    <div className="relative group flex flex-col h-full">

                        {/* Image Area */}
                        <div className="w-full h-44 bg-white flex items-center justify-center overflow-hidden relative border-b border-gray-50">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt="Preview"
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-gray-300">
                                    <Image className="w-12 h-12 mb-2 opacity-40" />
                                    <span className="text-xs font-medium">No Image</span>
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="p-4 flex flex-col gap-3 flex-grow justify-between">
                            <div>
                                {/* Name */}
                                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[40px] leading-snug">
                                    {data.privilege_name || "ชื่อสิทธิพิเศษ..."}
                                </h3>

                                {/* Points Badge (ธีมสีเขียว) */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white to-green-50 border border-green-200 flex items-center justify-center text-[10px] font-extrabold text-green-700 shadow-sm">
                                        P
                                    </div>
                                    <span className="text-base font-black text-green-700">
                                        {isFree ? "Free" : points.toLocaleString()}
                                        {!isFree && <span className="text-[10px] font-normal text-gray-500 ml-1">คะแนน</span>}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button (สีเขียว) */}
                            <button disabled className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg shadow-md opacity-90 hover:bg-green-700 transition-colors">
                                {buttonText}
                            </button>
                        </div>
                    </div>
                </div>
                {/* --- จบ Card UI --- */}

                <p className="text-[10px] text-center text-gray-400 mt-4 px-4">
                    * สีและรูปแบบปุ่มอ้างอิงจากธีม "สิทธิพิเศษ" ของแอปพลิเคชัน
                </p>
            </div>
        </div>
    );
};