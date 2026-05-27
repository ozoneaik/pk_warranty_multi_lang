<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblHistoryProd;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminWarrantyDashboardController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(29)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // ปรับเวลาให้คลุมทั้งวัน เพื่อใช้ whereBetween แทน whereDate (ช่วยให้ Index ทำงานได้)
        $queryStart = $startDate . ' 00:00:00';
        $queryEnd = $endDate . ' 23:59:59';

        // Base 1: ตัด leftJoin ออกตรงนี้ เพื่อให้ Query สถิติต่างๆ เบาที่สุด
        $base = TblHistoryProd::where('warranty_from', 'warranty_pumpkin_crm')
            ->whereBetween('timestamp', [$queryStart, $queryEnd]);

        // ── Stats Cards (รวม 4 Queries ให้เหลือ Query เดียว) ─────────
        $statsData = (clone $base)->select(
            DB::raw('COUNT(*) as total_all'),
            DB::raw("SUM(CASE WHEN approval = 'Y' THEN 1 ELSE 0 END) as total_approved"),
            DB::raw("SUM(CASE WHEN approval = 'N' THEN 1 ELSE 0 END) as total_rejected"),
            DB::raw("SUM(CASE WHEN approval IS NULL OR approval = '' THEN 1 ELSE 0 END) as total_pending")
        )->first();

        $totalAll = (int) $statsData->total_all;
        $totalApproved = (int) $statsData->total_approved;
        $totalRejected = (int) $statsData->total_rejected;
        $totalPending = (int) $statsData->total_pending;

        // ── Approval Status Donut Chart ──────────────────────────────
        $approvalChart = [
            ['name' => 'ผ่านการอนุมัติ', 'value' => $totalApproved, 'color' => '#10b981'],
            ['name' => 'รอดำเนินการ', 'value' => $totalPending, 'color' => '#f59e0b'],
            ['name' => 'ไม่ผ่านการอนุมัติ', 'value' => $totalRejected, 'color' => '#ef4444'],
        ];

        // ── Monthly Trend Bar Chart ──────────────────────────────────
        $byMonth = (clone $base)
            ->select(
                DB::raw("DATE_FORMAT(timestamp, '%Y-%m') as month"),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN approval = 'Y' THEN 1 ELSE 0 END) as approved"),
                DB::raw("SUM(CASE WHEN approval = 'N' THEN 1 ELSE 0 END) as rejected"),
                DB::raw("SUM(CASE WHEN approval IS NULL OR approval = '' THEN 1 ELSE 0 END) as pending")
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($r) => [
                'month' => $r->month,
                'total' => (int) $r->total,
                'approved' => (int) $r->approved,
                'rejected' => (int) $r->rejected,
                'pending' => (int) $r->pending,
            ]);

        // ── Top Channels (buy_from) ──────────────────────────────────
        $channelChart = (clone $base)
            ->select('buy_from', DB::raw('COUNT(*) as total'))
            ->whereNotNull('buy_from')
            ->where('buy_from', '!=', '')
            ->groupBy('buy_from')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn($r) => ['name' => $r->buy_from, 'value' => (int) $r->total]);

        // ── Top Products ─────────────────────────────────────────────
        $productChart = (clone $base)
            ->select(
                DB::raw("COALESCE(NULLIF(product_name,''), NULLIF(model_name,''), model_code, 'ไม่ระบุ') as product"),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('product')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn($r) => ['name' => $r->product ?? 'ไม่ระบุ', 'value' => (int) $r->total]);

        // ── Recent Registrations (paginated) ────────────────────────
        // เอา leftJoin มาไว้เฉพาะส่วนที่ดึงข้อมูลตาราง เพราะเป็นจุดเดียวที่ต้องการชื่อลูกค้า
        $recent = (clone $base)
            ->leftJoin('tbl_customer_prod as prod', 'prod.cust_uid', '=', 'tbl_history_prod.lineid')
            ->select(
                'tbl_history_prod.id',
                'prod.cust_firstname AS customer_name',
                'tbl_history_prod.cust_tel',
                'tbl_history_prod.lineid',
                'tbl_history_prod.serial_number',
                'tbl_history_prod.product_name',
                'tbl_history_prod.model_name',
                'tbl_history_prod.model_code',
                'tbl_history_prod.buy_from',
                'tbl_history_prod.store_name',
                'tbl_history_prod.buy_date',
                'tbl_history_prod.approval',
                'tbl_history_prod.approver',
                'tbl_history_prod.timestamp'
            )
            ->orderByDesc('tbl_history_prod.id')
            ->paginate(10)
            ->withQueryString();

        Log::channel('admin')->info('Admin เข้าชม Warranty Registration Dashboard', [
            'admin_id' => Auth::guard('admin')->id() ?? Auth::id(),
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        return Inertia::render('Admin/Reports/WarrantyDashboard', [
            'stats' => [
                'total' => $totalAll,
                'approved' => $totalApproved,
                'pending' => $totalPending,
                'rejected' => $totalRejected,
            ],
            'approval_chart' => $approvalChart,
            'by_month' => $byMonth,
            'channel_chart' => $channelChart,
            'product_chart' => $productChart,
            'recent' => $recent,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
