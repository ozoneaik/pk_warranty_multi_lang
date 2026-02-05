import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PointForm from './Form';

export default function PointCreate() {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">สร้างเงื่อนไขแต้มใหม่</h2>}
        >
            <Head title="สร้างเงื่อนไขแต้ม" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <PointForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}