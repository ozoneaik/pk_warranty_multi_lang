<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Dealer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDealerController extends Controller
{
    public function index()
    {
        // ดึงข้อมูลร้านค้าทั้งหมดส่งไปให้ React
        $dealers = Dealer::orderBy('id', 'desc')->get();
        return Inertia::render('Admin/Dealer/Index', [
            'dealers' => $dealers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            // เช็คชื่อซ้ำในฐานข้อมูล เพื่อป้องกัน Admin พิมพ์ชื่อร้านเดิมซ้ำ
            // ระบุการเชื่อมต่อ mysql_slip สำหรับการตรวจสอบ unique
            'name' => 'required|string|max:255|unique:mysql_slip.dealers,name',
            'branch' => 'nullable|string|max:255',
        ]);

        Dealer::create([
            'name' => $request->name,
            'branch' => $request->branch,
            'is_active' => $request->is_active ?? true,
        ]);

        // ส่ง with('success') กลับไป ถ้าฝั่ง React มีตัวดัก Flash message
        return redirect()->back()->with('success', 'เพิ่มร้านค้าสำเร็จ');
    }

    public function update(Request $request, $id)
    {
        $dealer = Dealer::findOrFail($id);

        $request->validate([
            // อนุญาตให้ใช้ชื่อเดิมของตัวเองได้ และระบุการเชื่อมต่อ mysql_slip
            'name' => 'required|string|max:255|unique:mysql_slip.dealers,name,' . $id,
            'branch' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $dealer->update([
            'name' => $request->name,
            'branch' => $request->branch,
            // สำคัญ: ต้องเช็คว่ามีการส่ง is_active มาไหม ถ้าไม่มีให้ใช้ค่าเดิม
            'is_active' => $request->has('is_active') ? $request->is_active : $dealer->is_active,
        ]);

        return redirect()->back()->with('success', 'อัปเดตข้อมูลสำเร็จ');
    }

    public function destroy($id)
    {
        Dealer::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'ลบร้านค้าสำเร็จ');
    }
}
