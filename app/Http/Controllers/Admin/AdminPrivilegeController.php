<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Privilege;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminPrivilegeController extends Controller
{
    public function index()
    {
        $privileges = Privilege::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Admin/Privileges/Index', [
            'privileges' => $privileges
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Privileges/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'privilege_name' => 'required|string|max:255',
            // privilege_code ต้องไม่ซ้ำ
            'privilege_code' => 'required|string|unique:mysql_slip.privileges,privilege_code',

            // Points
            'points_silver' => 'nullable|integer|min:0',
            'points_gold' => 'nullable|integer|min:0',
            'points_platinum' => 'nullable|integer|min:0',

            // Target Group
            'member_group' => 'nullable|string',
            'birth_month' => 'nullable|string',
            'member_type' => 'nullable|string',

            // Quota Rules (JSON)
            'quota_rules' => 'nullable|array',
            'quota_rules.*.property' => 'required|string',
            'quota_rules.*.tier' => 'required|string',
            'quota_rules.*.frequency' => 'required|string',
            'quota_rules.*.quantity' => 'required|integer|min:0',

            // Details & Media
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'qr_code_description' => 'nullable|string',

            // Settings
            'is_auto_timer' => 'boolean',
            'is_stock_control' => 'boolean', // อาจจะไม่จำเป็นสำหรับ Privilege แต่ใส่ไว้ให้ครบโครงสร้าง
            'is_thermal_printer' => 'boolean',
            'is_big_commerce' => 'boolean',
            'delivery_type' => 'required|in:delivery,receive_at_store',
            'visibility_settings' => 'required|in:admin,user,both',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        // จัดการรูปภาพ
        // if ($request->hasFile('image_file')) {
        //     $path = $request->file('image_file')->store('privileges', 'public');
        //     $validated['image_url'] = '/storage/' . $path;
        // }
        // unset($validated['image_file']);
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('privileges', 's3');

            $validated['image_url'] = Storage::disk('s3')->url($path);
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

        Privilege::create($validated);

        return redirect()->route('admin.privileges.index')->with('success', 'สร้างสิทธิพิเศษเรียบร้อยแล้ว');
    }

    public function edit($id)
    {
        $privilege = Privilege::findOrFail($id);
        return Inertia::render('Admin/Privileges/Edit', [
            'privilege' => $privilege
        ]);
    }

    public function update(Request $request, $id)
    {
        $privilege = Privilege::findOrFail($id);

        $validated = $request->validate([
            'privilege_name' => 'required|string|max:255',
            'privilege_code' => ['required', 'string', Rule::unique('mysql_slip.privileges', 'privilege_code')->ignore($privilege->id)],

            'points_silver' => 'nullable|integer|min:0',
            'points_gold' => 'nullable|integer|min:0',
            'points_platinum' => 'nullable|integer|min:0',

            'member_group' => 'nullable|string',
            'birth_month' => 'nullable|string',
            'member_type' => 'nullable|string',

            'quota_rules' => 'nullable|array',
            'quota_rules.*.property' => 'required|string',
            'quota_rules.*.tier' => 'required|string',
            'quota_rules.*.frequency' => 'required|string',
            'quota_rules.*.quantity' => 'required|integer|min:0',

            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'qr_code_description' => 'nullable|string',

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

        // if ($request->hasFile('image_file')) {
        //     if ($privilege->image_url && str_contains($privilege->image_url, '/storage/')) {
        //         Storage::disk('public')->delete(str_replace('/storage/', '', $privilege->image_url));
        //     }
        //     $path = $request->file('image_file')->store('privileges', 'public');
        //     $validated['image_url'] = '/storage/' . $path;
        // }
        // unset($validated['image_file']);
        if ($request->hasFile('image_file')) {

            // ลบไฟล์เก่า
            if ($privilege->image_url) {
                $oldPath = parse_url($privilege->image_url, PHP_URL_PATH);
                $oldPath = ltrim($oldPath, '/');

                Storage::disk('s3')->delete($oldPath);
            }

            // อัปโหลดใหม่
            $path = $request->file('image_file')->store('privileges', 's3');
            $validated['image_url'] = Storage::disk('s3')->url($path);
        }
        unset($validated['image_file']);

        $privilege->update($validated);

        return redirect()->route('admin.privileges.index')->with('success', 'อัปเดตสิทธิพิเศษเรียบร้อยแล้ว');
    }

    public function destroy($id)
    {
        $privilege = Privilege::findOrFail($id);
        if ($privilege->image_url && str_contains($privilege->image_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $privilege->image_url));
        }
        $privilege->delete();
        return redirect()->route('admin.privileges.index')->with('success', 'ลบข้อมูลเรียบร้อยแล้ว');
    }
}
