import React, { FormEvent, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
// ปรับ path นี้ตาม Layout จริงของคุณ
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// กรณีใช้ Ziggy สำหรับ route() ถ้าไม่มี type ให้ข้าม interface นี้ไปได้
interface RouteParams {
    [key: string]: string | number;
}
declare function route(name: string, params?: RouteParams): string;


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

export default function Create() {
    // 1. ใช้ useForm ของ Inertia เพื่อจัดการ State และการส่งข้อมูล
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user', // ค่า Default
    });

    // 2. ฟังก์ชัน Submit Form
    const submit = (e: FormEvent) => {
        e.preventDefault();

        // ส่ง POST request ไปที่ route 'admin.users.store'
        post(route('admin.users.store'), {
            onFinish: () => reset('password', 'password_confirmation'), // ล้างรหัสผ่านเมื่อเสร็จ
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="สร้างผู้ใช้งานใหม่" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header ส่วนหัว */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            สร้างผู้ใช้งานใหม่
                        </h2>
                        <Link
                            href={route('admin.users.index')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                            ย้อนกลับ
                        </Link>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">

                            <form onSubmit={submit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Name */}
                                    <div className="col-span-1">
                                        <label className="block font-medium text-sm text-gray-700" htmlFor="name">
                                            ชื่อ-นามสกุล
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-1">
                                        <label className="block font-medium text-sm text-gray-700" htmlFor="email">
                                            อีเมล
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                    </div>

                                    {/* Password */}
                                    <div className="col-span-1">
                                        <label className="block font-medium text-sm text-gray-700" htmlFor="password">
                                            รหัสผ่าน
                                        </label>
                                        <PasswordInput
                                            id="password"
                                            type="password"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            autoComplete="new-password"
                                        />
                                        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                    </div>

                                    {/* Password Confirmation */}
                                    <div className="col-span-1">
                                        <label className="block font-medium text-sm text-gray-700" htmlFor="password_confirmation">
                                            ยืนยันรหัสผ่าน
                                        </label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            type="password"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Role Selection */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block font-medium text-sm text-gray-700" htmlFor="role">
                                            สิทธิ์การใช้งาน (Role)
                                        </label>
                                        <select
                                            id="role"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                        >
                                            <option value="user">User (ทั่วไป)</option>
                                            <option value="staff">Staff (พนักงาน)</option>
                                            <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                                            <option value="super_admin">Super Admin (สูงสุด)</option>
                                        </select>
                                        {errors.role && <div className="text-red-500 text-sm mt-1">{errors.role}</div>}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-end mt-6">
                                    <button
                                        type="submit"
                                        className={`px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold text-xs uppercase tracking-widest hover:bg-indigo-500 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ${processing ? 'opacity-25' : ''}`}
                                        disabled={processing}
                                    >
                                        {processing ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}