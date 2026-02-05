<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PointPopupController extends Controller
{
    // ดึงรายการแต้มที่ยังไม่ได้แสดง (รวมยอดมาเลย)
    // public function checkPendingPoints()
    // {
    //     $user = Auth::user();

    //     // หา Transaction ที่เป็น 'earn' และยังไม่เคย show
    //     $transactions = PointTransaction::where('line_id', $user->line_id) // หรือใช้ cust_tel ตาม Logic คุณ
    //         ->where('transaction_type', 'earn')
    //         ->where('is_shown', 0)
    //         ->get();

    //     if ($transactions->isEmpty()) {
    //         return response()->json(['has_points' => false]);
    //     }

    //     // รวมยอดแต้มทั้งหมดที่จะโชว์ทีเดียว
    //     $totalPoints = $transactions->sum('point_tran');

    //     // เก็บ ID เพื่อเอาไว้อัปเดตทีหลัง
    //     $ids = $transactions->pluck('id');

    //     return response()->json([
    //         'has_points' => true,
    //         'total_points' => $totalPoints,
    //         'transaction_ids' => $ids,
    //         'title' => 'ยินดีด้วย! คุณได้รับแต้ม',
    //         'message' => 'จากการร่วมกิจกรรม', // อาจจะปรับ Logic ให้ดึงชื่อกิจกรรมถ้ามีอันเดียว
    //     ]);
    // }
    public function checkPendingPoints()
    {
        $user = Auth::user();

        // ดึง Transaction ทั้งหมดที่ยังไม่ show
        $transactions = PointTransaction::where('line_id', $user->line_id)
            ->where('transaction_type', 'earn')
            ->where('is_shown', 0)
            ->orderBy('created_at', 'desc') // เรียงจากใหม่ไปเก่า
            ->get();

        if ($transactions->isEmpty()) {
            return response()->json(['has_points' => false]);
        }

        $totalPoints = $transactions->sum('point_tran');
        $items = $transactions->map(function ($t) {
            return [
                'id' => $t->id,
                'title' => $this->getTransactionName($t), // ชื่อรายการ (เช่น แนะนำเพื่อน)
                'point' => $t->point_tran,
                'date' => $t->created_at->format('d/m/Y H:i'),
            ];
        });
        $ids = $transactions->pluck('id');

        // ✅ หาที่มาของแต้ม (Source)
        // ถ้ามีหลายรายการ ให้เอาชื่อรายการล่าสุดมาโชว์ แล้วบอกว่า "และอื่นๆ"
        $latestTran = $transactions->first();

        // กำหนดชื่อรายการจากข้อมูลที่มี (ปรับตาม Logic ของคุณ)
        // เช่นใช้ process_code หรือ reference_id มา map เป็นชื่อภาษาไทย
        $sourceName = $this->getTransactionName($latestTran);

        if ($transactions->count() > 1) {
            $message = "จาก $sourceName และรายการอื่นๆ";
        } else {
            $message = "จาก $sourceName";
        }

        return response()->json([
            'has_points' => true,
            // 'total_points' => $totalPoints,
            'items' => $items,
            'transaction_ids' => $ids,
            'title' => 'ยินดีด้วย! คุณได้รับแต้ม',
            'message' => $message, // ส่งข้อความที่ระบุที่มา
        ]);
    }

    private function getTransactionName($transaction)
    {
        // ตัวอย่าง Logic การแปลง (ปรับตาม Database ของคุณ)
        return match ($transaction->process_code) {
            'REGISTER' => 'สมัครสมาชิกครั้งแรก',
            'WARRANTY_APPROVE' => 'การลงทะเบียนรับประกันสินค้า',
            'FRIEND_REFERRAL' => 'การแนะนำเพื่อน',
            'CHECKIN' => 'การเช็คอินประจำวัน',
            'BIRTHDAY' => 'สิทธิ์เดือนเกิด',
            default => 'กิจกรรมร่วมสนุก',
        };
    }

    // บันทึกว่าแสดงผลแล้ว (Acknowledge)
    public function acknowledge(Request $request)
    {
        $ids = $request->input('transaction_ids', []);

        if (!empty($ids)) {
            PointTransaction::whereIn('id', $ids)->update(['is_shown' => 1]);
        }

        return response()->json(['success' => true]);
    }
}
