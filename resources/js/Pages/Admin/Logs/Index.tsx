import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import { 
    FileText, 
    Search, 
    AlertCircle, 
    Info, 
    AlertTriangle, 
    Download, 
    Trash2, 
    ChevronRight,
    SearchX
} from 'lucide-react';

interface LogEntry {
    timestamp: string;
    env: string;
    level: string;
    message: string;
    full_text: string;
}

interface Props {
    files: string[];
    selectedFile: string;
    logs: LogEntry[];
    filters: {
        file?: string;
        search?: string;
        level?: string;
        start_date?: string;
        end_date?: string;
        file_date?: string;
    };
}

const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
        case 'ERROR':
        case 'CRITICAL':
        case 'ALERT':
        case 'EMERGENCY':
            return 'text-rose-600 bg-rose-50 border-rose-100';
        case 'WARNING':
            return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'INFO':
        case 'NOTICE':
            return 'text-indigo-600 bg-indigo-50 border-indigo-100';
        case 'DEBUG':
            return 'text-gray-600 bg-gray-50 border-gray-100';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-100';
    }
};

const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
        case 'ERROR':
        case 'CRITICAL':
        case 'ALERT':
        case 'EMERGENCY':
            return <AlertCircle size={14} />;
        case 'WARNING':
            return <AlertTriangle size={14} />;
        default:
            return <Info size={14} />;
    }
};

export default function LogViewer({ files, selectedFile, logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [level, setLevel] = useState(filters.level || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [fileDate, setFileDate] = useState(filters.file_date || '');

    const handleSearch = () => {
        router.get(route('admin.logs.index'), {
            file: selectedFile,
            search,
            level,
            start_date: startDate,
            end_date: endDate,
            file_date: fileDate
        }, { preserveState: true });
    };

    const handleFileChange = (file: string) => {
        router.get(route('admin.logs.index'), {
            file,
            search,
            level,
            start_date: startDate,
            end_date: endDate,
            file_date: fileDate
        });
    };

    const clearLog = () => {
        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลในไฟล์ ${selectedFile}?`)) {
            router.delete(route('admin.logs.destroy', { filename: selectedFile }));
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <FileText size={20} />
                        </div>
                        <h2 className="font-bold text-2xl text-gray-800">System Logs</h2>
                    </div>
                </div>
            }
        >
            <Head title={`System Logs - ${selectedFile}`} />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar: File List */}
                <aside className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <FileText size={16} />
                                รายการไฟล์ Log
                            </h3>
                        </div>
                        
                        <div className="p-4 border-b border-gray-50">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">กรองตามวันที่ไฟล์</label>
                            <input
                                type="date"
                                value={fileDate}
                                onChange={(e) => {
                                    setFileDate(e.target.value);
                                    router.get(route('admin.logs.index'), {
                                        file: selectedFile,
                                        search,
                                        level,
                                        start_date: startDate,
                                        end_date: endDate,
                                        file_date: e.target.value
                                    });
                                }}
                                className="w-full px-3 py-2 bg-gray-50 border-gray-100 rounded-xl text-xs focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                            />
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {files.map((file) => (
                                <button
                                    key={file}
                                    onClick={() => handleFileChange(file)}
                                    className={`w-full text-left px-4 py-3 flex items-center justify-between group transition-all border-b border-gray-50 last:border-0 ${
                                        selectedFile === file 
                                            ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-l-indigo-600' 
                                            : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <span className="truncate text-sm">{file}</span>
                                    <ChevronRight 
                                        size={14} 
                                        className={`transition-transform ${selectedFile === file ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Right Content: Log Entries */}
                <div className="flex-1 space-y-6 min-w-0">
                    {/* Toolbar */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาข้อความใน Log..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-3 py-2 bg-gray-50 border-gray-200 rounded-xl text-xs focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        title="เริ่มจาก"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-3 py-2 bg-gray-50 border-gray-200 rounded-xl text-xs focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        title="จนถึง"
                                    />
                                </div>
                                <select
                                    value={level}
                                    onChange={(e) => {
                                        setLevel(e.target.value);
                                        // Auto search on level change
                                        router.get(route('admin.logs.index'), {
                                            file: selectedFile,
                                            search,
                                            level: e.target.value,
                                            start_date: startDate,
                                            end_date: endDate
                                        }, { preserveState: true });
                                    }}
                                    className="px-3 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 min-w-[140px]"
                                >
                                    <option value="">ทุกระดับ (All Levels)</option>
                                    <option value="ERROR">ERROR / CRITICAL</option>
                                    <option value="WARNING">WARNING</option>
                                    <option value="INFO">INFO</option>
                                    <option value="DEBUG">DEBUG</option>
                                </select>
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
                                >
                                    กรองข้อมูล
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={route('admin.logs.download', { filename: selectedFile })}
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="ดาวน์โหลดไฟล์"
                                >
                                    <Download size={20} />
                                </a>
                                <button
                                    onClick={clearLog}
                                    className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    title="ล้างข้อมูลในไฟล์นี้"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Log List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-48">Timestamp</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-32">Level</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {logs.length > 0 ? (
                                        logs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors align-top">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-mono text-gray-500">{log.timestamp}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getLevelColor(log.level)}`}>
                                                        {getLevelIcon(log.level)}
                                                        {log.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-800 break-words font-mono whitespace-pre-wrap leading-relaxed max-w-2xl overflow-hidden">
                                                        {log.message}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <SearchX size={48} strokeWidth={1} className="mb-4" />
                                                    <p className="text-lg font-medium">ไม่พบรายการ Log ที่แสดงผลได้</p>
                                                    <p className="text-sm mt-1">ลองเปลี่ยนการค้นหาหรือไฟล์ Log อื่น</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="text-center pb-8">
                        <p className="text-xs text-gray-400 italic">แสดงผลเฉพาะ 1,000 บรรทัดล่าสุดเพื่อประสิทธิภาพระบบ</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
