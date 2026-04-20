{{-- resources/views/auth/register/_terms-content.blade.php --}}
{{-- เนื้อหาข้อกำหนดและเงื่อนไข (ลอกจาก resources/js/Pages/Profile/Customer/InfoTerm.tsx) --}}

{!! \App\Models\MasterWaaranty\Setting::get('registration_terms', '
    <p class="text-gray-500 leading-relaxed">
        นโยบายการใช้คุกกี้นี้ จะอธิบายถึงประเภท เหตุผล และลักษณะการใช้คุกกี้ รวมถึงวิธีการจัดการคุกกี้
        ของเว็บไซต์ทั้งหมดของ <strong>บริษัท พัมคิน คอร์ปอเรชั่น จำกัด</strong>
    </p>
    <div>
        <p class="font-bold text-gray-800 mt-3 mb-1">1. คุกกี้ (Cookies) คืออะไร ?</p>
        <p class="text-gray-500 text-sm pl-3 leading-relaxed">คุกกี้ คือ ข้อมูลคอมพิวเตอร์ขนาดเล็กที่จะจดจำข้อมูลการใช้งานของท่าน</p>
    </div>
    <div class="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs text-orange-700 mt-3">
        ⚠️ การสมัครสมาชิกถือว่าท่านยอมรับข้อกำหนดและเงื่อนไขทั้งหมดของบริษัทฯ
    </div>
') !!}
