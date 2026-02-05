<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Coupons;
use App\Models\MasterWaaranty\TblCustomerProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Pest\Support\Str;

class AdminCouponController extends Controller
{
    public function index()
    {
        $coupons = Coupons::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Coupons/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|required_if:is_auto_generate_code,false|string|max:100|unique:mysql_slip.coupons,code',
            'is_auto_generate_code' => 'boolean',
            'member_group' => 'nullable|array',
            'birth_month' => 'nullable|string',
            'quota_limit_total' => 'nullable|integer|min:0',
            'quota_limit_user' => 'nullable|integer|min:0',
            'member_type' => 'nullable|string',

            // Toggles
            'is_link_traffic_source' => 'boolean',
            'is_new_member_only' => 'boolean',
            'is_auto_timer' => 'boolean',
            'is_big_commerce' => 'boolean',

            // Conditions
            'discount_value' => 'nullable|numeric|min:0',
            'discount_unit' => 'required|in:BAHT,PERCENT,POINT',
            'min_order_amount' => 'nullable|numeric|min:0',

            // Content
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',

            // Duration
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'expiry_mode' => 'required|in:DATE,DYNAMIC',
            'expiry_dynamic_value' => 'nullable|required_if:expiry_mode,DYNAMIC|integer|min:1',
            'expiry_dynamic_unit' => 'nullable|required_if:expiry_mode,DYNAMIC|in:DAYS,MONTHS,YEARS',
            'is_expiry_notification' => 'boolean',

            'show_in_new_member_menu' => 'boolean',

            // Channels
            'qr_code_description' => 'nullable|string',
            'external_link' => 'nullable|url',
            'redeemed_channels' => 'nullable|array',

            'is_active' => 'boolean',
        ]);

        if ($request->boolean('is_auto_generate_code')) {
            // สุ่ม Code 8 หลัก จนกว่าจะไม่ซ้ำ
            do {
                $code = strtoupper(Str::random(8));
            } while (Coupons::where('code', $code)->exists());

            $validated['code'] = $code;
        }

        // จัดการรูปภาพ (S3)
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('coupons', 's3');
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
        
        Coupons::create($validated);

        return redirect()->route('admin.coupons.index')->with('success', 'สร้างคูปองเรียบร้อยแล้ว');
    }

    public function edit($id)
    {
        $coupon = Coupons::findOrFail($id);
        return Inertia::render('Admin/Coupons/Edit', [
            'coupon' => $coupon
        ]);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupons::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100|unique:mysql_slip.coupons,code,' . $id,
            'is_auto_generate_code' => 'boolean',
            'member_group' => 'nullable|array',
            'birth_month' => 'nullable|string',
            'quota_limit_total' => 'nullable|integer|min:0',
            'quota_limit_user' => 'nullable|integer|min:0',
            'member_type' => 'nullable|string',

            'is_link_traffic_source' => 'boolean',
            'is_new_member_only' => 'boolean',
            'is_auto_timer' => 'boolean',
            'is_big_commerce' => 'boolean',

            'discount_value' => 'nullable|numeric|min:0',
            'discount_unit' => 'required|in:BAHT,PERCENT,POINT',
            'min_order_amount' => 'nullable|numeric|min:0',

            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',

            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'expiry_mode' => 'required|in:DATE,DYNAMIC',
            'expiry_dynamic_value' => 'nullable|required_if:expiry_mode,DYNAMIC|integer|min:1',
            'expiry_dynamic_unit' => 'nullable|required_if:expiry_mode,DYNAMIC|in:DAYS,MONTHS,YEARS',
            'is_expiry_notification' => 'boolean',

            'show_in_new_member_menu' => 'boolean',

            'qr_code_description' => 'nullable|string',
            'external_link' => 'nullable|url',
            'redeemed_channels' => 'nullable|array',

            'is_active' => 'boolean',
        ]);

        if ($request->boolean('is_auto_generate_code')) {
            // ถ้า Code เดิมว่างอยู่ หรือต้องการให้ Gen ใหม่เมื่อติ๊กถูก
            if (empty($validated['code'])) {
                do {
                    $code = strtoupper(Str::random(8));
                } while (Coupons::where('code', $code)->where('id', '!=', $id)->exists());
                $validated['code'] = $code;
            }
        }

        if ($request->hasFile('image_file')) {
            // ลบไฟล์เก่า
            if ($coupon->image_url) {
                $oldPath = parse_url($coupon->image_url, PHP_URL_PATH);
                $oldPath = ltrim($oldPath, '/');
                Storage::disk('s3')->delete($oldPath);
            }

            // อัปโหลดใหม่
            $path = $request->file('image_file')->store('coupons', 's3');
            $validated['image_url'] = Storage::disk('s3')->url($path);
        }
        unset($validated['image_file']);

        $coupon->update($validated);

        return redirect()->route('admin.coupons.index')->with('success', 'อัปเดตคูปองเรียบร้อยแล้ว');
    }

    public function destroy($id)
    {
        $coupon = Coupons::findOrFail($id);

        if ($coupon->image_url) {
            $oldPath = parse_url($coupon->image_url, PHP_URL_PATH);
            $oldPath = ltrim($oldPath, '/');
            Storage::disk('s3')->delete($oldPath);
        }

        $coupon->delete();

        return redirect()->route('admin.coupons.index')->with('success', 'ลบคูปองเรียบร้อยแล้ว');
    }
}
