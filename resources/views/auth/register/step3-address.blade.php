{{-- resources/views/auth/register/step3-address.blade.php --}}
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>ลงทะเบียนสมาชิกใหม่ — ที่อยู่ & ยืนยัน</title>
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
            /* orange-500 */
            background: #f97316;
            /* orange-500 */
            color: #fff;
        }

        .step-circle.done {
            border-color: #f97316;
            /* orange-500 */
            background: #fff7ed;
            /* orange-50 */
            color: #f97316;
            /* orange-500 */
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
            /* orange-500 */
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
            /* orange shadow */
        }

        .form-input:read-only {
            background: #f9fafb;
            cursor: not-allowed;
        }

        /* Tom Select override */
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
            /* orange-500 */
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12) !important;
            /* orange shadow */
        }

        .ts-dropdown {
            z-index: 9999 !important;
            border-radius: .5rem !important;
            font-size: 1rem !important;
        }

        .ts-wrapper.disabled .ts-control {
            background: #f9fafb !important;
            cursor: not-allowed;
        }

        /* Referral box */
        .ref-toggle {
            cursor: pointer;
        }

        .ref-box {
            overflow: hidden;
            max-height: 0;
            transition: max-height .3s ease;
        }

        .ref-box.open {
            max-height: 120px;
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

        /* Summary card */
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

        /* Scanner Modal */
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
            padding: 0.5rem 1rem !important;
            border-radius: 0.5rem !important;
            font-size: 0.875rem !important;
            margin-top: 1rem !important;
        }
    </style>
</head>

