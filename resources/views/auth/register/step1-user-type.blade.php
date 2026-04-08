{{-- resources/views/auth/register/step1-user-type.blade.php --}}
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ลงทะเบียนสมาชิกใหม่ — เลือกประเภทผู้ใช้งาน</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body {
            font-family: 'Sarabun', sans-serif;
            background-color: #f8fafc;
        }

        /* Card Interactions */
        .type-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .type-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -8px rgba(249, 115, 22, 0.15);
            /* orange-500 shadow */
            border-color: #fdba74;
            /* orange-300 */
        }

        .type-card.selected {
            border-color: #f97316;
            /* orange-500 */
            background-color: #fff7ed;
            /* orange-50 */
            box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
            /* orange-500 shadow */
        }

        .type-card.selected .icon-container {
            background-color: #f97316;
            /* orange-500 */
            color: #ffffff;
            transform: scale(1.05);
        }

        .type-card.selected .check-icon {
            opacity: 1;
            transform: scale(1);
        }

        .icon-container {
            transition: all 0.3s ease;
        }

        /* Button */
        .btn-gradient {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            /* Orange 500 to Orange 600 */
            transition: all 0.3s ease;
        }

        .btn-gradient:hover:not(:disabled) {
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
            /* Orange 600 to Orange 700 */
            transform: translateY(-2px);
            box-shadow: 0 8px 20px -6px rgba(249, 115, 22, 0.4);
        }

        .btn-gradient:disabled {
            background: #cbd5e1;
            color: #94a3b8;
            cursor: not-allowed;
            box-shadow: none;
        }
    </style>
</head>

