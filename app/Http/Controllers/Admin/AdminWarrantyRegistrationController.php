<?php

namespace App\Http\Controllers\Admin;

use App\Exports\WarrantyRegistrationExport;
use App\Http\Controllers\Controller;
use App\Models\MasterWaaranty\TblHistoryProd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AdminWarrantyRegistrationController extends Controller
{
    private function buildQuery(Request $request)
    {
        $query = TblHistoryProd::leftJoin(
                'tbl_customer_prod',
                'tbl_history_prod.cust_tel',
                '=',
                'tbl_customer_prod.cust_tel'
            )
            ->select(
                'tbl_history_prod.*',
                DB::raw("TRIM(CONCAT(
                    COALESCE(tbl_customer_prod.cust_prefix, ''), ' ',
                    COALESCE(tbl_customer_prod.cust_firstname, ''), ' ',
                    COALESCE(tbl_customer_prod.cust_lastname, '')
                )) as customer_full_name")
            )
            ->where('tbl_history_prod.warranty_from', 'warranty_pupmkin_crm')
            ->orderBy('tbl_history_prod.id', 'desc');

        // Filter Date Range TimeStamp
        if ($request->filled('created_start')) {
            $query->whereDate('tbl_history_prod.timestamp', '>=', $request->created_start);
        }

        if ($request->filled('created_end')) {
            $query->whereDate('tbl_history_prod.timestamp', '<=', $request->created_end);
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('tbl_history_prod.customer_name', 'like', "%{$search}%")
                    ->orWhere('tbl_customer_prod.cust_firstname', 'like', "%{$search}%")
                    ->orWhere('tbl_customer_prod.cust_lastname', 'like', "%{$search}%")
                    ->orWhere('tbl_history_prod.cust_tel', 'like', "%{$search}%")
                    ->orWhere('tbl_history_prod.serial_number', 'like', "%{$search}%")
                    ->orWhere('tbl_history_prod.lineid', 'like', "%{$search}%")
                    ->orWhere('tbl_history_prod.customer_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('approval')) {
            if ($request->approval === 'pending') {
                $query->where(function ($q) {
                    $q->whereNull('tbl_history_prod.approval')->orWhere('tbl_history_prod.approval', '');
                });
            } else {
                $query->where('tbl_history_prod.approval', $request->approval);
            }
        }

        if ($request->filled('start_date')) {
            $query->whereDate('tbl_history_prod.buy_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('tbl_history_prod.buy_date', '<=', $request->end_date);
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
            'filters' => $request->only(['search', 'approval', 'start_date', 'end_date', 'created_start', 'created_end'])
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
