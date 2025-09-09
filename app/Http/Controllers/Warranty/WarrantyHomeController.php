<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarrantyHomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Warranty/WarrantyHome');
    }
}
