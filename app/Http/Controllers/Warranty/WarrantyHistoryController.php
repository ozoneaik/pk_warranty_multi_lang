<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarrantyHistoryController extends Controller
{
    public function history(){
        return Inertia::render('Warranty/WarrantyHistory');
    }
}
