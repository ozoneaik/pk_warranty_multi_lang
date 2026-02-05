<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TypeProcessPoint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPointProcessController extends Controller
{
    // แสดงรายการทั้งหมด
    public function index()
    {
        $processes = TypeProcessPoint::query()
            ->orderBy('id', 'asc') // เรียงตาม ID หรือ process_code ก็ได้
            ->get();

        return Inertia::render('Admin/Point/Index', [
            'processes' => $processes
        ]);
    }

    // แสดงหน้าสร้าง
    public function create()
    {
        return Inertia::render('Admin/Point/Create');
    }

    // บันทึกข้อมูลใหม่
    public function store(Request $request)
    {
        $validated = $request->validate([
            'process_code' => 'required|string|unique:mysql_slip.type_process_points,process_code', // ระบุ connection ให้ชัดเจน
            'process_name' => 'required|string',
            'transaction_type' => 'required|in:earn,redeem', // earn = ได้แต้ม, redeem = ใช้แต้ม
            'default_point' => 'required|integer|min:0',
            'point_silver' => 'nullable|integer|min:0',
            'point_gold' => 'nullable|integer|min:0',
            'point_platinum' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        TypeProcessPoint::create($validated);

        return redirect()->route('admin.points.index')
            ->with('message', 'เพิ่มเงื่อนไขแต้มเรียบร้อยแล้ว');
    }

    // แสดงหน้าแก้ไข
    public function edit($id)
    {
        $process = TypeProcessPoint::findOrFail($id);
        return Inertia::render('Admin/Point/Edit', [
            'process' => $process
        ]);
    }

    // อัปเดตข้อมูล
    public function update(Request $request, $id)
    {
        $process = TypeProcessPoint::findOrFail($id);

        $validated = $request->validate([
            // unique ยกเว้นตัวเอง
            'process_code' => 'required|string|unique:mysql_slip.type_process_points,process_code,' . $process->id,
            'process_name' => 'required|string',
            'transaction_type' => 'required|in:earn,redeem',
            'default_point' => 'required|integer|min:0',
            'point_silver' => 'nullable|integer|min:0',
            'point_gold' => 'nullable|integer|min:0',
            'point_platinum' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $process->update($validated);

        return redirect()->route('admin.points.index')
            ->with('message', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    }

    // ลบข้อมูล (ถ้าต้องการ)
    public function destroy($id)
    {
        $process = TypeProcessPoint::findOrFail($id);
        $process->delete();

        return redirect()->route('admin.points.index')
            ->with('message', 'ลบข้อมูลเรียบร้อยแล้ว');
    }
}
