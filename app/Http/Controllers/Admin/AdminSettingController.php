<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSettingController extends Controller
{
    /**
     * Show the terms and conditions edit page
     */
    public function editTerms()
    {
        $terms = Setting::get('registration_terms', '');

        return Inertia::render('Admin/Settings/Terms', [
            'terms' => $terms
        ]);
    }

    /**
     * Update the terms and conditions
     */
    public function updateTerms(Request $request)
    {
        $request->validate([
            'terms' => 'nullable|string',
        ]);

        Setting::set('registration_terms', $request->terms, 'หน้าข้อกำหนดและเงื่อนไข (Registration Flow)');

        return redirect()->back()->with('success', 'ปรับปรุงข้อกำหนดและเงื่อนไขเรียบร้อยแล้ว');
    }
}
