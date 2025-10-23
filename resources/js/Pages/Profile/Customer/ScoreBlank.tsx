import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function ScoreBlank() {
    return (
        <MobileAuthenticatedLayout title="Score">
            <Head title="Score" />
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
                {/* Icon */}
                <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
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
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        คะแนนของคุณ
                    </h2>
                    <p className="text-gray-600 text-lg">
                        กำลังพัฒนา
                    </p>
                    <p className="text-gray-500 text-sm max-w-md">
                        ระบบคะแนนกำลังอยู่ระหว่างการพัฒนา<br />
                        เร็วๆ นี้ คุณจะสามารถดูและใช้คะแนนสะสมได้
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </MobileAuthenticatedLayout>
    );
}