<body class="bg-gray-50 min-h-screen flex items-center justify-center py-10 px-4">

    <div class="w-full max-w-lg">

        <div class="text-center mb-6">
            @isset($data['avatar'])
            <img src="{{ $data['avatar'] }}" class="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-orange-500 shadow">
            @endisset
            <h1 class="text-xl font-bold text-gray-800">สมัครสมาชิก (3/3)</h1>
            <p class="text-sm text-gray-500 mt-1">กรอกที่อยู่และยืนยันข้อมูลของคุณ</p>
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
                    <span class="text-xs mt-1 text-orange-600 font-semibold whitespace-nowrap">ที่อยู่ & ยืนยัน</span>
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

                {{-- Address Section --}}
                <h3 class="text-sm font-semibold text-gray-700 mb-4">📍 ที่อยู่</h3>

                <div class="mb-4">
                    <label class="form-label">ที่อยู่ (เลขที่, หมู่บ้าน, ซอย, ถนน)</label>
                    <input type="text" name="cust_address" class="form-input"
                        value="{{ old('cust_address', session('register_step3.cust_address', '')) }}"
                        placeholder="เช่น 99/1 ซอยสุขุมวิท 11">
                </div>

                <div class="mb-4">
                    <label class="form-label">จังหวัด <span class="text-red-500">*</span></label>
                    <select id="sel_province" name="cust_province" placeholder="ค้นหาจังหวัด..." autocomplete="off" required></select>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label class="form-label">อำเภอ/เขต <span class="text-red-500">*</span></label>
                        <select id="sel_district" name="cust_district" placeholder="เลือกอำเภอ..." autocomplete="off" required></select>
                    </div>
                    <div>
                        <label class="form-label">ตำบล/แขวง <span class="text-red-500">*</span></label>
                        <select id="sel_subdistrict" name="cust_subdistrict" placeholder="เลือกตำบล..." autocomplete="off" required></select>
                    </div>
                </div>

                <div class="mb-5">
                    <label class="form-label">รหัสไปรษณีย์</label>
                    <input type="text" id="cust_zipcode" name="cust_zipcode" class="form-input"
                        value="{{ old('cust_zipcode', session('register_step3.cust_zipcode', '')) }}"
                        readonly placeholder="กรอกอัตโนมัติ">
                </div>

                <hr class="my-5 border-gray-100">

                {{-- Referral Code --}}
                <div class="mb-5">
                    <div class="ref-toggle flex items-center gap-2 text-sm text-gray-500 select-none"
                        onclick="toggleRef()">
                        <svg id="refArrow" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span>มีรหัสแนะนำเพื่อน? (ถ้ามี)</span>
                    </div>
                    <div class="ref-box" id="refBox">
                        <div class="mt-3">
                            <label class="form-label">รหัสแนะนำเพื่อน</label>
                            <div class="flex gap-2">
                                <div class="relative flex-grow">
                                    <input type="text" name="referral_code" id="referral_code" class="form-input uppercase tracking-widest pl-10"
                                        value="{{ old('referral_code', request()->query('ref', session('referrer_code', ''))) }}"
                                        placeholder="เช่น AB12CD34" maxlength="20">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <button type="button" onclick="startScanner()" class="flex items-center justify-center gap-2 bg-orange-100 text-orange-600 px-4 py-2.5 rounded-xl hover:bg-orange-200 transition-colors">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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
                        <span class="summary-val">{{ ($step2['cust_firstname'] ?? '') . ' ' . ($step2['cust_lastname'] ?? '') ?: '—' }}</span>
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

    {{-- Scanner Modal --}}
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
        // ============================================================
        // Address Dropdowns (TomSelect + Thai Province Data)
        // ============================================================
        let tsProvince, tsDistrict, tsSubDistrict;
        let provincesData = [],
            districtsData = [],
            subDistrictsData = [];

        // Restore values from old() / session
        const OLD_PROVINCE = @json(old('cust_province', session('register_step3.cust_province', '')));
        const OLD_DISTRICT = @json(old('cust_district', session('register_step3.cust_district', '')));
        const OLD_SUBDISTRICT = @json(old('cust_subdistrict', session('register_step3.cust_subdistrict', '')));

        const tsConfig = {
            create: false,
            sortField: {
                field: 'text',
                direction: 'asc'
            },
            closeAfterSelect: true,
        };

        document.addEventListener('DOMContentLoaded', async function() {
            tsProvince = new TomSelect('#sel_province', {
                ...tsConfig,
                placeholder: 'ค้นหาจังหวัด...'
            });
            tsDistrict = new TomSelect('#sel_district', {
                ...tsConfig,
                placeholder: 'กรุณาเลือกจังหวัดก่อน'
            });
            tsSubDistrict = new TomSelect('#sel_subdistrict', {
                ...tsConfig,
                placeholder: 'กรุณาเลือกอำเภอก่อน'
            });

            tsDistrict.disable();
            tsSubDistrict.disable();

            // Events
            tsProvince.on('change', onProvinceChange);
            tsDistrict.on('change', onDistrictChange);
            tsSubDistrict.on('change', function(val) {
                const opt = tsSubDistrict.options[val];
                document.getElementById('cust_zipcode').value = opt ? (opt.zip || '') : '';
            });

            await loadAddressData();

            // Restore old values
            if (OLD_PROVINCE) {
                tsProvince.setValue(OLD_PROVINCE, true);
                await onProvinceChange(OLD_PROVINCE, true);
                if (OLD_DISTRICT) {
                    tsDistrict.setValue(OLD_DISTRICT, true);
                    await onDistrictChange(OLD_DISTRICT, true);
                    if (OLD_SUBDISTRICT) {
                        tsSubDistrict.setValue(OLD_SUBDISTRICT, true);
                        const opt = tsSubDistrict.options[OLD_SUBDISTRICT];
                        if (opt?.zip) document.getElementById('cust_zipcode').value = opt.zip;
                    }
                }
            }

            // Auto-open referral if ?ref= exists or session has code
            const refCode = @json(request()->query('ref', session('referrer_code', '')));
            if (refCode) toggleRef(true);
        });

        async function loadAddressData() {
            try {
                const BASE = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/';
                const [p, d, s] = await Promise.all([
                    fetch(BASE + 'province.json').then(r => r.json()),
                    fetch(BASE + 'district.json').then(r => r.json()),
                    fetch(BASE + 'sub_district.json').then(r => r.json()),
                ]);
                provincesData = p;
                districtsData = d;
                subDistrictsData = s;
                tsProvince.clearOptions();
                tsProvince.addOption(p.map(x => ({
                    value: x.name_th,
                    text: x.name_th,
                    id: x.id
                })));
                tsProvince.refreshOptions(false);
            } catch (e) {
                console.error('Address load error', e);
            }
        }

        async function onProvinceChange(val, silent = false) {
            tsDistrict.clear(true);
            tsDistrict.clearOptions();
            tsDistrict.disable();
            tsSubDistrict.clear(true);
            tsSubDistrict.clearOptions();
            tsSubDistrict.disable();
            document.getElementById('cust_zipcode').value = '';

            if (val) {
                const prov = provincesData.find(p => p.name_th === val);
                if (prov) {
                    const filtered = districtsData.filter(d => d.province_id == prov.id);
                    tsDistrict.addOption(filtered.map(d => ({
                        value: d.name_th,
                        text: d.name_th,
                        id: d.id
                    })));
                    tsDistrict.enable();
                    tsDistrict.refreshOptions(false);
                }
            }
        }

        async function onDistrictChange(val, silent = false) {
            tsSubDistrict.clear(true);
            tsSubDistrict.clearOptions();
            tsSubDistrict.disable();
            document.getElementById('cust_zipcode').value = '';

            if (val) {
                const pObj = provincesData.find(p => p.name_th === tsProvince.getValue());
                const dist = districtsData.find(d => d.name_th === val && d.province_id == pObj?.id);
                if (dist) {
                    const filtered = subDistrictsData.filter(s => s.district_id == dist.id);
                    tsSubDistrict.addOption(filtered.map(s => ({
                        value: s.name_th,
                        text: s.name_th,
                        zip: s.zip_code
                    })));
                    tsSubDistrict.enable();
                    tsSubDistrict.refreshOptions(false);
                }
            }
        }

        // ============================================================
        // Referral toggle
        // ============================================================
        function toggleRef(forceOpen) {
            const box = document.getElementById('refBox');
            const arrow = document.getElementById('refArrow');
            const open = forceOpen === true ? true : !box.classList.contains('open');
            box.classList.toggle('open', open);
            arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
        }

        // ============================================================
        // QR Scanner Logic
        // ============================================================
        let html5QrCode = null;

        async function startScanner() {
            document.getElementById('qr-modal').style.display = 'flex';
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("reader");
            }

            const config = {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            };

            try {
                await html5QrCode.start({
                    facingMode: "environment"
                }, config, onScanSuccess);
            } catch (err) {
                console.error("Scanner start error:", err);
                alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตใช้งานกล้อง");
                stopScanner();
            }
        }

        async function stopScanner() {
            if (html5QrCode && html5QrCode.isScanning) {
                await html5QrCode.stop();
            }
            document.getElementById('qr-modal').style.display = 'none';
        }

        function onScanSuccess(decodedText, decodedResult) {
            // ดึงค่า Referral Code จาก URL หรือข้อความตรงๆ
            let code = decodedText;
            try {
                if (code.includes('?ref=')) {
                    code = new URL(code).searchParams.get('ref');
                } else if (code.includes('/register?ref=')) {
                    code = code.split('ref=')[1].split('&')[0];
                }
            } catch (e) {
                // If not URL, use raw text
            }

            document.getElementById('referral_code').value = code.toUpperCase();
            
            // Visual feedback
            const input = document.getElementById('referral_code');
            input.classList.add('ring-2', 'ring-green-500', 'border-green-500');
            setTimeout(() => {
                input.classList.remove('ring-2', 'ring-green-500', 'border-green-500');
            }, 2000);

            stopScanner();
        }

        // ============================================================
        // Submit
        // ============================================================
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