<?php

namespace App\Http\Controllers\Admin;

use App\Exports\WarrantyRegistrationExport;
use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AdminWarrantyRegistrationController extends Controller
{
    private function buildQuery(Request $request)
    {
        $query = TblHistoryProd::where('warranty_from', 'warranty_pupmkin_crm')
            ->orderBy('id', 'desc');

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('cust_tel', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('lineid', 'like', "%{$search}%")
                    ->orWhere('customer_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('approval')) {
            if ($request->approval === 'pending') {
                $query->where(function ($q) {
                    $q->whereNull('approval')->orWhere('approval', '');
                });
            } else {
                $query->where('approval', $request->approval);
            }
        }

        if ($request->filled('start_date')) {
            $query->whereDate('buy_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('buy_date', '<=', $request->end_date);
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = $this->buildQuery($request);

        Log::channel('admin')->info('Admin เข้าชมหน้าทะเบียนรับประกัน CRM', [
            'admin_id' => Auth::guard('admin')->id() ?? Auth::id()
        ]);

        return Inertia::render('Admin/WarrantyRegistrations/Index', [
            'registrations' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'approval', 'start_date', 'end_date'])
        ]);
    }

    public function exportExcel(Request $request)
    {
        $query = $this->buildQuery($request);

        $data = $query->get();

        Log::channel('admin')->info('Admin ส่งออกทะเบียนรับประกัน CRM', [
            'admin_id' => Auth::guard('admin')->id() ?? Auth::id(),
            'total'    => $data->count(),
        ]);

        $filename = 'warranty_crm_' . date('Ymd_His') . '.xlsx';

        return Excel::download(new WarrantyRegistrationExport($data), $filename);
    }
}
