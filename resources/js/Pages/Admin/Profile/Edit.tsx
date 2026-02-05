import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { Link } from '@mui/material';

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

export default function AdminProfileEdit({ status }: { status?: string }) {
    const user = usePage().props.auth.user;

    // --- Form 1: ข้อมูลส่วนตัว ---
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '', // ถ้ามี field phone
    });

    const submitInfo = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.profile.update'), {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'สำเร็จ', text: 'อัปเดตข้อมูลส่วนตัวเรียบร้อย', timer: 1500, showConfirmButton: false });
            }
        });
    };

    // --- Form 2: เปลี่ยนรหัสผ่าน ---
    const {
        data: pwdData,
        setData: setPwdData,
        put: putPwd,
        errors: pwdErrors,
        processing: pwdProcessing,
        reset: resetPwd
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        putPwd(route('admin.profile.password.update'), {
            onSuccess: () => {
                resetPwd();
                Swal.fire({ icon: 'success', title: 'สำเร็จ', text: 'เปลี่ยนรหัสผ่านเรียบร้อย', timer: 1500, showConfirmButton: false });
            },
            onError: () => {
                if (pwdErrors.current_password) {
                    resetPwd('current_password');
                }
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('admin.dashboard') as string}
                        className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
                        title="ย้อนกลับไป Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">แก้ไขโปรไฟล์</h2>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* 1. Update Profile Information */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">ข้อมูลส่วนตัว</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    อัปเดตข้อมูลบัญชีและที่อยู่อีเมลของคุณ
                                </p>
                            </header>

                            <form onSubmit={submitInfo} className="mt-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
                                    >
                                        บันทึกข้อมูล
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                    {/* 2. Update Password */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section className="max-w-xl">
                            <header>
                                <h2 className="text-lg font-medium text-gray-900">เปลี่ยนรหัสผ่าน</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    ควรใช้รหัสผ่านที่มีความยาวอย่างน้อย 8 ตัวอักษร
                                </p>
                            </header>

                            <form onSubmit={submitPassword} className="mt-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">รหัสผ่านปัจจุบัน</label>
                                    {/* <input
                                        type="password"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={pwdData.current_password}
                                        onChange={(e) => setPwdData('current_password', e.target.value)}
                                    /> */}
                                    <PasswordInput
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={pwdData.current_password}
                                        onChange={(e) => setPwdData('current_password', e.target.value)}
                                    />
                                    {pwdErrors.current_password && <div className="text-red-500 text-sm mt-1">{pwdErrors.current_password}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
                                    {/* <input
                                        type="password"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={pwdData.password}
                                        onChange={(e) => setPwdData('password', e.target.value)}
                                    /> */}
                                    <PasswordInput
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={pwdData.password}
                                        onChange={(e) => setPwdData('password', e.target.value)}
                                    />
                                    {pwdErrors.password && <div className="text-red-500 text-sm mt-1">{pwdErrors.password}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
                                    {/* <input
                                        type="password"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={pwdData.password_confirmation}
                                        onChange={(e) => setPwdData('password_confirmation', e.target.value)}
                                    /> */}
                                    <PasswordInput
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={pwdData.password_confirmation}
                                        onChange={(e) => setPwdData('password_confirmation', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={pwdProcessing}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        เปลี่ยนรหัสผ่าน
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}