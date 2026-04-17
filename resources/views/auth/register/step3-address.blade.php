{{-- resources/views/auth/register/step3-address.blade.php --}}
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>ลงทะเบียนสมาชิกใหม่ — ยืนยัน</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css" rel="stylesheet">
    <script src="https://unpkg.com/html5-qrcode" type="text/javascript"></script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body {
            font-family: 'Sarabun', sans-serif;
        }

        .step-circle {
            width: 2rem;
            height: 2rem;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 700;
            border: 2px solid #e5e7eb;
            background: #fff;
            color: #9ca3af;
        }

        .step-circle.active {
            border-color: #f97316;
            background: #f97316;
            color: #fff;
        }

        .step-circle.done {
            border-color: #f97316;
            background: #fff7ed;
            color: #f97316;
        }

        .form-label {
            display: block;
            font-size: .8rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: .35rem;
        }

        .form-input {
            width: 100%;
            padding: .5rem .75rem;
            border: 1px solid #e5e7eb;
            border-radius: .5rem;
            font-size: 1rem;
            outline: none;
            transition: border-color .2s, box-shadow .2s;
            font-family: 'Sarabun', sans-serif;
        }

        .form-input:focus {
            border-color: #f97316;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, .12);
        }

        /* Tom Select */
        .ts-wrapper {
            font-family: 'Sarabun', sans-serif;
        }

        .ts-control {
            border-radius: .5rem !important;
            padding: .45rem .75rem !important;
            border-color: #e5e7eb !important;
            box-shadow: none !important;
            font-size: 1rem !important;
            font-family: 'Sarabun', sans-serif !important;
            min-height: unset !important;
        }

        .ts-control:focus-within {
            border-color: #f97316 !important;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, .12) !important;
        }

        .ts-dropdown {
            z-index: 9999 !important;
            border-radius: .5rem !important;
            font-size: 1rem !important;
        }

        /* Referral */
        .ref-toggle {
            cursor: pointer;
        }

        .ref-box {
            overflow: hidden;
            max-height: 0;
            transition: max-height .3s ease;
        }

        .ref-box.open {
            max-height: 140px;
        }

        .spinner {
            border: 3px solid rgba(255, 255, 255, .3);
            border-radius: 50%;
            border-top: 3px solid #fff;
            width: 18px;
            height: 18px;
            animation: spin 1s linear infinite;
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Summary */
        .summary-row {
            display: flex;
            gap: .5rem;
            padding: .5rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .summary-row:last-child {
            border: none;
        }

        .summary-key {
            font-size: .78rem;
            color: #6b7280;
            min-width: 6rem;
        }

        .summary-val {
            font-size: .78rem;
            color: #111827;
            font-weight: 600;
        }

        /* QR Modal */
        #qr-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        #qr-container {
            width: 100%;
            max-width: 400px;
            background: #fff;
            border-radius: 1.5rem;
            padding: 1.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        #reader {
            width: 100% !important;
            border-radius: 1rem;
            overflow: hidden;
            border: none !important;
        }

        #reader video {
            border-radius: 1rem;
        }

        #reader__dashboard_section_csr button {
            background: #f97316 !important;
            color: white !important;
            border: none !important;
            padding: .5rem 1rem !important;
            border-radius: .5rem !important;
            font-size: .875rem !important;
            margin-top: 1rem !important;
        }
    </style>
</head>

