{{-- resources/views/auth/register/step2-profile.blade.php --}}
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>ลงทะเบียนสมาชิกใหม่ — ข้อมูลส่วนตัว</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css">
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

        .step-line-done {
            background: #f97316 !important;
            /* orange-500 */
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

        .form-label {
            display: block;
            font-size: .8rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: .35rem;
        }

        .iti {
            width: 100%;
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

        /* OTP Button */
        #btnSendOtp {
            transition: background .2s;
        }

        #btnSendOtp:disabled {
            opacity: .5;
            cursor: not-allowed;
        }

        /* Type badge */
        .type-badge {
            display: inline-flex;
            align-items: center;
            gap: .4rem;
            background: #fff7ed;
            /* orange-50 */
            border: 1px solid #fdba74;
            /* orange-300 */
            border-radius: 9999px;
            padding: .25rem .85rem;
            font-size: .78rem;
            color: #c2410c;
            /* orange-700 */
            font-weight: 600;
        }
    </style>
</head>

<body class="bg-gray-50 min-h-screen flex items-center justify-center py-10 px-4">

    <div class="w-full max-w-lg">

        <div class="text-center mb-6">
            @isset($data['avatar'])
            <img src="{{ $data['avatar'] }}" class="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-orange-500 shadow">
            @endisset
            <h1 class="text-xl font-bold text-gray-800">สมัครสมาชิก (2/3)</h1>
            @if(!empty($data['is_update_mode']))
            <p class="text-sm text-gray-500 mt-1">ยินดีต้อนรับกลับมา! กรุณาตรวจสอบข้อมูลของคุณ</p>
            @else
            <p class="text-sm text-gray-500 mt-1">กรอกข้อมูลส่วนตัวเพื่อเริ่มใช้งาน</p>
            @endif
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
                    <div class="step-circle active">2</div>
                    <span class="text-xs mt-1 text-orange-600 font-semibold whitespace-nowrap">ข้อมูลส่วนตัว</span>
                </div>
                <div class="flex-1 h-0.5 bg-gray-200 mx-1 mb-5"></div>
                <div class="flex flex-col items-center">
                    <div class="step-circle">3</div>
                    <span class="text-xs mt-1 text-gray-400 whitespace-nowrap">ที่อยู่ & ยืนยัน</span>
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

        {{-- Selected user type badge --}}
        @php
        $typeLabels = [1 => ['เจ้าของธุรกิจ','🏢'], 2 => ['ผู้ใช้งานทั่วไป','👤'], 3 => ['ช่าง','🔧'], 4 => ['ดีลเลอร์','🤝']];
        $typeId = session('register_step1.crm_user_type_id');
        @endphp
        @if($typeId && isset($typeLabels[$typeId]))
        <div class="flex items-center gap-2 mb-4">
            <span class="text-xs text-gray-400">ประเภทที่เลือก:</span>
            <span class="type-badge">{{ $typeLabels[$typeId][1] }} {{ $typeLabels[$typeId][0] }}</span>
            <a href="{{ route('register.step1') }}" class="text-xs text-gray-400 underline hover:text-gray-600">เปลี่ยน</a>
        </div>
        @endif

        <div class="bg-white rounded-2xl shadow-sm p-6">
            <form action="{{ route('register.step2.store') }}" method="POST" id="step2Form">
                @csrf

                {{-- Name --}}
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label class="form-label">ชื่อจริง <span class="text-red-500">*</span></label>
                        <input type="text" name="cust_firstname" class="form-input"
                            value="{{ old('cust_firstname', $data['cust_firstname'] ?? $data['name'] ?? '') }}" required>
                    </div>
                    <div>
                        <label class="form-label">นามสกุล <span class="text-red-500">*</span></label>
                        <input type="text" name="cust_lastname" class="form-input"
                            value="{{ old('cust_lastname', $data['cust_lastname'] ?? '') }}" required>
                    </div>
                </div>

                {{-- Email --}}
                <div class="mb-4">
                    <label class="form-label">อีเมล</label>
                    <input type="email" name="cust_email" id="cust_email"
                        class="form-input @error('cust_email') border-red-500 @enderror"
                        value="{{ old('cust_email', $data['cust_email'] ?? $data['email'] ?? '') }}"
                        placeholder="example@email.com">
                    <p id="emailError" class="text-red-500 text-xs mt-1 hidden">รูปแบบอีเมลไม่ถูกต้อง</p>

                    @error('cust_email')
                    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Gender + Birthdate --}}
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div>
                        <label class="form-label">เพศ <span class="text-red-500">*</span></label>
                        @php $g = old('cust_gender', $data['cust_gender'] ?? ''); @endphp
                        <select name="cust_gender" class="form-input" required>
                            <option value="">เลือกเพศ</option>
                            <option value="male" {{ in_array($g, ['male','ชาย'])   ? 'selected' : '' }}>ชาย</option>
                            <option value="female" {{ in_array($g, ['female','หญิง']) ? 'selected' : '' }}>หญิง</option>
                            <option value="other" {{ in_array($g, ['other','อื่นๆ']) ? 'selected' : '' }}>อื่นๆ</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">วันเกิด <span class="text-red-500">*</span></label>
                        <input type="date" name="cust_birthdate" class="form-input"
                            value="{{ old('cust_birthdate', $data['cust_birthdate'] ?? '') }}" required>
                    </div>
                </div>

                <hr class="my-5 border-gray-100">

                {{-- Phone + OTP --}}
                <h3 class="text-sm font-semibold text-gray-700 mb-3">ยืนยันหมายเลขโทรศัพท์</h3>

                <div class="mb-3">
                    <label class="form-label">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
                    <input type="tel" id="phone_input"
                        value="{{ old('cust_tel', $data['cust_tel'] ?? '') }}"
                        class="form-input" required>
                    <input type="hidden" name="cust_tel" id="cust_tel_hidden"
                        value="{{ old('cust_tel', $data['cust_tel'] ?? '') }}">
                </div>

                <div class="mb-4">
                    <button type="button" id="btnSendOtp" onclick="sendOtp()"
                        class="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm">
                        ขอรหัส OTP
                    </button>
                    <p id="otpMessage" class="text-xs mt-1.5 text-gray-400"></p>
                </div>

                <div class="mb-6">
                    <label class="form-label">รหัส OTP (4 หลัก) <span class="text-red-500">*</span></label>
                    <input type="text" name="otp" maxlength="4" class="form-input text-center tracking-widest text-lg"
                        placeholder="0000" required>
                </div>

                <div class="flex gap-3">
                    <a href="{{ route('register.step1') }}"
                        class="flex-1 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-sm text-center hover:bg-gray-50 transition">
                        ย้อนกลับ
                    </a>
                    <button type="submit" id="btnSubmit"
                        class="flex-2 flex-grow bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm
                            flex items-center justify-center gap-2 transition">
                        <span id="btnSpinner" class="spinner hidden"></span>
                        <span id="btnText">ถัดไป </span>
                    </button>
                </div>
            </form>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/intlTelInput.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"></script>
    <script>
        let iti;
        let countdownTimer;

        document.addEventListener('DOMContentLoaded', function() {
            const input = document.querySelector('#phone_input');
            const hidden = document.querySelector('#cust_tel_hidden');
            iti = window.intlTelInput(input, {
                initialCountry: 'th',
                preferredCountries: ['th', 'la', 'mm', 'kh', 'my', 'cn', 'us', 'jp'],
                separateDialCode: true,
                utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
            });
            input.addEventListener('input', () => {
                hidden.value = iti.getNumber();
            });

            // Real-time Email Validation
            const emailInput = document.getElementById('cust_email');
            const emailError = document.getElementById('emailError');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            emailInput.addEventListener('blur', function() {
                const val = this.value.trim();
                if (val !== '' && !emailRegex.test(val)) {
                    this.classList.add('border-red-500');
                    emailError.classList.remove('hidden');
                } else {
                    this.classList.remove('border-red-500');
                    emailError.classList.add('hidden');
                }
            });

            emailInput.addEventListener('input', function() {
                const val = this.value.trim();
                if (val === '' || emailRegex.test(val)) {
                    this.classList.remove('border-red-500');
                    emailError.classList.add('hidden');
                }
            });
        });

        async function sendOtp() {
            const btn = document.getElementById('btnSendOtp');
            const msg = document.getElementById('otpMessage');
            const hidden = document.getElementById('cust_tel_hidden');

            if (!iti || !iti.isValidNumber()) {
                alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
                return;
            }

            const fullPhone = iti.getNumber();
            hidden.value = fullPhone;
            btn.disabled = true;
            btn.innerText = 'กำลังส่ง...';
            msg.innerText = '';

            try {
                const res = await axios.post("{{ route('register.send_otp') }}", {
                    phone: fullPhone
                });
                if (res.data.success) {
                    msg.className = 'text-xs mt-1.5 text-orange-600';
                    msg.innerText = 'ส่งรหัส OTP สำเร็จแล้ว';
                    startCountdown(60);
                }
            } catch (err) {
                msg.className = 'text-xs mt-1.5 text-red-500';
                msg.innerText = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่ง OTP';
                btn.disabled = false;
                btn.innerText = 'ขอรหัส OTP';
            }
        }

        function startCountdown(s) {
            const btn = document.getElementById('btnSendOtp');
            btn.disabled = true;
            clearInterval(countdownTimer);
            countdownTimer = setInterval(() => {
                btn.innerText = `รอส่งใหม่ (${s})`;
                if (s-- <= 0) {
                    clearInterval(countdownTimer);
                    btn.disabled = false;
                    btn.innerText = 'ขอรหัส OTP อีกครั้ง';
                }
            }, 1000);
        }

        document.getElementById('step2Form').addEventListener('submit', function(e) {
            if (!iti || !iti.isValidNumber()) {
                e.preventDefault();
                alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
                return;
            }
            document.getElementById('cust_tel_hidden').value = iti.getNumber();
            
            // Email Validation
            if (emailInput.value.trim() !== '' && !emailRegex.test(emailInput.value)) {
                e.preventDefault();
                emailInput.classList.add('border-red-500');
                emailError.classList.remove('hidden');
                emailInput.focus();
                return;
            }

            const btn = document.getElementById('btnSubmit');
            btn.disabled = true;
            btn.classList.add('opacity-75', 'cursor-not-allowed');
            document.getElementById('btnSpinner').classList.remove('hidden');
            document.getElementById('btnText').innerText = 'กำลังบันทึก...';
        });
    </script>
</body>

</html>