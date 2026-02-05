<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ลงทะเบียนสมาชิกใหม่</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css">
    <style>
        .iti {
            width: 100%;
        }

        .iti__flag {
            background-image: url("https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/img/flags.png");
        }

        @media (-webkit-min-device-pixel-ratio: 2),
        (min-resolution: 192dpi) {
            .iti__flag {
                background-image: url("https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/img/flags@2x.png");
            }
        }

        .ts-control {
            border-radius: 0.25rem;
            padding: 0.5rem 0.75rem;
            border-color: #e5e7eb;
            box-shadow: none;
        }

        .ts-control:focus {
            box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.45);
            border-color: #86efac;
        }

        .ts-dropdown {
            z-index: 50;
        }

        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 3px solid #ffffff;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        /* คลาสสำหรับซ่อนข้อความเดิม */
        .hidden {
            display: none;
        }
    </style>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>

<body class="bg-gray-100 flex items-center justify-center min-h-screen py-10">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div class="text-center mb-6">
            @if (isset($data['avatar']))
                <img src="{{ $data['avatar'] }}" class="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-green-500">
            @endif

            {{-- [UPDATE] เปลี่ยนหัวข้อถ้าเป็นการอัปเดตข้อมูล --}}
            @if (!empty($data['is_update_mode']))
                <h2 class="text-2xl font-bold text-gray-800">ยินดีต้อนรับกลับมา!</h2>
                <p class="text-gray-500 text-sm">กรุณาตรวจสอบและยืนยันข้อมูลล่าสุดของคุณ</p>
            @else
                <h2 class="text-2xl font-bold text-gray-800">กรุณากรอกข้อมูลเพิ่มเติม</h2>
                <p class="text-gray-500 text-sm">เพื่อสิทธิประโยชน์และเริ่มต้นใช้งานระบบ</p>
            @endif
        </div>

        @if (session('error'))
            <div class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                {{ session('error') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                <ul class="list-disc pl-5">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('register.complete_profile.store') }}" method="POST" id="registerForm">
            @csrf

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">ชื่อจริง *</label>
                    {{-- [FIX] เพิ่ม $data['cust_firstname'] --}}
                    <input type="text" name="cust_firstname"
                        value="{{ old('cust_firstname', $data['cust_firstname'] ?? $data['name']) }}"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                        required>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">นามสกุล *</label>
                    {{-- [FIX] เพิ่ม $data['cust_lastname'] --}}
                    <input type="text" name="cust_lastname"
                        value="{{ old('cust_lastname', $data['cust_lastname'] ?? '') }}"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                        required>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">อีเมล *</label>
                {{-- [FIX] เพิ่ม $data['email'] --}}
                <input type="email" name="cust_email"
                    value="{{ old('cust_email', $data['cust_email'] ?? $data['email']) }}"
                    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                    required>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">เพศ *</label>
                    <select name="cust_gender"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300">
                        @php $g = old('cust_gender', $data['cust_gender'] ?? ''); @endphp
                        <option value="male" {{ $g == 'male' || $g == 'ชาย' ? 'selected' : '' }}>ชาย</option>
                        <option value="female" {{ $g == 'female' || $g == 'หญิง' ? 'selected' : '' }}>หญิง</option>
                        <option value="other" {{ $g == 'other' || $g == 'อื่นๆ' ? 'selected' : '' }}>อื่นๆ</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">วันเกิด *</label>
                    <input type="date" name="cust_birthdate"
                        value="{{ old('cust_birthdate', $data['cust_birthdate'] ?? '') }}"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                        required>
                </div>
            </div>

            <hr class="mb-6 border-gray-300">

            <h3 class="text-lg font-bold text-gray-800 mb-4">ข้อมูลที่อยู่</h3>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">ที่อยู่ (เลขที่, หมู่บ้าน, ซอย, ถนน) *</label>
                <input type="text" name="cust_address"
                    value="{{ old('cust_address', $data['cust_address'] ?? '') }}"
                    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                    required>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">จังหวัด *</label>
                <select id="province" name="cust_province" placeholder="ค้นหาจังหวัด..." required autocomplete="off">
                    <option value="">เลือกจังหวัด</option>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">อำเภอ/เขต *</label>
                    <select id="district" name="cust_district" placeholder="ค้นหาอำเภอ..." required autocomplete="off">
                        <option value="">เลือกอำเภอ</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-bold mb-2">ตำบล/แขวง *</label>
                    <select id="subdistrict" name="cust_subdistrict" placeholder="ค้นหาตำบล..." required
                        autocomplete="off">
                        <option value="">เลือกตำบล</option>
                    </select>
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2">รหัสไปรษณีย์ *</label>
                <input type="text" id="zipcode" name="cust_zipcode"
                    value="{{ old('cust_zipcode', $data['cust_zipcode'] ?? '') }}"
                    class="w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed" readonly
                    required>
            </div>

            <hr class="mb-6 border-gray-300">
            <h3 class="text-lg font-bold text-gray-800 mb-4">ยืนยันหมายเลขโทรศัพท์</h3>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">เบอร์โทรศัพท์ *</label>
                <div class="flex flex-col">
                    <input type="tel" id="phone_input" value="{{ old('cust_tel', $data['cust_tel'] ?? '') }}"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                        required>
                    <input type="hidden" name="cust_tel" id="cust_tel_hidden"
                        value="{{ old('cust_tel', $data['cust_tel'] ?? '') }}">
                </div>
                <div class="mt-2">
                    <button type="button" id="btnSendOtp" onclick="sendOtp()"
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        ขอรหัส OTP
                    </button>
                </div>
                <p id="otpMessage" class="text-xs mt-1"></p>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">รหัส OTP (4 หลัก) *</label>
                <input type="text" name="otp" maxlength="4"
                    class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300 text-center tracking-widest text-lg"
                    placeholder="XXXX" required>
            </div>
            <button type="submit" id="btnSubmit"
                class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition duration-200 flex justify-center items-center">
                <span id="btnSpinner" class="spinner hidden"></span> <span
                    id="btnText">ยืนยันข้อมูลและเข้าสู่ระบบ</span> </button>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/intlTelInput.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>

    <script>
        // Setup TomSelect
        const tsConfig = {
            create: false,
            sortField: {
                field: "text",
                direction: "asc"
            },
            placeholder: "พิมพ์เพื่อค้นหา...",
            closeAfterSelect: true
        };

        const provTS = new TomSelect('#province', tsConfig);
        const distTS = new TomSelect('#district', {
            ...tsConfig,
            placeholder: "กรุณาเลือกจังหวัดก่อน"
        });
        const subTS = new TomSelect('#subdistrict', {
            ...tsConfig,
            placeholder: "กรุณาเลือกอำเภอก่อน"
        });

        distTS.disable();
        subTS.disable();

        let provincesData = [],
            districtsData = [],
            subDistrictsData = [];
        const zipcodeInput = document.getElementById('zipcode');

        async function loadAddressData() {
            try {
                const [provRes, distRes, subRes] = await Promise.all([
                    fetch(
                        "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/province.json"
                    ),
                    fetch(
                        "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/district.json"
                    ),
                    fetch(
                        "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/sub_district.json"
                    )
                ]);

                provincesData = await provRes.json();
                districtsData = await distRes.json();
                subDistrictsData = await subRes.json();

                const provOptions = provincesData.map(p => ({
                    value: p.name_th,
                    text: p.name_th,
                    id: p.id
                }));
                provTS.clearOptions();
                provTS.addOption(provOptions);
                provTS.refreshOptions(false);

                // ดึงค่าเก่าจาก PHP (ใช้ json_encode เพื่อความปลอดภัยของ String)
                const oldProvince = {!! json_encode(old('cust_province', $data['cust_province'] ?? '')) !!};
                const oldDistrict = {!! json_encode(old('cust_district', $data['cust_district'] ?? '')) !!};
                const oldSubDistrict = {!! json_encode(old('cust_subdistrict', $data['cust_subdistrict'] ?? '')) !!};
                const oldZip = {!! json_encode(old('cust_zipcode', $data['cust_zipcode'] ?? '')) !!};

                if (oldProvince) {
                    // true = silent (ไม่ trigger event change ให้ code วิ่งมั่ว)
                    provTS.setValue(oldProvince, true);

                    // Manually trigger logic เพื่อโหลดอำเภอ
                    const selectedProv = provincesData.find(p => p.name_th === oldProvince);
                    if (selectedProv) {
                        const filteredDistricts = districtsData.filter(d => d.province_id == selectedProv.id);
                        distTS.clearOptions();
                        distTS.addOption(filteredDistricts.map(d => ({
                            value: d.name_th,
                            text: d.name_th,
                            id: d.id
                        })));
                        distTS.enable();
                        distTS.refreshOptions(false);

                        if (oldDistrict) {
                            distTS.setValue(oldDistrict, true);

                            // Manually trigger logic เพื่อโหลดตำบล
                            const selectedDist = districtsData.find(d => d.name_th === oldDistrict && d.province_id ==
                                selectedProv.id);
                            if (selectedDist) {
                                const filteredSubs = subDistrictsData.filter(s => s.district_id == selectedDist.id);
                                subTS.clearOptions();
                                subTS.addOption(filteredSubs.map(s => ({
                                    value: s.name_th,
                                    text: s.name_th,
                                    zip: s.zip_code
                                })));
                                subTS.enable();
                                subTS.refreshOptions(false);

                                if (oldSubDistrict) {
                                    subTS.setValue(oldSubDistrict, true);
                                }
                                if (oldZip) {
                                    zipcodeInput.value = oldZip;
                                }
                            }
                        }
                    }
                }

            } catch (error) {
                console.error("Failed to load address data", error);
            }
        }

        // --- Event Listeners ---
        provTS.on('change', function(value) {
            distTS.clear();
            distTS.clearOptions();
            distTS.disable();
            subTS.clear();
            subTS.clearOptions();
            subTS.disable();
            zipcodeInput.value = '';

            if (value) {
                const selectedProv = provincesData.find(p => p.name_th === value);
                if (selectedProv) {
                    const filteredDistricts = districtsData.filter(d => d.province_id == selectedProv.id);
                    distTS.addOption(filteredDistricts.map(d => ({
                        value: d.name_th,
                        text: d.name_th,
                        id: d.id
                    })));
                    distTS.enable();
                    distTS.refreshOptions(false);
                }
            }
        });

        distTS.on('change', function(value) {
            subTS.clear();
            subTS.clearOptions();
            subTS.disable();
            zipcodeInput.value = '';
            if (value) {
                const currentProv = provTS.getValue();
                const pObj = provincesData.find(x => x.name_th === currentProv);

                if (pObj) {
                    const selectedOption = districtsData.find(d => d.name_th === value && d.province_id == pObj.id);
                    if (selectedOption) {
                        const filteredSubDistricts = subDistrictsData.filter(s => s.district_id == selectedOption
                            .id);
                        subTS.addOption(filteredSubDistricts.map(s => ({
                            value: s.name_th,
                            text: s.name_th,
                            zip: s.zip_code
                        })));
                        subTS.enable();
                        subTS.refreshOptions(false);
                    }
                }
            }
        });

        subTS.on('change', function(value) {
            if (value) {
                const selectedOption = subTS.options[value];
                if (selectedOption && selectedOption.zip) {
                    zipcodeInput.value = selectedOption.zip;
                }
            } else {
                zipcodeInput.value = '';
            }
        });

        loadAddressData();

        // Phone Input
        const input = document.querySelector("#phone_input");
        const hiddenInput = document.querySelector("#cust_tel_hidden");
        const iti = window.intlTelInput(input, {
            initialCountry: "th",
            preferredCountries: ["th", "la", "mm", "kh", "my", "cn", "us", "jp"],
            separateDialCode: true,
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
        });
        input.addEventListener('input', function() {
            hiddenInput.value = iti.getNumber();
        });

        // OTP Logic (คงเดิม)
        let countdownTimer;
        async function sendOtp() {
            const btnSend = document.getElementById('btnSendOtp');
            const msgArea = document.getElementById('otpMessage');

            if (!iti.isValidNumber()) {
                alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
                input.focus();
                return;
            }
            const fullPhone = iti.getNumber();
            hiddenInput.value = fullPhone;
            btnSend.disabled = true;
            btnSend.innerText = 'กำลังส่ง...';
            msgArea.innerText = '';
            msgArea.className = 'text-xs mt-1 text-gray-500';

            try {
                const response = await axios.post("{{ route('register.send_otp') }}", {
                    phone: fullPhone
                });
                if (response.data.success) {
                    msgArea.innerText = 'ส่งรหัส OTP สำเร็จแล้ว';
                    msgArea.className = 'text-xs mt-1 text-green-600';
                    startCountdown(60);
                }
            } catch (error) {
                let errMsg = 'เกิดข้อผิดพลาดในการส่ง OTP';
                if (error.response && error.response.data && error.response.data.message) errMsg = error.response.data
                    .message;
                msgArea.innerText = errMsg;
                msgArea.className = 'text-xs mt-1 text-red-600';
                btnSend.disabled = false;
                btnSend.innerText = 'ขอรหัส OTP';
            }
        }

        function startCountdown(seconds) {
            const btnSend = document.getElementById('btnSendOtp');
            let counter = seconds;
            btnSend.disabled = true;
            clearInterval(countdownTimer);
            countdownTimer = setInterval(() => {
                btnSend.innerText = `รอส่งใหม่ (${counter})`;
                counter--;
                if (counter < 0) {
                    clearInterval(countdownTimer);
                    btnSend.disabled = false;
                    btnSend.innerText = 'ขอรหัส OTP อีกครั้ง';
                }
            }, 1000);
        }

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            if (!iti.isValidNumber()) {
                e.preventDefault();
                alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
                input.focus();
                return;
            }
            hiddenInput.value = iti.getNumber();

            const btnSubmit = document.getElementById('btnSubmit');
            const btnSpinner = document.getElementById('btnSpinner');
            const btnText = document.getElementById('btnText');

            btnSubmit.disabled = true;
            btnSubmit.classList.add('opacity-75', 'cursor-not-allowed');

            // แสดง Spinner และเปลี่ยนข้อความ
            btnSpinner.classList.remove('hidden');
            btnText.innerText = 'กำลังบันทึกข้อมูล...';
        });
    </script>
</body>

</html>
