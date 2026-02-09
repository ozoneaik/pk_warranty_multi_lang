<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\ReferralHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminPcRankingReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = ReferralHistory::query()
            // Join ไปยังตารางลูกค้าเพื่อเอาเบอร์โทร
            ->leftJoin('tbl_customer_prod', 'referral_histories.referrer_uid', '=', 'tbl_customer_prod.cust_uid')
            ->select(
                'referral_histories.referrer_uid',
                'referral_histories.referrer_name',
                'tbl_customer_prod.cust_tel', 
                DB::raw('SUM(referral_histories.points_referrer) as total_points'),
                DB::raw('COUNT(referral_histories.referee_uid) as total_referrals')
            )
            ->groupBy(
                'referral_histories.referrer_uid',
                'referral_histories.referrer_name',
                'tbl_customer_prod.cust_tel'
            )
            ->orderBy('total_points', 'desc');

        if ($startDate && $endDate) {
            $query->whereBetween('referral_histories.registered_at', [$startDate, $endDate]);
        }

        $rankings = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Reports/PcRanking/Index', [
            'rankings' => $rankings,
            'filters'  => $request->only(['start_date', 'end_date'])
        ]);
    }
}
