<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Order;
use App\Models\MasterWaaranty\PointTransaction;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminOrderReportController extends Controller
{
    //
    public function index(Request $request)
    {
        $query = Order::query();

        // 1. Filter Search (ค้นหาจากเลข Order, ชื่อลูกค้า, หรือเบอร์โทร)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // 2. Filter Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // 3. Filter Date Range (Optional: ถ้าอยากกรองตามวันที่)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        // เรียงลำดับล่าสุดก่อน และแบ่งหน้า
        $orders = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/Reports/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->all(['search', 'status', 'start_date', 'end_date']),
        ]);
    }

    //เพิ่มฟังก์ชันเปลี่ยนสถานะและคืนแต้ม
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $newStatus = $request->input('status'); // รับค่า status มา

        // ถ้าสถานะเหมือนเดิม ไม่ต้องทำอะไร
        if ($order->status === $newStatus) {
            return back();
        }

        // ใช้ Transaction เพื่อความปลอดภัย
        DB::transaction(function () use ($order, $newStatus) {

            // กรณี A: ยกเลิกออเดอร์ (Cancelled) -> ต้องคืนแต้ม
            if ($newStatus === 'cancelled' && $order->status !== 'cancelled') {

                // 1. คืนแต้มให้ลูกค้า
                $customer = TblCustomerProd::where('cust_line', $order->line_id)->lockForUpdate()->first();

                if ($customer && $order->points_redeemed > 0) {
                    $customer->increment('point', $order->points_redeemed);

                    // 2. สร้าง Transaction คืนแต้ม (Refund Log)
                    PointTransaction::create([
                        'line_id'          => $order->line_id,
                        'transaction_type' => 'refund', // ชนิดรายการคืนแต้ม
                        'process_code'     => 'ORDER_CANCEL',
                        'reference_id'     => $order->order_number, // อ้างอิงถึง Order ที่ยกเลิก
                        'pid'              => $order->product_code,
                        'pname'            => 'คืนแต้ม: ' . $order->product_name,
                        'point_before'     => $customer->point - $order->points_redeemed,
                        'point_tran'       => $order->points_redeemed, // เป็นบวก (+)
                        'point_after'      => $customer->point,
                        'trandate'         => now(),
                        'docdate'          => now(),
                        'created_at'       => now(),
                        'is_shown'         => 0, // ตั้งเป็น 0 เพื่อให้เด้ง Popup แจ้งลูกค้า
                    ]);
                }
            }

            // กรณี B: ถ้าเปลี่ยนจาก Cancelled กลับมาเป็น Pending/Completed (ตัดแต้มใหม่) - *เผื่อไว้*
            // ปกติไม่ค่อยทำกัน แต่ถ้ามีเคสนี้ต้องตัดแต้มอีกรอบ
            elseif ($order->status === 'cancelled' && $newStatus !== 'cancelled') {
                $customer = TblCustomerProd::where('cust_line', $order->line_id)->lockForUpdate()->first();
                if ($customer && $order->points_redeemed > 0) {
                    if ($customer->point < $order->points_redeemed) {
                        throw new \Exception("แต้มลูกค้าไม่พอสำหรับการกู้คืนสถานะออเดอร์");
                    }
                    $customer->decrement('point', $order->points_redeemed);
                    // สร้าง Transaction ตัดแต้มใหม่ (Re-deduct)
                    // ... (คล้ายๆ Refund แต่ point_tran ติดลบ)
                }
            }

            // 3. อัปเดตสถานะ Order
            $order->update(['status' => $newStatus]);
        });

        return back()->with('success', 'อัปเดตสถานะเรียบร้อยแล้ว');
    }

    // ✅ ฟังก์ชันใหม่: เช็คสถานะจาก API
    public function syncStatus($id)
    {
        $order = Order::findOrFail($id);

        try {
            // 1. ยิง API ไปตรวจสอบ
            $response = Http::timeout(5)->post('https://slip.pumpkin.tools/serial/R_mainstatusorder.php', [
                'jobno' => $order->order_number
            ]);

            $apiData = $response->json();

            // ตรวจสอบว่ามีข้อมูลส่งกลับมาไหม
            if (!isset($apiData['status'])) {
                return back()->with('error', 'ไม่พบข้อมูลสถานะจากระบบภายนอก');
            }

            $apiStatusText = $apiData['status'];

            // 2. แปลงข้อความไทยจาก API เป็น Status ภาษาอังกฤษในระบบเรา
            // [IMPORTANT] คุณต้องจับคู่คำให้ตรงกับที่ API ส่งมาจริง
            $mappedStatus = match ($apiStatusText) {
                'รับคำสั่งซื้อ'                  => 'pending',
                'กำลังดำเนินการจัดเตรียมสินค้า' => 'processing',
                'อยู่ระหว่างการจัดส่ง'          => 'shipped',
                'จัดส่งสำเร็จ'                  => 'completed',
                'ยกเลิกคำสั่งซื้อ'               => 'cancelled',
                default => null // ถ้าไม่ตรงเคสไหนเลย ให้เป็น null (ไม่ทำอะไร)
            };

            if (!$mappedStatus) {
                return back()->with('error', "สถานะจาก API คือ '$apiStatusText' ซึ่งไม่ตรงกับระบบ");
            }

            // 3. ถ้าสถานะเปลี่ยน ให้เรียกใช้ฟังก์ชันอัปเดต
            if ($order->status !== $mappedStatus) {
                $this->processOrderStatusUpdate($order, $mappedStatus);
                return back()->with('success', "อัปเดตสถานะเป็น '$mappedStatus' เรียบร้อยแล้ว");
            }

            return back()->with('info', "สถานะปัจจุบันเป็นปัจจุบันแล้ว ($mappedStatus)");
        } catch (\Exception $e) {
            Log::error("Sync Order Error: " . $e->getMessage());
            return back()->with('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ API');
        }
    }

    private function processOrderStatusUpdate($order, $newStatus)
    {
        DB::transaction(function () use ($order, $newStatus) {

            // Logic A: ยกเลิกออเดอร์ -> คืนแต้ม
            if ($newStatus === 'cancelled' && $order->status !== 'cancelled') {
                $customer = TblCustomerProd::where('cust_line', $order->line_id)->lockForUpdate()->first();

                if ($customer && $order->points_redeemed > 0) {
                    $customer->increment('point', $order->points_redeemed);

                    PointTransaction::create([
                        'line_id'          => $order->line_id,
                        'transaction_type' => 'refund',
                        'process_code'     => 'ORDER_CANCEL',
                        'reference_id'     => $order->order_number,
                        'pid'              => $order->product_code,
                        'pname'            => 'คืนแต้ม: ' . $order->product_name,
                        'point_before'     => $customer->point - $order->points_redeemed,
                        'point_tran'       => $order->points_redeemed,
                        'point_after'      => $customer->point,
                        'trandate'         => now(),
                        'docdate'          => now(),
                        'created_at'       => now(),
                        'is_shown'         => 0,
                    ]);
                }
            }
            // Logic B: เปลี่ยนจาก Cancelled กลับมาเป็นอย่างอื่น -> ตัดแต้มใหม่
            elseif ($order->status === 'cancelled' && $newStatus !== 'cancelled') {
                $customer = TblCustomerProd::where('cust_line', $order->line_id)->lockForUpdate()->first();
                if ($customer && $order->points_redeemed > 0) {
                    if ($customer->point < $order->points_redeemed) {
                        throw new \Exception("แต้มลูกค้าไม่พอสำหรับการกู้คืนสถานะออเดอร์");
                    }
                    $customer->decrement('point', $order->points_redeemed);

                    // บันทึก Log การตัดแต้มซ้ำ (ถ้าต้องการ)
                }
            }

            // Update Status
            $order->update(['status' => $newStatus]);
        });
    }
}
