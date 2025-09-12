<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WarrantyHistoryController extends Controller
{
    public function history()
    {
        $histories = TblHistoryProd::query()
            ->where('cust_tel', Auth::user()->phone)
            ->orderBy('id', 'desc')->get();
        return Inertia::render('Warranty/WarrantyHistory', [
            'histories' => $histories
        ]);
    }
}
