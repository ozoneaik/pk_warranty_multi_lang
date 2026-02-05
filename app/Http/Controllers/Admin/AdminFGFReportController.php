<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\ReferralHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminFGFReportController extends Controller
{
    //
    public function index(Request $request)
    {
        $query = ReferralHistory::query();

        // 1. Search Filter (ค้นหาจาก ชื่อ/ID ผู้เชิญ หรือ ผู้ถูกเชิญ)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('referrer_name', 'like', "%{$search}%")
                    ->orWhere('referrer_uid', 'like', "%{$search}%")
                    ->orWhere('referee_name', 'like', "%{$search}%")
                    ->orWhere('referee_uid', 'like', "%{$search}%");
            });
        }

        // 2. Status Filter (สถานะการรับรางวัล)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status_referrer', $request->status);
        }

        // 3. Date Filter (วันที่สมัครสมาชิก)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('registered_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        // เรียงลำดับล่าสุดก่อน และ Pagination
        $items = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Reports/ReportFGF', [
            'items' => $items,
            'filters' => $request->all(['search', 'status', 'start_date', 'end_date']),
        ]);
    }
}
