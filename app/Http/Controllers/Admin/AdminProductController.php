<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminProductController extends Controller
{
    /**
     * แสดงรายการของรางวัล
     */
    public function index(Request $request)
    {
        $query = Reward::query();

        // Search Logic
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('reward_name', 'LIKE', "%{$request->search}%")
                    ->orWhere('reward_code', 'LIKE', "%{$request->search}%");
            });
        }

        // Filter by Status
        if ($request->has('status') && $request->status !== null) {
            $query->where('is_active', $request->status);
        }

        $rewards = $query->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Product/Index', [
            'rewards' => $rewards,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /**
     * แสดงหน้าฟอร์มสร้าง
     */
    public function create()
    {
        return Inertia::render('Admin/Product/Create');
    }

    /**
     * API สำหรับค้นหาข้อมูลสินค้า (AJAX)
     */
    public function search(Request $request)
    {
        $search = $request->query('search');

        if (!$search) {
            return response()->json(['error' => 'กรุณาระบุรหัสสินค้า'], 400);
        }

        // 1. เช็คใน Database เราก่อน
        $existing = Reward::where('reward_code', $search)->first();
        if ($existing) {
            return response()->json([
                'status' => 'EXISTING',
                'message' => 'มีรหัสสินค้านี้ในระบบแล้ว',
                'data' => $existing
            ]);
        }

        // 2. ถ้าไม่มี ให้ไปยิง API ภายนอก
        try {
            $response = Http::timeout(5)->get("https://warranty-sn.pumpkin.tools/api/getdata", [
                'search' => $search
            ]);

            $data = $response->json();

            if ($data['status'] !== 'SUCCESS' || empty($data['assets'][$search])) {
                return response()->json(['error' => 'ไม่พบข้อมูลสินค้าจากระบบภายนอก'], 404);
            }

            $asset = $data['assets'][$search];

            // Map ข้อมูลกลับไปให้ Frontend
            return response()->json([
                'status' => 'NEW',
                'data' => [
                    'reward_code' => $asset['pid'],
                    'reward_name' => $asset['pname'],
                    'image_url'   => $asset['imagesku'][0] ?? null,
                    // ค่า Default อื่นๆ
                    'quota_limit_total' => 100,
                    'is_stock_control' => true,
                    'is_active' => true,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'เชื่อมต่อ API ไม่สำเร็จ: ' . $e->getMessage()], 500);
        }
    }

    /**
     * บันทึกข้อมูล
     */
    public function store(Request $request)
    {
        // Validation ให้ตรงกับ Database
        $validated = $request->validate([
            'reward_name' => 'required|string|max:255',
            'reward_code' => 'nullable|string|max:100|unique:rewards,reward_code',
            'rewards_id'  => 'nullable|string|max:50', // เผื่อใช้

            // Points
            'points_silver'   => 'nullable|integer|min:0',
            'points_gold'     => 'nullable|integer|min:0',
            'points_platinum' => 'nullable|integer|min:0',

            // Details
            'image_url'           => 'nullable|url',
            'description'         => 'nullable|string',
            'qr_code_description' => 'nullable|string',

            // Quota
            'quota_limit_total'    => 'nullable|integer|min:0',
            'quota_limit_per_user' => 'nullable|integer|min:0',

            // Configs
            'is_missions_only'   => 'boolean',
            'is_auto_timer'      => 'boolean',
            'is_stock_control'   => 'boolean',
            'is_thermal_printer' => 'boolean',
            'is_big_commerce'    => 'boolean',
            'is_active'          => 'boolean',

            // Date & Delivery
            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'delivery_type'       => 'required|in:delivery,receive_at_store',
            'visibility_settings' => 'required|in:admin,user,both',
        ]);

        Reward::create($validated);

        return redirect()->route('products.index')
            ->with('message', 'สร้างของรางวัลเรียบร้อยแล้ว');
    }

    /**
     * แสดงหน้าแก้ไข
     */
    public function edit($id)
    {
        $reward = Reward::findOrFail($id);
        return Inertia::render('Admin/Product/Create', [ // ใช้หน้า Create ร่วมกัน (Re-use Component)
            'reward' => $reward,
            'isEdit' => true
        ]);
    }

    /**
     * อัปเดตข้อมูล
     */
    public function update(Request $request, $id)
    {
        $reward = Reward::findOrFail($id);

        $validated = $request->validate([
            'reward_name' => 'required|string|max:255',
            'reward_code' => ['nullable', 'string', Rule::unique('rewards')->ignore($reward->id)],

            'points_silver'   => 'nullable|integer|min:0',
            'points_gold'     => 'nullable|integer|min:0',
            'points_platinum' => 'nullable|integer|min:0',

            'image_url'           => 'nullable|url',
            'description'         => 'nullable|string',
            'qr_code_description' => 'nullable|string',

            'quota_limit_total'    => 'nullable|integer|min:0',
            'quota_limit_per_user' => 'nullable|integer|min:0',

            'is_missions_only'   => 'boolean',
            'is_auto_timer'      => 'boolean',
            'is_stock_control'   => 'boolean',
            'is_thermal_printer' => 'boolean',
            'is_big_commerce'    => 'boolean',
            'is_active'          => 'boolean',

            'start_date'          => 'nullable|date',
            'end_date'            => 'nullable|date|after_or_equal:start_date',
            'delivery_type'       => 'required|in:delivery,receive_at_store',
            'visibility_settings' => 'required|in:admin,user,both',
        ]);

        $reward->update($validated);

        return redirect()->route('products.index')
            ->with('message', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    }

    public function destroy($id)
    {
        Reward::findOrFail($id)->delete();
        return redirect()->route('products.index')->with('message', 'ลบข้อมูลเรียบร้อย');
    }
}