<body class="bg-gray-50 min-h-screen flex items-center justify-center py-10 px-4">

    <div class="w-full max-w-lg">

        {{-- Avatar + Title --}}
        <div class="text-center mb-6">
            @isset($data['avatar'])
            <img src="{{ $data['avatar'] }}" class="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-orange-500 shadow">
            @endisset
            <h1 class="text-xl font-bold text-gray-800">สมัครสมาชิก (3/3)</h1>
            <p class="text-sm text-gray-500 mt-1">ยืนยันข้อมูลและสมัครสมาชิก</p>
        </div>

        {{-- Progress --}}
        <div class="bg-white rounded-2xl shadow-sm px-6 py-4 mb-5">
            <div class="flex items-center">
                <div class="flex flex-col items-center">
                    <div class="step-circle done">✓</div>
                    <span class="text-xs mt-1 text-orange-600 font-semibold whitespace-nowrap">ประเภท</span>
                </div>
                <div class="flex-1 h-0.5 bg-orange-400 mx-1 mb-5"></div>
                <div class="flex flex-col items-center">
                    <div class="step-circle done">✓</div>
                    <span class="text-xs mt-1 text-orange-600 font-semibold whitespace-nowrap">ข้อมูลส่วนตัว</span>
                </div>
                <div class="flex-1 h-0.5 bg-orange-400 mx-1 mb-5"></div>
                <div class="flex flex-col items-center">
                    <div class="step-circle active">3</div>
                    <span class="text-xs mt-1 text-orange-600 font-semibold whitespace-nowrap">ยืนยัน</span>
                </div>
            </div>
        </div>

        {{-- Errors --}}
        @if(session('error') || $errors->any())
        <div class="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            @if(session('error'))<p>{{ session('error') }}</p>@endif
            @foreach($errors->all() as $err)<p>• {{ $err }}</p>@endforeach
        </div>
        @endif

        <div class="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <form action="{{ route('register.step3.store') }}" method="POST" id="step3Form">
                @csrf

                {{-- Province (Optional) --}}
                <div class="mb-5">
                    <label class="form-label">
                        จังหวัด
                        <span class="text-gray-400 font-normal">(ไม่บังคับ)</span>
                    </label>
                    <select id="sel_province" name="cust_province" placeholder="ค้นหาจังหวัด..." autocomplete="off"></select>
                </div>

                <hr class="my-5 border-gray-100">

                {{-- Referral Code (Optional) --}}
                <div class="mb-5">
                    <div class="ref-toggle flex items-center gap-2 text-sm text-gray-500 select-none" onclick="toggleRef()">
                        <svg id="refArrow" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span>รหัสแนะนำเพื่อน (ไม่บังคับ)</span>
                    </div>
                    <div class="ref-box" id="refBox">
                        <div class="mt-3">
                            <label class="form-label">รหัสแนะนำเพื่อน</label>
                            <div class="flex gap-2">
                                <div class="relative flex-grow">
                                    <input type="text" name="referral_code" id="referral_code"
                                        class="form-input uppercase tracking-widest pl-10"
                                        value="{{ old('referral_code', request()->query('ref', session('referrer_code', ''))) }}"
                                        placeholder="เช่น AB12CD34" maxlength="20">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <button type="button" onclick="startScanner()"
                                    class="flex items-center justify-center gap-2 bg-orange-100 text-orange-600 px-4 py-2.5 rounded-xl hover:bg-orange-200 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    <span class="text-sm font-bold hidden sm:inline">สแกน</span>
                                </button>
                            </div>
                            <p class="text-xs text-gray-400 mt-1">ทั้งคุณและผู้แนะนำจะได้รับคะแนนพิเศษ</p>
                        </div>
                    </div>
                </div>

                <hr class="my-5 border-gray-100">

                {{-- Summary --}}
                @php
                $typeLabels = [1 => ['เจ้าของธุรกิจ','🏢'], 2 => ['ผู้ใช้งานทั่วไป','👤'], 3 => ['ช่าง','🔧'], 4 => ['ดีลเลอร์','🤝']];
                $step1 = session('register_step1', []);
                $step2 = session('register_step2', []);
                $typeId = $step1['crm_user_type_id'] ?? null;
                @endphp
                <div class="bg-gray-50 rounded-xl p-4 mb-5 border border-orange-100">
                    <p class="text-xs font-semibold text-orange-500 mb-2 uppercase tracking-wide">สรุปข้อมูลของคุณ</p>
                    <div class="summary-row">
                        <span class="summary-key">ประเภท</span>
                        <span class="summary-val">{{ $typeId && isset($typeLabels[$typeId]) ? $typeLabels[$typeId][1].' '.$typeLabels[$typeId][0] : '—' }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-key">ชื่อ-นามสกุล</span>
                        <span class="summary-val">{{ trim(($step2['cust_firstname'] ?? '').' '.($step2['cust_lastname'] ?? '')) ?: '—' }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-key">เบอร์โทร</span>
                        <span class="summary-val">{{ $step2['cust_tel'] ?? '—' }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-key">อีเมล</span>
                        <span class="summary-val">{{ $step2['cust_email'] ?? '—' }}</span>
                    </div>
                </div>

                {{-- Actions --}}
                <div class="flex gap-3">
                    <a href="{{ route('register.step2') }}"
                        class="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-sm text-center hover:bg-gray-50 transition">
                        ย้อนกลับ
                    </a>
                    <button type="submit" id="btnSubmit"
                        class="flex-grow bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm
                           flex items-center justify-center gap-2 transition">
                        <span id="btnSpinner" class="spinner hidden"></span>
                        <span id="btnText">ยืนยันสมัครสมาชิก</span>
                    </button>
                </div>
            </form>
        </div>

    </div>

    {{-- QR Modal --}}
    <div id="qr-modal" onclick="event.target.id === 'qr-modal' && stopScanner()">
        <div id="qr-container">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-800">สแกนรหัสแนะนำเพื่อน</h3>
                <button type="button" onclick="stopScanner()" class="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div id="reader"></div>
            <p class="text-center text-xs text-gray-400 mt-4">วางรหัส QR ให้อยู่ในกรอบเพื่อทำการสแกน</p>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>
    <script>
        // ── Province Dropdown ─────────────────────────────────────────
        let tsProvince;
        let provincesData = [];
        const OLD_PROVINCE = @json(old('cust_province', session('register_step3.cust_province', '')));

        document.addEventListener('DOMContentLoaded', async function() {
            tsProvince = new TomSelect('#sel_province', {
                create: false,
                sortField: {
                    field: 'text',
                    direction: 'asc'
                },
                closeAfterSelect: true,
                placeholder: 'ค้นหาจังหวัด...',
                // Allow clearing selection
                plugins: ['clear_button'],
            });

            await loadProvinces();
            if (OLD_PROVINCE) tsProvince.setValue(OLD_PROVINCE, true);

            // Auto-open referral if ?ref= or session has code
            const refCode = @json(request()->query('ref', session('referrer_code', '')));
            if (refCode) toggleRef(true);
        });

        async function loadProvinces() {
            try {
                const res = await fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/province.json');
                provincesData = await res.json();
                tsProvince.clearOptions();
                tsProvince.addOption(provincesData.map(x => ({
                    value: x.name_th,
                    text: x.name_th
                })));
                tsProvince.refreshOptions(false);
            } catch (e) {
                console.error('Province load error', e);
            }
        }

        // ── Referral toggle ───────────────────────────────────────────
        function toggleRef(forceOpen) {
            const box = document.getElementById('refBox');
            const arrow = document.getElementById('refArrow');
            const open = forceOpen === true ? true : !box.classList.contains('open');
            box.classList.toggle('open', open);
            arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
        }

        // ── QR Scanner ────────────────────────────────────────────────
        let html5QrCode = null;

        async function startScanner() {
            document.getElementById('qr-modal').style.display = 'flex';
            if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
            try {
                await html5QrCode.start({
                    facingMode: "environment"
                }, {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250
                    }
                }, onScanSuccess);
            } catch (err) {
                console.error("Scanner start error:", err);
                alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตใช้งานกล้อง");
                stopScanner();
            }
        }

        async function stopScanner() {
            if (html5QrCode?.isScanning) await html5QrCode.stop();
            document.getElementById('qr-modal').style.display = 'none';
        }

        function onScanSuccess(decodedText) {
            let code = decodedText;
            try {
                if (code.includes('?ref=') || code.includes('&ref=')) {
                    code = new URL(code).searchParams.get('ref') || code;
                }
            } catch (e) {}

            const input = document.getElementById('referral_code');
            input.value = code.toUpperCase();
            input.classList.add('ring-2', 'ring-green-500', 'border-green-500');
            setTimeout(() => input.classList.remove('ring-2', 'ring-green-500', 'border-green-500'), 2000);
            stopScanner();
        }

        // ── Submit guard ──────────────────────────────────────────────
        document.getElementById('step3Form').addEventListener('submit', function() {
            const btn = document.getElementById('btnSubmit');
            btn.disabled = true;
            btn.classList.add('opacity-75', 'cursor-not-allowed');
            document.getElementById('btnSpinner').classList.remove('hidden');
            document.getElementById('btnText').innerText = 'กำลังบันทึก...';
        });
    </script>
</body>

</html>