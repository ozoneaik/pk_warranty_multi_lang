<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Reward;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminRewardController extends Controller
{
    public function index(Request $request)
    {
        // ดึงข้อมูลล่าสุดมาแสดง
        // $rewards = Reward::orderBy('created_at', 'desc')->paginate(10);

        $query = Reward::query();

        // --- Filter by Tier (member_group) ---
        if ($request->filled('tier') && $request->tier !== 'all') {
            // กรอง member_group ที่ตรงกับ tier หรือเป็น all (เพราะ all เห็นได้ทุก tier)
            // หรือจะกรองแบบเป๊ะๆ ก็ได้ แล้วแต่ Business Logic
            $query->where('member_group', $request->tier);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reward_name', 'like', "%{$search}%")
                    ->orWhere('rewards_id', 'like', "%{$search}%");
            });
        }

        $rewards = $query->orderBy('created_at', 'desc')->paginate(10)
            ->withQueryString(); 

        return Inertia::render('Admin/Rewards/Index', [
            'rewards' => $rewards,
            'filters' => $request->only(['tier', 'search'])
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->query('search');

        if (!$search) {
            return response()->json(['error' => 'กรุณาระบุรหัสสินค้า'], 400);
        }

        // 1. เช็คใน Database เราก่อน
        $existing = Reward::where('rewards_id', $search)->first();
        if ($existing) {
            return response()->json([
                'status' => 'EXISTING',
                'message' => 'มีรหัสสินค้านี้ในระบบแล้ว',
                'data' => $existing
            ]);
        }

        // 2. ถ้าไม่มี ให้ไปยิง API ภายนอก
        try {
            // หมายเหตุ: URL นี้ต้องเข้าถึงได้จริงจาก Server
            $response = Http::timeout(5)->get("https://warranty-sn.pumpkin.tools/api/getdata", [
                'search' => $search
            ]);

            $data = $response->json();

            // เช็คโครงสร้าง Response ตาม API จริงของคุณ
            if (!isset($data['status']) || $data['status'] !== 'SUCCESS' || empty($data['assets'][$search])) {
                return response()->json(['error' => 'ไม่พบข้อมูลสินค้าจากระบบภายนอก'], 404);
            }

            $asset = $data['assets'][$search];

            // Map ข้อมูลกลับไปให้ Frontend
            return response()->json([
                'status' => 'NEW',
                'data' => [
                    'rewards_id'   => $asset['pid'],
                    'reward_name' => $asset['pname'],
                    // ดึงรูปแรก ถ้ามี
                    'image_url'   => $asset['imagesku'][0] ?? null,
                    // ค่า Default
                    'quota_limit_total' => 100,
                    'is_stock_control' => true,
                    'is_active' => true,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'เชื่อมต่อ API ไม่สำเร็จ: ' . $e->getMessage()], 500);
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Rewards/Create');
    }

    public function store(Request $request)
    {
        // 1. Validate ข้อมูล
        $validated = $request->validate([
            'reward_name' => 'required|string|max:255',
            'rewards_id' => 'required|string|unique:mysql_slip.rewards,rewards_id',
            'reward_code' => 'nullable|string',

            // Points
            'points_silver' => 'nullable|integer|min:0',
            'points_gold' => 'nullable|integer|min:0',
            'points_platinum' => 'nullable|integer|min:0',

            // Target Group
            'member_group' => 'nullable|string',
            'birth_month' => 'nullable|string',
            'member_type' => 'nullable|string',
            'category' => 'nullable|string',

            // [อัปเดต] ไม่บังคับ field เดิมแล้ว เพราะจะใช้จาก rules แทน
            'quota_limit_total' => 'nullable|integer|min:0',
            'quota_limit_per_user' => 'nullable|integer|min:0',

            // [เพิ่ม] Validate Quota Rules (Array)
            'quota_rules' => 'nullable|array',
            'quota_rules.*.property' => 'required|string|in:total,per_user',
            'quota_rules.*.tier' => 'required|string',
            'quota_rules.*.frequency' => 'required|string',
            'quota_rules.*.quantity' => 'required|integer|min:0',

            // Details & Media
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'qr_code_description' => 'nullable|string',

            // Settings
            'is_missions_only' => 'boolean',
            'is_auto_timer' => 'boolean',
            'is_stock_control' => 'boolean',
            'is_thermal_printer' => 'boolean',
            'is_big_commerce' => 'boolean',
            'delivery_type' => 'required|in:delivery,receive_at_store',
            'visibility_settings' => 'required|in:admin,user,both',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        // 2. [เพิ่ม] Logic ซิงค์ข้อมูลใหม่กลับไป Field เก่า (เพื่อความเข้ากันได้)
        // หา Rule ที่เป็น Total All Time
        $totalRule = collect($request->quota_rules)
            ->where('property', 'total')
            ->where('tier', 'all')
            ->where('frequency', 'all_time')
            ->first();

        // หา Rule ที่เป็น Per User All Time
        $perUserRule = collect($request->quota_rules)
            ->where('property', 'per_user')
            ->where('tier', 'all')
            ->where('frequency', 'all_time')
            ->first();

        // ถ้ามี Rule ให้ใช้ค่าจาก Rule, ถ้าไม่มีให้ใช้ค่าที่ส่งมาปกติ หรือเป็น 0
        $validated['quota_limit_total'] = $totalRule['quantity'] ?? $request->input('quota_limit_total', 0);
        $validated['quota_limit_per_user'] = $perUserRule['quantity'] ?? $request->input('quota_limit_per_user', 0);

        // 3. จัดการรูปภาพ (Code เดิม)
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('rewards', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }
        // กรณีดึง URL มาจาก API (search) แต่ไม่ได้อัปโหลดไฟล์ใหม่
        elseif ($request->filled('image_url')) {
            $validated['image_url'] = $request->image_url;
        }

        unset($validated['image_file']);

        $user = Auth::user();

        // ค้นหาลูกค้าที่ข้อมูลตรงกับ Admin ที่ Login (เช็คจาก Line ID หรือ เบอร์โทร)
        $customer = TblCustomerProd::where(function ($query) use ($user) {
            if ($user->line_id) {
                $query->where('cust_line', $user->line_id);
            }
            if ($user->phone) {
                $query->orWhere('cust_tel', $user->phone);
            }
        })->first();

        // ถ้าเจอให้ใช้ ID ของ TblCustomerProd, ถ้าไม่เจอให้เป็น null
        $validated['created_by'] = $customer ? $customer->id : null;

        // 4. บันทึกข้อมูล
        Reward::create($validated);

        return redirect()->route('admin.rewards.index')->with('success', 'สร้างของรางวัลเรียบร้อยแล้ว');
    }

    public function edit($id)
    {
        $reward = Reward::findOrFail($id);

        // แปลง quota_rules จาก JSON เป็น Array (ถ้าใน Model มี cast 'array' แล้วไม่ต้องทำก็ได้)
        // แต่เพื่อความชัวร์ส่งไปแบบนี้ Frontend จะรับได้เลย

        return Inertia::render('Admin/Rewards/Edit', [
            'reward' => $reward
        ]);
    }

    public function update(Request $request, $id)
    {
        $reward = Reward::findOrFail($id);

        // Validate ข้อมูล
        $validated = $request->validate([
            'reward_name' => 'required|string|max:255',
            'rewards_id' => ['required', 'string', Rule::unique('mysql_slip.rewards', 'rewards_id')->ignore($reward->id)],

            // Code ต้องไม่ซ้ำกับคนอื่น ยกเว้นตัวเอง
            'reward_code' => 'nullable|string',

            // Points
            'points_silver' => 'nullable|integer|min:0',
            'points_gold' => 'nullable|integer|min:0',
            'points_platinum' => 'nullable|integer|min:0',

            // Target & Quota
            'member_group' => 'nullable|string',
            'birth_month' => 'nullable|string',
            'member_type' => 'nullable|string',
            'category' => 'nullable|string',

            // Quota Rules (เหมือน Store)
            'quota_rules' => 'nullable|array',
            'quota_rules.*.property' => 'required|string',
            'quota_rules.*.tier' => 'required|string',
            'quota_rules.*.frequency' => 'required|string',
            'quota_rules.*.quantity' => 'required|integer|min:0',

            // Details
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            // รับ image_url เดิมมาด้วยเผื่อไม่ได้อัปใหม่
            'image_url' => 'nullable|string',
            'description' => 'nullable|string',
            'qr_code_description' => 'nullable|string',

            // Settings
            'is_missions_only' => 'boolean',
            'is_auto_timer' => 'boolean',
            'is_stock_control' => 'boolean',
            'is_thermal_printer' => 'boolean',
            'is_big_commerce' => 'boolean',
            'delivery_type' => 'required|in:delivery,receive_at_store',
            'visibility_settings' => 'required|in:admin,user,both',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        // Logic Sync Quota กลับไป field เก่า (เหมือน Store)
        $totalRule = collect($request->quota_rules)->where('property', 'total')->first();
        $perUserRule = collect($request->quota_rules)->where('property', 'per_user')->first();

        $validated['quota_limit_total'] = $totalRule['quantity'] ?? $request->input('quota_limit_total', 0);
        $validated['quota_limit_per_user'] = $perUserRule['quantity'] ?? $request->input('quota_limit_per_user', 0);

        // จัดการรูปภาพ (ถ้ามีการอัปโหลดใหม่)
        if ($request->hasFile('image_file')) {
            // ลบรูปเก่า (ถ้ามีและเป็นไฟล์ใน storage เรา)
            if ($reward->image_url && str_contains($reward->image_url, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $reward->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image_file')->store('rewards', 'public');
            $validated['image_url'] = '/storage/' . $path;
        } else {
            // ถ้าไม่อัปใหม่ ให้ใช้ URL เดิมที่ส่งมา (หรือจาก DB)
            $validated['image_url'] = $request->image_url ?? $reward->image_url;
        }

        unset($validated['image_file']);

        // อัปเดตข้อมูล
        $reward->update($validated);

        return redirect()->route('admin.rewards.index')->with('success', 'อัปเดตของรางวัลเรียบร้อยแล้ว');
    }

    // --- 3. Destroy: ลบข้อมูล ---
    public function destroy($id)
    {
        $reward = Reward::findOrFail($id);

        // ลบรูปภาพออกจาก Storage (Optional: ถ้าต้องการลบไฟล์ขยะด้วย)
        if ($reward->image_url && str_contains($reward->image_url, '/storage/')) {
            $path = str_replace('/storage/', '', $reward->image_url);
            Storage::disk('public')->delete($path);
        }

        $reward->delete();

        return redirect()->route('admin.rewards.index')->with('success', 'ลบของรางวัลเรียบร้อยแล้ว');
    }
}
