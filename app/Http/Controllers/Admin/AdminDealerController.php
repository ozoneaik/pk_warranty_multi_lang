<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Channel;
use App\Models\MasterWaaranty\Dealer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminDealerController extends Controller
{
    public function index()
    {
        $dealers = Dealer::orderBy('id', 'desc')->get();
        $channels = Channel::orderBy('id')->get();

        return Inertia::render('Admin/Dealer/Index', [
            'dealers' => $dealers,
            'channels' => $channels,
        ]);
    }

    // ── Dealer CRUD ──────────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate([
            'channel_id' => 'required|integer',
            'CustID'    => 'nullable|string|max:100',
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

        Log::channel('admin')->info('Admin เพิ่ม Dealer', [
            'admin_id'    => Auth::guard('admin')->id() ?? Auth::id(),
            'dealer_name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'เพิ่มร้านค้าสำเร็จ');
    }

    public function update(Request $request, $id)
    {
        $dealer = Dealer::findOrFail($id);

        $request->validate([
            'channel_id' => 'required|integer',
            'CustID'    => 'nullable|string|max:100',
            'name' => 'required|string|max:255|unique:mysql_slip.dealers,name,' . $id,
            'branch' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $dealer->update([
            'channel_id' => $request->channel_id,
            'CustID' => $request->CustID,
            'name' => $request->name,
            'branch' => $request->branch,
            'is_active' => $request->has('is_active') ? $request->is_active : $dealer->is_active,
        ]);

        Log::channel('admin')->info('Admin แก้ไข Dealer', [
            'admin_id'  => Auth::guard('admin')->id() ?? Auth::id(),
            'dealer_id' => $id,
        ]);

        return redirect()->back()->with('success', 'อัปเดตข้อมูลสำเร็จ');
    }

    public function destroy($id)
    {
        Dealer::findOrFail($id)->delete();

        Log::channel('admin')->info('Admin ลบ Dealer', [
            'admin_id'  => Auth::guard('admin')->id() ?? Auth::id(),
            'dealer_id' => $id,
        ]);

        return redirect()->back()->with('success', 'ลบร้านค้าสำเร็จ');
    }

    // ── Channel CRUD ─────────────────────────────────────────────

    public function storeChannel(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255|unique:mysql_slip.channels,name',
            'is_active' => 'boolean',
        ]);

        Channel::create([
            'name'      => $request->name,
            'is_active' => $request->is_active ?? true,
        ]);

        Log::channel('admin')->info('Admin เพิ่ม Channel', [
            'admin_id'     => Auth::guard('admin')->id() ?? Auth::id(),
            'channel_name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'เพิ่ม Channel สำเร็จ');
    }

    public function updateChannel(Request $request, $id)
    {
        $channel = Channel::findOrFail($id);

        $request->validate([
            'name'      => 'required|string|max:255|unique:mysql_slip.channels,name,' . $id,
            'is_active' => 'boolean',
        ]);

        $channel->update([
            'name'      => $request->name,
            'is_active' => $request->has('is_active') ? $request->is_active : $channel->is_active,
        ]);

        Log::channel('admin')->info('Admin แก้ไข Channel', [
            'admin_id'   => Auth::guard('admin')->id() ?? Auth::id(),
            'channel_id' => $id,
        ]);

        return redirect()->back()->with('success', 'อัปเดต Channel สำเร็จ');
    }

    public function destroyChannel($id)
    {
        $channel = Channel::findOrFail($id);

        if ($channel->dealers()->exists()) {
            return redirect()->back()->withErrors(['channel' => 'ไม่สามารถลบได้ มีร้านค้าที่ใช้ Channel นี้อยู่']);
        }

        $channel->delete();

        Log::channel('admin')->info('Admin ลบ Channel', [
            'admin_id'   => Auth::guard('admin')->id() ?? Auth::id(),
            'channel_id' => $id,
        ]);

        return redirect()->back()->with('success', 'ลบ Channel สำเร็จ');
    }
}
