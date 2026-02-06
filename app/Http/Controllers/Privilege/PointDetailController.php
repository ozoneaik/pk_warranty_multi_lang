<?php

namespace App\Http\Controllers\Privilege;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\PointTransaction;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PointDetailController extends Controller
{
    public function getPointExpiry()
    {
        $user = Auth::user();
        $today = Carbon::now()->startOfDay();

        // ดึงเฉพาะรายการที่เพิ่มแต้ม (earn) และยังไม่หมดอายุ
        $history = PointTransaction::where('line_id', $user->line_id)
            ->where('transaction_type', 'earn')
            ->where('point_tran', '>', 0)
            ->where(function ($q) use ($today) {
                $q->whereNull('expired_at')
                    ->orWhereDate('expired_at', '>=', $today);
            })
            // ->orderBy('expired_at', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($tran) {
                $daysLeft = $tran->expired_at
                    ? (int)Carbon::now()->diffInDays($tran->expired_at, false)
                    : null;

                return [
                    'pname' => $tran->pname ?? 'คะแนนสะสม',
                    'points' => (int)$tran->point_tran,
                    'earned_at' => $tran->trandate ? Carbon::parse($tran->trandate)->format('d/m/Y') : '-',
                    'expired_at' => $tran->expired_at ? Carbon::parse($tran->expired_at)->format('d/m/Y') : 'ไม่มีวันหมดอายุ',
                    'days_left' => $daysLeft,
                    'is_urgent' => ($daysLeft !== null && $daysLeft <= 30) // เตือนถ้าเหลือต่ำกว่า 30 วัน
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}
