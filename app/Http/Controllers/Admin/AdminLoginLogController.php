<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminLoginLogController extends Controller
{
    //
    public function index(Request $request)
    {
        $query = LoginLog::with('user')->orderBy('login_at', 'desc');

        // เพิ่มตัวกรอง (Filter) พื้นฐาน
        // if ($request->search) {
        //     $query->where('line_id', 'like', "%{$request->search}%")
        //         ->orWhere('ip_address', 'like', "%{$request->search}%");
        // }

        if ($request->search) {
            $search = $request->search;
            // ครอบ where ด้วย function เพื่อให้ OR ไม่ไปกระทบกับเงื่อนไขอื่นในอนาคต
            $query->where(function ($q) use ($search) {
                $q->where('line_id', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    // เพิ่มการค้นหาจากชื่อในตาราง users
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }
        
        Log::channel('admin')->info('Admin เข้าชมหน้า Login Logs', [
            'admin_id' => Auth::guard('admin')->id() ?? Auth::id()
        ]);

        return Inertia::render('Admin/LoginLogs/Index', [
            'logs' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }
}
