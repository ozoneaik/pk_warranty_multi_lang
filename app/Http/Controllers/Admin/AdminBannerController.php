<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminBannerController extends Controller
{
    public function index()
    {
        // เรียงตามลำดับ sort_order (น้อยไปมาก)
        $banners = Banner::orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Banner/Index', [
            'banners' => $banners
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
            'title' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'type' => 'required|in:slider,background',
        ]);

        // Upload to S3
        $path = $request->file('image')->store('banners', 's3');
        $url = Storage::disk('s3')->url($path);
        $adminId = Auth::guard('admin')->id() ?? Auth::id();

        Banner::create([
            'title' => $request->title,
            'image_path' => $url,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => true,
            'type' => $request->type,
            'created_by' => $adminId
        ]);

        return redirect()->back();
    }

    public function edit($id)
    {
        $banner = Banner::findOrFail($id);
        return Inertia::render('Admin/Banner/Edit', [
            'banner' => $banner
        ]);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'type' => 'sometimes|required|in:slider,background',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|max:2048', // รูปเป็น nullable ตอน edit
        ]);

        // ถ้ามีการอัปโหลดรูปใหม่
        if ($request->hasFile('image')) {
            // 1. ลบรูปเก่า (ถ้ามี)
            if ($banner->image_path) {
                $oldPath = parse_url($banner->image_path, PHP_URL_PATH);
                $oldPath = ltrim($oldPath, '/');
                Storage::disk('s3')->delete($oldPath);
            }

            // 2. อัปโหลดรูปใหม่
            $path = $request->file('image')->store('banners', 's3');
            $validated['image_path'] = Storage::disk('s3')->url($path);
        }

        // ลบ field image ออกจาก array เพราะใน DB ไม่มี column ชื่อ image
        unset($validated['image']);

        $adminId = Auth::guard('admin')->id() ?? Auth::id();
        $validated['updated_by'] = $adminId;

        $banner->update($validated);

        return redirect()->route('admin.banners.index')->with('success', 'Banner updated successfully');
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // ลบไฟล์จาก S3
        if ($banner->image_path) {
            $oldPath = parse_url($banner->image_path, PHP_URL_PATH);
            $oldPath = ltrim($oldPath, '/');
            Storage::disk('s3')->delete($oldPath);
        }

        $banner->delete();
        return redirect()->back();
    }
}
