import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout"
import { Head } from "@inertiajs/react";

export default function PrivilegeBlank() {
    return (
        <MobileAuthenticatedLayout title="Privilege">
            <Head title="Privilege" />
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
                {/* Icon */}
                <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg 
                            className="w-10 h-10 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Privilege
                    </h2>
                    <p className="text-gray-600 text-lg">
                        กำลังพัฒนา
                    </p>
                    <p className="text-gray-500 text-sm max-w-md">
                        ฟีเจอร์สิทธิพิเศษกำลังอยู่ระหว่างการพัฒนา<br />
                        เร็วๆ นี้ คุณจะสามารถใช้งานสิทธิประโยชน์ต่างๆ ได้
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </MobileAuthenticatedLayout>
    );
}