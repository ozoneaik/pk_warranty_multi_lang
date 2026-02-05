<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminCustomerReportController extends Controller
{
    public function index(Request $request)
    {
        // 1. รับค่า Filter
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $status = $request->input('status');
        $tier = $request->input('tier'); 

        $queryStart = $startDate . ' 00:00:00';
        $queryEnd = $endDate . ' 23:59:59';

        // 2. Query Stats
        $totalCustomers = TblCustomerProd::count();
        
        $newCustomers = TblCustomerProd::whereBetween('datetime', [$queryStart, $queryEnd])->count();
        $totalRegistrations = TblHistoryProd::whereBetween('buy_date', [$startDate, $endDate])->count();

        // 3. ดึงรายชื่อลูกค้าใหม่ (Table 1)
        $customersList = TblCustomerProd::whereBetween('datetime', [$queryStart, $queryEnd])
            // Filter Status (Enabled/Disabled)
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            // [ใหม่] Filter Tier (Silver/Gold/Platinum) -> เช็คจาก column tier_key
            ->when($tier, function ($query, $tier) {
                return $query->where('tier_key', $tier);
            })
            // เพิ่ม tier_key เข้าไปใน select เพื่อเอาไปโชว์หน้าบ้าน
            ->select('cust_firstname', 'cust_lastname', 'cust_tel', 'cust_email', 'datetime', 'status', 'tier_key')
            ->orderBy('datetime', 'desc')
            ->paginate(10, ['*'], 'cust_page')
            ->withQueryString();

        // 4. ดึงรายละเอียดการลงทะเบียน (Table 2)
        $historyList = TblHistoryProd::whereBetween('buy_date', [$startDate, $endDate])
            ->select('id', 'model_code', 'serial_number', 'buy_date')
            ->orderBy('buy_date', 'desc')
            ->paginate(10, ['*'], 'hist_page')
            ->withQueryString();

        $totalPointsGiven = PointTransaction::whereBetween('created_at', [$queryStart, $queryEnd])
            ->where('transaction_type', 'earn') // นับเฉพาะแต้มที่แจก (earn) ไม่นับที่แลก (redeem)
            ->sum('point_tran');

        $totalPointsRedeemed = PointTransaction::whereBetween('created_at', [$queryStart, $queryEnd])
            ->where('transaction_type', 'redeem')
            ->sum('point_tran');

        //เพิ่ม จำนวนการแลกของรางวัล
        $countRewards = PointTransaction::whereBetween('created_at', [$queryStart, $queryEnd])
            ->where('transaction_type', 'redeem')
            ->where('product_type', 'reward')->count();

        $countPrivileges = PointTransaction::whereBetween('created_at', [$queryStart, $queryEnd])
            ->where('transaction_type', 'redeem')
            ->where('product_type', 'privilege')->count();

        $countCoupons = PointTransaction::whereBetween('created_at', [$queryStart, $queryEnd])
            ->where('transaction_type', 'redeem')
            ->where('product_type', 'coupon')->count();

        $ageGroups = TblCustomerProd::selectRaw("
            CASE
                WHEN cust_birthdate IS NULL OR cust_birthdate = '' OR cust_birthdate = '0000-00-00' THEN 'Unknown'
                WHEN TIMESTAMPDIFF(YEAR, cust_birthdate, CURDATE()) BETWEEN 0 AND 10 THEN '0-10'
                WHEN TIMESTAMPDIFF(YEAR, cust_birthdate, CURDATE()) BETWEEN 11 AND 20 THEN '11-20'
                WHEN TIMESTAMPDIFF(YEAR, cust_birthdate, CURDATE()) BETWEEN 21 AND 30 THEN '21-30'
                WHEN TIMESTAMPDIFF(YEAR, cust_birthdate, CURDATE()) BETWEEN 31 AND 40 THEN '31-40'
                WHEN TIMESTAMPDIFF(YEAR, cust_birthdate, CURDATE()) BETWEEN 41 AND 50 THEN '41-50'
                WHEN TIMESTAMPDIFF(YEAR, cust_birthdate, CURDATE()) BETWEEN 51 AND 60 THEN '51-60'
                ELSE '60+'
            END AS age_range,
            COUNT(*) as count
        ")
            ->whereBetween('datetime', [$queryStart, $queryEnd])
            ->groupBy('age_range')
            ->orderBy('age_range')
            ->get();

        $ageChartData = [
            '11-20' => 0,
            '21-30' => 0,
            '31-40' => 0,
            '41-50' => 0,
            '51-60' => 0,
            '60+' => 0,
            'Unknown' => 0
        ];

        foreach ($ageGroups as $group) {
            $range = $group->age_range;
            if (array_key_exists($range, $ageChartData)) {
                $ageChartData[$range] = $group->count;
            } else {
                // กรณี 0-10 หรืออื่นๆ ที่ไม่ได้ define ไว้ ให้รวมเข้า Unknown หรือสร้าง key ใหม่ก็ได้
                $ageChartData['Unknown'] += $group->count;
            }
        }

        $formattedAgeData = [];
        $colors = ['#4ade80', '#22c55e', '#facc15', '#fb923c', '#f87171', '#ef4444', '#94a3b8']; // สีตามรูป
        $i = 0;
        foreach ($ageChartData as $range => $count) {
            $formattedAgeData[] = [
                'name' => "Age $range",
                'value' => $count,
                'color' => $colors[$i] ?? '#cccccc'
            ];
            $i++;
        }

        //เพิ่มกราฟกลุ่มสมาชิก Tier ต่างๆ (Silver/Gold/Platinum)
        $tierGroups = TblCustomerProd::select('tier_key', DB::raw('count(*) as count'))
            ->whereBetween('datetime', [$queryStart, $queryEnd]) // กรองตามวันที่เลือก
            ->groupBy('tier_key')
            ->orderBy('count', 'desc')
            ->get();

        $tierChartData = [];
        // กำหนดสีให้แต่ละ Tier
        $tierColors = [
            'silver'   => '#94a3b8', // สีเทา (Silver)
            'gold'     => '#facc15', // สีเหลือง (Gold)
            'platinum' => '#818cf8', // สีม่วง/คราม (Platinum)
            'general'  => '#cbd5e1', // สีเทาอ่อน (กรณีไม่มี Tier)
        ];

        foreach ($tierGroups as $group) {
            $key = $group->tier_key ? strtolower($group->tier_key) : 'general';
            $label = $group->tier_key ? ucfirst($key) : 'General'; // แปลงตัวแรกพิมพ์ใหญ่

            $tierChartData[] = [
                'name'  => $label,
                'value' => $group->count,
                'color' => $tierColors[$key] ?? '#94a3b8' // กรณีเป็น Tier อื่นๆ ที่ไม่ได้กำหนดสี
            ];
        }

        return Inertia::render('Admin/Reports/Customer', [
            'stats' => [
                'total_customers' => $totalCustomers,
                'new_customers' => $newCustomers,
                'total_registrations' => $totalRegistrations,
                'total_points_given' => $totalPointsGiven,
                'total_points_redeemed' => $totalPointsRedeemed,
                'count_rewards' => $countRewards,
                'count_privileges' => $countPrivileges,
                'count_coupons' => $countCoupons,
            ],
            'customers' => $customersList,
            'history' => $historyList,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'tier' => $tier, // [ใหม่] ส่งค่า tier กลับไป
            ],
            'age_chart' => $formattedAgeData,
            'tier_chart' => $tierChartData,
        ]);
    }
}