<body class="min-h-screen flex items-center justify-center py-10 px-4">

    <div class="w-full max-w-lg">

        {{-- Header & Avatar --}}
        <div class="text-center mb-8">
            @isset($data['avatar'])
            <div class="relative inline-block mb-4">
                <div class="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-40"></div>
                <img src="{{ $data['avatar'] }}" class="relative w-20 h-20 rounded-full mx-auto border-4 border-white shadow-md object-cover">
            </div>
            @endisset

            @php
            $isUpdateMode = !empty($data['is_update_mode']);
            @endphp

            <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
                {{ $isUpdateMode ? 'สมัครสมาชิก (1/3)' : 'สมัครสมาชิก (1/3)' }}
            </h1>
            <p class="text-sm text-slate-500 mt-2">
                {{ $isUpdateMode ? 'กรุณาเลือกประเภทการใช้งาน' : 'กรุณาเลือกประเภทการใช้งาน' }}
            </p>
        </div>

        {{-- Minimal Progress Bar --}}
        <div class="mb-8 px-8">
            <div class="flex items-center justify-between relative">
                <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-10"></div>
                <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shadow-md border-4 border-white ring-1 ring-orange-100">1</div>
                    <span class="text-xs font-semibold text-orange-600 mt-2">ประเภท</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full bg-white text-slate-400 flex items-center justify-center font-semibold border-2 border-slate-200">2</div>
                    <span class="text-xs text-slate-400 mt-2">ข้อมูลส่วนตัว</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-8 h-8 rounded-full bg-white text-slate-400 flex items-center justify-center font-semibold border-2 border-slate-200">3</div>
                    <span class="text-xs text-slate-400 mt-2">ที่อยู่</span>
                </div>
            </div>
        </div>

        {{-- Form Container --}}
        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">

            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-slate-700">เลือกประเภทผู้ใช้งาน</h2>
                <span class="text-xs font-medium text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">เลือก 1 ข้อ</span>
            </div>

            @if(session('error'))
            <div class="bg-red-50 border-l-4 border-red-500 text-red-600 text-sm rounded-r-lg px-4 py-3 mb-6">
                {{ session('error') }}
            </div>
            @endif

            <form action="{{ route('register.step1.store') }}" method="POST" id="step1Form">
                @csrf
                <input type="hidden" name="crm_user_type_id" id="crm_user_type_id" value="">

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

                    {{-- 1. เจ้าของธุรกิจ --}}
                    <div class="type-card bg-white border-2 border-slate-100 rounded-2xl p-5 relative cursor-pointer group" data-id="1" onclick="selectType(this)">
                        <div class="check-icon absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white opacity-0 transform scale-50 transition-all duration-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="icon-container w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:bg-amber-100">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 class="font-bold text-slate-800">เจ้าของธุรกิจ</h3>
                        <p class="text-xs text-slate-400 mt-1">Business Owner</p>
                    </div>

                    {{-- 2. ผู้ใช้งานทั่วไป --}}
                    <div class="type-card bg-white border-2 border-slate-100 rounded-2xl p-5 relative cursor-pointer group" data-id="2" onclick="selectType(this)">
                        <div class="check-icon absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white opacity-0 transform scale-50 transition-all duration-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="icon-container w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:bg-blue-100">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 class="font-bold text-slate-800">ผู้ใช้งานทั่วไป</h3>
                        <p class="text-xs text-slate-400 mt-1">General User</p>
                    </div>

                    {{-- 3. ช่าง --}}
                    <div class="type-card bg-white border-2 border-slate-100 rounded-2xl p-5 relative cursor-pointer group" data-id="3" onclick="selectType(this)">
                        <div class="check-icon absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white opacity-0 transform scale-50 transition-all duration-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="icon-container w-14 h-14 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-4 group-hover:bg-pink-100">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 class="font-bold text-slate-800">ช่าง</h3>
                        <p class="text-xs text-slate-400 mt-1">Technician</p>
                    </div>

                    {{-- 4. ดีลเลอร์ --}}
                    <div class="type-card bg-white border-2 border-slate-100 rounded-2xl p-5 relative cursor-pointer group" data-id="4" onclick="selectType(this)">
                        <div class="check-icon absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white opacity-0 transform scale-50 transition-all duration-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="icon-container w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4 group-hover:bg-violet-100">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 class="font-bold text-slate-800">ดีลเลอร์</h3>
                        <p class="text-xs text-slate-400 mt-1">Dealer / Partner</p>
                    </div>

                </div>

                <div id="typeError" class="text-red-500 text-sm font-medium mb-4 hidden flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    กรุณาเลือกประเภทผู้ใช้งานก่อนทำรายการต่อ
                </div>

                <button type="submit" id="btnNext" disabled class="btn-gradient w-full text-white font-bold py-3.5 rounded-xl text-base flex items-center justify-center gap-2">
                    ดำเนินการต่อ
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </form>
        </div>

    </div>

    <script>
        function selectType(el) {
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            document.getElementById('crm_user_type_id').value = el.dataset.id;
            document.getElementById('btnNext').disabled = false;
            document.getElementById('typeError').classList.add('hidden');
        }

        document.getElementById('step1Form').addEventListener('submit', function(e) {
            if (!document.getElementById('crm_user_type_id').value) {
                e.preventDefault();
                document.getElementById('typeError').classList.remove('hidden');
            }
        });

        // ฟังก์ชันอ่านค่าเก่าและทำการเลือกแบบอัตโนมัติ (Auto-Select)
        document.addEventListener('DOMContentLoaded', function() {
            // ดึงค่าเก่าที่ส่งมาจาก Controller (ผ่าน old() หรือ Session)
            const preSelectedId = "{{ old('crm_user_type_id', session('register_step1.crm_user_type_id', '')) }}";

            if (preSelectedId) {
                // ค้นหาการ์ดที่ตรงกับ ID นั้น
                const targetCard = document.querySelector(`.type-card[data-id="${preSelectedId}"]`);
                if (targetCard) {
                    // จำลองการคลิกเพื่อให้ UI ไฮไลต์และปุ่มปลดล็อก
                    selectType(targetCard);
                }
            }
        });
    </script>

</body>

</html>