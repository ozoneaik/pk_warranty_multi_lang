<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarrantyFormController extends Controller
{
    public function form(){
        return Inertia::render('Warranty/WarrantyForm');
    }
}
