<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Popup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminPopupController extends Controller
{
    public function index()
    {
        $popups = Popup::orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Popup/Index', [
            'popups' => $popups
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048', // Max 2MB
            'title' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        // แก้ไข: บันทึกลง S3
        $path = $request->file('image')->store('popups', 's3');
        $url = Storage::disk('s3')->url($path);
        $adminId = Auth::guard('admin')->id() ?? Auth::id();

        // ถ้าต้องการให้ Active ได้แค่อันเดียว ให้ปิดอันอื่นก่อน (Option)
        // Popup::where('is_active', true)->update(['is_active' => false]);

        Popup::create([
            'title' => $request->title,
            'image_path' => $url, // เก็บ URL ของ S3
            'is_active' => true,
            'sort_order' => $request->sort_order ?? 0,
            'created_by' => $adminId
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $popup = Popup::findOrFail($id);
        $data = $request->only(['is_active', 'sort_order']);
        $adminId = Auth::guard('admin')->id() ?? Auth::id();

        // Toggle Active Status
        if ($request->has('is_active')) {
            // (เอา logic ปิดตัวอื่นออกแล้ว เพื่อให้โชว์หลายตัว)
            $data['is_active'] = $request->is_active;
        }
        
        $data['updated_by'] = $adminId;

        $popup->update($data);
        return redirect()->back();
    }

    public function destroy($id)
    {
        $popup = Popup::findOrFail($id);

        // แก้ไข: ลบไฟล์ออกจาก S3
        if ($popup->image_path) {
            // ดึง Path จาก URL (ตัด domain ออก)
            $oldPath = parse_url($popup->image_path, PHP_URL_PATH);
            $oldPath = ltrim($oldPath, '/'); // ตัด / ตัวหน้าสุดออกถ้ามี

            Storage::disk('s3')->delete($oldPath);
        }

        $popup->delete();
        return redirect()->back();
    }
}
