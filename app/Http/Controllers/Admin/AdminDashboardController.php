<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    //
    public function index(Request $request)
    {
        // 1. รับค่าวันที่จาก Request (ถ้าไม่ได้เลือก ให้ใช้ 7 วันย้อนหลังเป็นค่าเริ่มต้น)
        $startDate = $request->input('start_date', Carbon::today()->subDays(6)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::today()->format('Y-m-d'));

        // แปลงเป็นเวลาเริ่มต้น (00:00) และสิ้นสุดของวัน (23:59)
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 🌟 2. สร้าง Base Query ที่ถูก Filter ด้วยวันที่แล้ว
        $baseQuery = LoginLog::whereBetween('login_at', [$start, $end]);

        // 3. สรุปตัวเลขตามช่วงเวลาที่เลือก
        $totalLogins = (clone $baseQuery)->count();
        $totalSuccess = (clone $baseQuery)->where('status', 'success')->count();
        $totalFailed = (clone $baseQuery)->where('status', '!=', 'success')->count();
        $newRegisters = (clone $baseQuery)->where('metadata->type', 'new_register')->count();

        // 4. ข้อมูลกราฟเส้น (ดึงข้อมูลดิบมาก่อน)
        $rawTrend = (clone $baseQuery)
            ->select(DB::raw('DATE(login_at) as raw_date'), DB::raw('count(*) as total'))
            ->groupBy('raw_date')
            ->pluck('total', 'raw_date')
            ->toArray();

        $trendChart = [];
        // สร้าง Period เพื่อเติม 0 ในวันที่ไม่มีคนเข้าใช้งาน
        if ($start->diffInDays($end) <= 90) { // ป้องกันการลูปมากเกินไปถ้าระยะเวลาห่างจัด
            foreach (CarbonPeriod::create($start, $end) as $date) {
                $dateString = $date->format('Y-m-d');
                $trendChart[] = [
                    'date' => $date->format('d/m'),
                    'ผู้เข้าใช้งาน' => $rawTrend[$dateString] ?? 0 // ถ้าไม่มีข้อมูลให้ใส่ 0
                ];
            }
        } else {
            // ถ้าระยะเวลาเกิน 90 วัน ไม่ต้องเติม 0 ให้กราฟ
            foreach ($rawTrend as $date => $total) {
                $trendChart[] = [
                    'date' => Carbon::parse($date)->format('d/m/Y'),
                    'ผู้เข้าใช้งาน' => $total
                ];
            }
        }

        // 5. ข้อมูลกราฟแท่ง (ช่องทางการ Login)
        $providerStats = (clone $baseQuery)
            ->select('provider', DB::raw('count(*) as total'))
            ->groupBy('provider')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->provider ?? 'Unknown',
                    'จำนวน' => $item->total
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'menus' => Auth::guard('admin')->user()->getAllowedMenus(),
            'filters' => [ // 🌟 ส่งค่า Filter กลับไปให้หน้าบ้านจำค่าไว้
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'stats' => [
                'total' => $totalLogins,
                'success' => $totalSuccess,
                'failed' => $totalFailed,
                'newRegisters' => $newRegisters,
                'trendData' => $trendChart,
                'providerData' => $providerStats,
            ]
        ]);
    }
}
