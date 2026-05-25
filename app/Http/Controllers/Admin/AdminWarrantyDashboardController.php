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
        $endDate   = $request->input('end_date',   Carbon::now()->format('Y-m-d'));

        // Base: เฉพาะข้อมูลจาก Pumpkin CRM และกรองตามช่วงวันที่ลงทะเบียน (timestamp)
        $base = TblHistoryProd::where('tbl_history_prod.warranty_from', 'warranty_pupmkin_crm')
            ->leftJoin('tbl_customer_prod as prod', 'prod.cust_uid', '=', 'tbl_history_prod.lineid')
            ->whereDate('tbl_history_prod.timestamp', '>=', $startDate)
            ->whereDate('tbl_history_prod.timestamp', '<=', $endDate);

        // ── Stats Cards ──────────────────────────────────────────────
        $totalAll      = (clone $base)->count();
        $totalApproved = (clone $base)->where('tbl_history_prod.approval', 'Y')->count();
        $totalRejected = (clone $base)->where('tbl_history_prod.approval', 'N')->count();
        $totalPending  = (clone $base)->where(function ($q) {
            $q->whereNull('tbl_history_prod.approval')->orWhere('tbl_history_prod.approval', '');
        })->count();

        // ── Approval Status Donut Chart ──────────────────────────────
        $approvalChart = [
            ['name' => 'ผ่านการอนุมัติ',    'value' => $totalApproved, 'color' => '#10b981'],
            ['name' => 'รอดำเนินการ',         'value' => $totalPending,  'color' => '#f59e0b'],
            ['name' => 'ไม่ผ่านการอนุมัติ',  'value' => $totalRejected, 'color' => '#ef4444'],
        ];

        // ── Monthly Trend Bar Chart (group by month of timestamp) ───
        $byMonth = (clone $base)
            ->select(
                DB::raw("DATE_FORMAT(tbl_history_prod.timestamp, '%Y-%m') as month"),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN tbl_history_prod.approval = 'Y' THEN 1 ELSE 0 END) as approved"),
                DB::raw("SUM(CASE WHEN tbl_history_prod.approval = 'N' THEN 1 ELSE 0 END) as rejected"),
                DB::raw("SUM(CASE WHEN tbl_history_prod.approval IS NULL OR tbl_history_prod.approval = '' THEN 1 ELSE 0 END) as pending")
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($r) => [
                'month'    => $r->month,
                'total'    => (int) $r->total,
                'approved' => (int) $r->approved,
                'rejected' => (int) $r->rejected,
                'pending'  => (int) $r->pending,
            ]);

        // ── Top Channels (buy_from) ──────────────────────────────────
        $channelChart = (clone $base)
            ->select('tbl_history_prod.buy_from', DB::raw('COUNT(*) as total'))
            ->whereNotNull('tbl_history_prod.buy_from')
            ->where('tbl_history_prod.buy_from', '!=', '')
            ->groupBy('buy_from')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn($r) => ['name' => $r->buy_from, 'value' => (int) $r->total]);

        // ── Top Products ─────────────────────────────────────────────
        $productChart = (clone $base)
            ->select(
                DB::raw("COALESCE(NULLIF(tbl_history_prod.product_name,''), NULLIF(tbl_history_prod.model_name,''), tbl_history_prod.model_code, 'ไม่ระบุ') as product"),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('product')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn($r) => ['name' => $r->product ?? 'ไม่ระบุ', 'value' => (int) $r->total]);

        // ── Recent Registrations (paginated) ────────────────────────
        $recent = (clone $base)
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
            'admin_id'   => Auth::guard('admin')->id() ?? Auth::id(),
            'start_date' => $startDate,
            'end_date'   => $endDate,
        ]);

        return Inertia::render('Admin/Reports/WarrantyDashboard', [
            'stats' => [
                'total'    => $totalAll,
                'approved' => $totalApproved,
                'pending'  => $totalPending,
                'rejected' => $totalRejected,
            ],
            'approval_chart' => $approvalChart,
            'by_month'       => $byMonth,
            'channel_chart'  => $channelChart,
            'product_chart'  => $productChart,
            'recent'         => $recent,
            'filters' => [
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ],
        ]);
    }
}
