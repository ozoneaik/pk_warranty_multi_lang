<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLoginLogController extends Controller
{
    //
    public function index(Request $request)
    {
        $query = LoginLog::query()->orderBy('login_at', 'desc');

        // เพิ่มตัวกรอง (Filter) พื้นฐาน
        if ($request->search) {
            $query->where('line_id', 'like', "%{$request->search}%")
                ->orWhere('ip_address', 'like', "%{$request->search}%");
        }

        return Inertia::render('Admin/LoginLogs/Index', [
            'logs' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }
}
