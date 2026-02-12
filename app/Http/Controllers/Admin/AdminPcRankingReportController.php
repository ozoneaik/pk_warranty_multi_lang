<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\ReferralHistory;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminPcRankingReportController extends Controller
{
    // public function index(Request $request)
    // {
    //     $startDate = $request->input('start_date');
    //     $endDate = $request->input('end_date');

    //     $query = ReferralHistory::query()
    //         // Join ไปยังตารางลูกค้าเพื่อเอาเบอร์โทร
    //         ->leftJoin('tbl_customer_prod', 'referral_histories.referrer_uid', '=', 'tbl_customer_prod.cust_uid')
    //         ->select(
    //             'referral_histories.referrer_uid',
    //             'referral_histories.referrer_name',
    //             'tbl_customer_prod.cust_tel', 
    //             DB::raw('SUM(referral_histories.points_referrer) as total_points'),
    //             DB::raw('COUNT(referral_histories.referee_uid) as total_referrals')
    //         )
    //         ->groupBy(
    //             'referral_histories.referrer_uid',
    //             'referral_histories.referrer_name',
    //             'tbl_customer_prod.cust_tel'
    //         )
    //         ->orderBy('total_points', 'desc');

    //     if ($startDate && $endDate) {
    //         $query->whereBetween('referral_histories.registered_at', [$startDate, $endDate]);
    //     }

    //     $rankings = $query->paginate(20)->withQueryString();

    //     return Inertia::render('Admin/Reports/PcRanking/Index', [
    //         'rankings' => $rankings,
    //         'filters'  => $request->only(['start_date', 'end_date'])
    //     ]);
    // }

    public function index(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // เริ่มต้น Query จากตารางประวัติการรับประกัน (History)
        $query = TblHistoryProd::query()
            ->whereNotNull('pc_code')
            ->where('pc_code', '!=', '')

            // Join เพื่อหาชื่อ PC
            ->leftJoin('tbl_customer_prod as pc', 'tbl_history_prod.pc_code', '=', 'pc.referral_code')

            ->select(
                'tbl_history_prod.pc_code as referrer_uid',
                DB::raw('COALESCE(CONCAT(pc.cust_firstname, " ", pc.cust_lastname), tbl_history_prod.pc_code) as referrer_name'),
                'pc.cust_tel',

                // แก้ไข: นับจำนวน Serial Number ที่ไม่ซ้ำกัน (Distinct)
                // เพื่อให้ 1 การลงทะเบียน (ไม่ว่าจะกี่ชิ้นในชุด) นับเป็น 1 ครั้ง
                DB::raw('COUNT(DISTINCT tbl_history_prod.serial_number) as total_referrals'),

                // ใช้ค่าเดียวกันสำหรับ points (หรือถ้ามี logic อื่นค่อยแก้ตรงนี้)
                DB::raw('COUNT(DISTINCT tbl_history_prod.serial_number) as total_points')
            )
            ->groupBy(
                'tbl_history_prod.pc_code',
                'pc.cust_firstname',
                'pc.cust_lastname',
                'pc.cust_tel'
            )
            ->orderBy('total_referrals', 'desc');

        // กรองวันที่ (ดูจากวันที่ลงทะเบียน buy_date หรือ create_at ของ history)
        // หมายเหตุ: tbl_history_prod อาจไม่มี created_at timestamps ถ้าใช้ $timestamps=false
        // ควรเช็คว่าใช้ field ไหนกรองวันที่ เช่น 'datetime' หรือ 'buy_date'
        // ในตัวอย่างนี้สมมติว่าใช้ 'buy_date'
        if ($startDate && $endDate) {
            $query->whereBetween('tbl_history_prod.timestamps', [$startDate, $endDate]);
        }

        $rankings = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Reports/PcRanking/Index', [
            'rankings' => $rankings,
            'filters'  => $request->only(['start_date', 'end_date'])
        ]);
    }
}
