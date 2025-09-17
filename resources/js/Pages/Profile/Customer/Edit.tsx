import { Head } from '@inertiajs/react';
import MobileAuthenticatedLayout from '@/Layouts/MobileAuthenticatedLayout';
import ProfileForm from './ProfileForm';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    customer?: any;
}
export default function Edit({ customer,vat }: any) {
    return (
        <MobileAuthenticatedLayout>
            <Head title="ข้อมูลลูกค้า" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    {/* Profile Info */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <ProfileForm customer={customer} vat={vat} className="max-w-xl" />
                    </div>
                </div>
            </div>
        </MobileAuthenticatedLayout>
    );
}
