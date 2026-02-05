import React, { FormEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PumpkinLogo from '../../../assets/logo/PumpkinLogo.png';

const PasswordInput = ({
    className = "",
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                type={showPassword ? "text" : "password"}
                className={`${className} pr-10`} // เพิ่ม pr-10 เพื่อเว้นที่ให้ไอคอน
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                {showPassword ? (
                    // Icon: Eye Off (ซ่อน)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                ) : (
                    // Icon: Eye (แสดง)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.login.store'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <Head title="Admin Login" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="flex justify-center mb-6">
                    {/* ใส่ Logo ของคุณตรงนี้ */}
                    <div className='flex flex-col items-center gap-2'>
                        <img src={PumpkinLogo} alt="Logo" className="w-16 h-16" />
                        <h2 className="text-2xl font-bold text-gray-800 text-center">เข้าสู่ระบบแอดมิน <br />(Warranty Pumpkin Admin)</h2>
                    </div>

                </div>

                <form onSubmit={submit}>
                    {/* Email */}
                    <div>
                        <label className="block font-medium text-sm text-gray-700" htmlFor="email">
                            อีเมล
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoFocus
                            required
                        />
                        {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                    </div>

                    {/* Password */}
                    <div className="mt-4">
                        <label className="block font-medium text-sm text-gray-700" htmlFor="password">
                            รหัสผ่าน
                        </label>
                        <PasswordInput
                            id="password"
                            type="password"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                    </div>

                    {/* Remember Me */}
                    <div className="block mt-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600">จำการเข้าระบบ</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end mt-4">
                        <button
                            className={`w-full inline-flex justify-center items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150 ${processing ? 'opacity-25' : ''}`}
                            disabled={processing}
                        >
                            {processing ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}