<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Dealer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminDealerController extends Controller
{
    private $channels = [
        ['id' => 1, 'name' => 'ตัวแทนจำหน่าย'],
        ['id' => 2, 'name' => 'PUMPKIN CORNER'],
        ['id' => 3, 'name' => 'ร้านค้าออนไลน์'],
        ['id' => 4, 'name' => 'ไทวัสดุ'],
        ['id' => 5, 'name' => 'Homepro'],
        ['id' => 6, 'name' => 'Mega home'],
        ['id' => 7, 'name' => 'Dohome'],
        ['id' => 8, 'name' => 'Global house'],
        ['id' => 9, 'name' => 'ฮาร์ดแวร์เฮาส์'],
    ];

    public function index()
    {
        // ดึงข้อมูลร้านค้าทั้งหมดส่งไปให้ React
        $dealers = Dealer::orderBy('id', 'desc')->get();
        return Inertia::render('Admin/Dealer/Index', [
            'dealers' => $dealers,
            'channels' => $this->channels
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'channel_id' => 'required|integer',
            'CustID'    => 'nullable|string|max:100',
            // เช็คชื่อซ้ำในฐานข้อมูล เพื่อป้องกัน Admin พิมพ์ชื่อร้านเดิมซ้ำ
            // ระบุการเชื่อมต่อ mysql_slip สำหรับการตรวจสอบ unique
            // 'name' => 'required|string|max:255|unique:mysql_slip.dealers,name',
            'name'       => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
        ]);

        Dealer::create([
            'channel_id' => $request->channel_id,
            'CustID' => $request->CustID,
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
            'channel_id' => 'required|integer',
            'CustID'    => 'nullable|string|max:100',
            // อนุญาตให้ใช้ชื่อเดิมของตัวเองได้ และระบุการเชื่อมต่อ mysql_slip
            'name' => 'required|string|max:255|unique:mysql_slip.dealers,name,' . $id,
            'branch' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $dealer->update([
            'channel_id' => $request->channel_id,
            'CustID' => $request->CustID,
            'name' => $request->name,
            'branch' => $request->branch,
            // สำคัญ: ต้องเช็คว่ามีการส่ง is_active มาไหม ถ้าไม่มีให้ใช้ค่าเดิม
            'is_active' => $request->has('is_active') ? $request->is_active : $dealer->is_active,
        ]);

        Log::channel('admin')->info('Admin แก้ไข Dealer', [
            'admin_id'  => Auth::guard('admin')->id() ?? Auth::id(),
            'dealer_id' => $id
        ]);

        return redirect()->back()->with('success', 'อัปเดตข้อมูลสำเร็จ');
    }

    public function destroy($id)
    {
        Dealer::findOrFail($id)->delete();

        Log::channel('admin')->info('Admin ลบ Dealer', [
            'admin_id'  => Auth::guard('admin')->id() ?? Auth::id(),
            'dealer_id' => $id
        ]);

        return redirect()->back()->with('success', 'ลบร้านค้าสำเร็จ');
    }
}
