<?php

namespace App\Http\Controllers;

use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TblCustomerProdVat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomerProfileController extends Controller
{
    public function welcome()
    {
        $user = Auth::user();
        $customer = TblCustomerProd::query()
            ->where(function ($q) use ($user) {
                if (!empty($user->line_id)) {
                    $q->where('cust_line', $user->line_id);
                }
                if (!empty($user->phone)) {
                    $q->orWhere('cust_tel', $user->phone);
                }
            })
            ->select('cust_firstname', 'cust_lastname', 'point', 'datetime')
            ->first();
        $point = $customer->point ?? 0;
        return Inertia::render('Profile/Customer/WelComeProFile', [
            'point' => $point,
            'joined_at' => $customer->datetime ?? now(),
        ]);
    }

    public function score()
    {
        $user = Auth::user();
        $customer = TblCustomerProd::query()
            ->where(function ($q) use ($user) {
                if (!empty($user->line_id)) {
                    $q->where('cust_line', $user->line_id);
                }
                if (!empty($user->phone)) {
                    $q->orWhere('cust_tel', $user->phone);
                }
            })
            ->select('cust_firstname', 'cust_lastname', 'point', 'datetime')
            ->first();
        $point = $customer->point ?? 0;
        return Inertia::render('Profile/Customer/Score', [
            'point' => $point,
            'joined_at' => $customer->datetime ?? now(),
        ]);
    }

    public function edit()
    {
        $user = Auth::user();
        $customer = TblCustomerProd::query()
            ->leftJoin('tbl_customer_prod_vat as vat', 'tbl_customer_prod.cust_line', '=', 'vat.cust_line')
            ->where(function ($q) use ($user) {
                if (!empty($user->line_id)) {
                    $q->where('tbl_customer_prod.cust_line', $user->line_id);
                }
                if (!empty($user->phone)) {
                    $q->orWhere('tbl_customer_prod.cust_tel', $user->phone);
                }
            })
            ->select(
                'tbl_customer_prod.*',
                'vat.vat_cust_name as tax_name',
                'vat.vat_tel_c as tax_tel',
                'vat.vat_cust_address as tax_address',
                'vat.vat_cust_province as tax_province',
                'vat.vat_cust_district as tax_district',
                'vat.vat_cust_subdistrict as tax_subdistrict',
                'vat.vat_cust_zipcode as tax_zipcode'
            )
            ->first();

        Log::info('CustomerProfileController@edit - Auth User', [
            'line_id'        => $user->line_id,
            'phone'          => $user->phone,
            'found_customer' => $customer ? trim(($customer->cust_firstname ?? '') . ' ' . ($customer->cust_lastname ?? '')) : 'N/A',
        ]);
        if ($customer) {
            $mapDisplay = [
                'male'   => 'ชาย',
                'female' => 'หญิง',
            ];
            $customer->cust_gender = $mapDisplay[$customer->cust_gender] ?? null;
            $customer->cust_full_address = $customer->cust_address ?? '';
            $customer->tax_name          = $customer->tax_name ?? '';
            $customer->tax_tel           = $customer->tax_tel ?? '';
            $customer->tax_address       = $customer->tax_address ?? '';
            $customer->tax_province      = $customer->tax_province ?? '';
            $customer->tax_district      = $customer->tax_district ?? '';
            $customer->tax_subdistrict   = $customer->tax_subdistrict ?? '';
            $customer->tax_zipcode       = $customer->tax_zipcode ?? '';
        }

        return Inertia::render('Profile/Customer/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request)
    {
        // $user = Auth::user();
        $user = User::find(Auth::id());

        $validatedCustomer = $request->validate([
            'cust_firstname'    => 'required|string|max:255',
            'cust_lastname'     => 'required|string|max:255',
            'cust_gender'       => 'nullable|string|in:ชาย,หญิง',
            'cust_email'        => 'nullable|email|max:100',
            'cust_tel'          => 'required|string|max:20',
            'cust_birthdate'    => 'nullable|date',
            'cust_full_address' => 'nullable|string|max:500',
            'cust_province'     => 'nullable|string|max:255',
            'cust_district'     => 'nullable|string|max:255',
            'cust_subdistrict'  => 'nullable|string|max:255',
            'cust_zipcode'      => 'nullable|string|max:10',
        ]);

        $validatedVat = $request->validate([
            'tax_name'        => 'required|string|max:255',
            'tax_tel'         => 'required|string|max:20',
            'tax_address'     => 'required|string|max:500',
            'tax_province'    => 'required|string|max:255',
            'tax_district'    => 'required|string|max:255',
            'tax_subdistrict' => 'required|string|max:255',
            'tax_zipcode'     => 'required|string|max:10',
        ]);

        $mapDB = ['ชาย' => 'male', 'หญิง' => 'female'];
        if (!empty($validatedCustomer['cust_gender'])) {
            $validatedCustomer['cust_gender'] = $mapDB[$validatedCustomer['cust_gender']] ?? null;
        }

        $validatedCustomer['cust_address'] = $validatedCustomer['cust_full_address'] ?? '';
        $customer = TblCustomerProd::where(function ($q) use ($user) {
            if (!empty($user->line_id)) {
                $q->where('cust_line', $user->line_id);
            }
            if (!empty($user->phone)) {
                $q->orWhere('cust_tel', $user->phone);
            }
        })->first();

        DB::transaction(function () use ($user, &$customer, $validatedCustomer, $validatedVat) {

            if (!$customer) {
                $customer = new TblCustomerProd();
                $customer->cust_line = $user->line_id ?? null;
                $customer->cust_tel  = $user->phone ?? $validatedCustomer['cust_tel'];

                $customer->status    = $customer->status ?? 'enabled';
                $customer->cust_type = $customer->cust_type ?? 'line';
                $customer->cre_key   = $customer->cre_key ?? now();
                $customer->datetime  = $customer->datetime ?? now();

                $customer->cust_full_address = $customer->cust_full_address ?? '';
                $customer->cust_address      = $customer->cust_address ?? '';
                $customer->cust_subdistrict  = $customer->cust_subdistrict ?? '';
                $customer->cust_district     = $customer->cust_district ?? '';
                $customer->cust_province     = $customer->cust_province ?? '';
                $customer->cust_zipcode      = $customer->cust_zipcode ?? '';
            }

            $customer->fill($validatedCustomer);
            $customer->save();
            Auth::setUser($user);

            $user->name = trim($validatedCustomer['cust_firstname']);
            // . ' ' . $validatedCustomer['cust_lastname']);
            $user->save();

            $vat = TblCustomerProdVat::where('cust_line', $customer->cust_line)->first();
            if (!$vat) {
                $vat = new TblCustomerProdVat();
                $vat->cust_line = $customer->cust_line;
            }

            $vat->vat_cust_name        = $validatedVat['tax_name'];
            $vat->vat_tel_c            = $validatedVat['tax_tel'];
            $vat->vat_cust_address     = $validatedVat['tax_address'];
            $vat->vat_cust_province    = $validatedVat['tax_province'];
            $vat->vat_cust_district    = $validatedVat['tax_district'];
            $vat->vat_cust_subdistrict = $validatedVat['tax_subdistrict'];
            $vat->vat_cust_zipcode     = $validatedVat['tax_zipcode'];
            $vat->save();
        });

        Log::info('CustomerProfileController@update - Updated customer', [
            'line_id'     => $user->line_id,
            'phone'       => $user->phone,
            'customer_id' => $customer->id ?? null,
        ]);

        return redirect()->route('customer.profile.edit')
            ->with('success', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    }

    public function updateConsent(Request $request)
    {
        $user = Auth::user();

        $customer = TblCustomerProd::query()
            ->where(function ($q) use ($user) {
                if (!empty($user->line_id)) {
                    $q->where('cust_line', $user->line_id);
                }
                if (!empty($user->phone)) {
                    $q->orWhere('cust_tel', $user->phone);
                }
            })
            ->first();

        if (!$customer) {
            return response()->json(['error' => 'ไม่พบข้อมูลลูกค้า'], 404);
        }

        $acceptPolicy = $request->input('accept_policy') === 'Y';
        $acceptPdpa = $request->input('accept_pdpa') === 'Y';

        $customer->accept_policy = $acceptPolicy ? 'Y' : 'N';
        $customer->accept_pdpa = $acceptPdpa ? 'Y' : 'N';

        $customer->accepted_pdpa_at = $acceptPolicy ? now() : null;
        $customer->accepted_marketing_at = $acceptPdpa ? now() : null;

        $customer->save();
        return redirect()->back()->with('success', 'อัปเดตการยินยอมเรียบร้อยแล้ว');
        // return response()->json([
        //     'success' => true,
        //     'message' => 'อัปเดตการยินยอมเรียบร้อยแล้ว',
        //     'data' => [
        //         'accept_policy' => $customer->accept_policy,
        //         'accept_pdpa' => $customer->accept_pdpa,
        //     ],
        // ]);
    }
}
