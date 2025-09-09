<?php

namespace App\Http\Controllers\Warranty;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarrantyHistoryController extends Controller
{
    public function history()
    {
        $histories = [
            ['id' => 1,'sn' => 'jokelsadfjlasf', 'pid' => '50277', 'p_name' => 'joker on the rock', 'status' => true],
            ['id' => 2,'sn' => 'jokelsadfjlasf', 'pid' => '50277', 'p_name' => 'joker on the rock', 'status' => true],
            ['id' => 3,'sn' => 'jokelsadfjlasf', 'pid' => '50277', 'p_name' => 'joker on the rock', 'status' => true],
            ['id' => 4,'sn' => 'jokelsadfjlasf', 'pid' => '50277', 'p_name' => 'joker on the rock', 'status' => true],
            ['id' => 5,'sn' => 'jokelsadfjlasf', 'pid' => '50277', 'p_name' => 'joker on the rock', 'status' => true],
        ];
        return Inertia::render('Warranty/WarrantyHistory', [
            'histories' => $histories
        ]);
    }
}
