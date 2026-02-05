import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PointForm from './Form';

export default function PointEdit({ process }: { process: any }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">แก้ไขเงื่อนไขแต้ม: {process.process_name}</h2>}
        >
            <Head title="แก้ไขเงื่อนไขแต้ม" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <PointForm initialData={process} isEdit={true} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}