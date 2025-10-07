<?php

namespace App\Http\Controllers;

use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TblCustomerProdVat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomerProfileController extends Controller
{
    // public function edit()
    // {
    //     $user = Auth::user();

    //     $customer = TblCustomerProd::query()
    //         ->leftJoin('tbl_customer_prod_vat as vat', 'tbl_customer_prod.cust_line', '=', 'vat.cust_line')
    //         ->where('tbl_customer_prod.cust_line', $user->line_id ?? null)
    //         ->orWhere('tbl_customer_prod.cust_tel', $user->phone ?? null)
    //         ->select(
    //             'tbl_customer_prod.*',
    //             'vat.vat_cust_name as tax_name',
    //             'vat.vat_tel_c as tax_tel',
    //             'vat.vat_cust_address as tax_address',
    //             'vat.vat_cust_province as tax_province',
    //             'vat.vat_cust_district as tax_district',
    //             'vat.vat_cust_subdistrict as tax_subdistrict',
    //             'vat.vat_cust_zipcode as tax_zipcode'
    //         )
    //         ->first();

    //     if ($customer) {
    //         $mapDisplay = [
    //             'male'   => 'ชาย',
    //             'female' => 'หญิง',
    //             'other'  => 'อื่น ๆ',
    //         ];
    //         $customer->cust_gender = $mapDisplay[$customer->cust_gender] ?? null;

    //         $customer->cust_full_address = $customer->cust_address ?? '';
    //         $customer->tax_name = $customer->tax_name ?? '';
    //         $customer->tax_tel = $customer->tax_tel ?? '';
    //         $customer->tax_address = $customer->tax_address ?? '';
    //         $customer->tax_province = $customer->tax_province ?? '';
    //         $customer->tax_district = $customer->tax_district ?? '';
    //         $customer->tax_subdistrict = $customer->tax_subdistrict ?? '';
    //         $customer->tax_zipcode = $customer->tax_zipcode ?? '';
    //     }

    //     return Inertia::render('Profile/Customer/Edit', [
    //         'customer' => $customer,
    //     ]);
    // }

    // public function update(Request $request)
    // {
    //     $user = Auth::user();
    //     $validatedCustomer = $request->validate([
    //         'cust_firstname'   => 'required|string|max:255',
    //         'cust_lastname'    => 'required|string|max:255',
    //         'cust_gender'      => 'nullable|string|in:ชาย,หญิง,อื่น ๆ',
    //         'cust_email'       => 'nullable|string|max:100',
    //         'cust_tel'         => 'required|string|max:20',
    //         'cust_birthdate'   => 'nullable|date',
    //         'cust_full_address' => 'nullable|string|max:500',
    //         'cust_province'    => 'nullable|string|max:255',
    //         'cust_district'    => 'nullable|string|max:255',
    //         'cust_subdistrict' => 'nullable|string|max:255',
    //         'cust_zipcode'     => 'nullable|string|max:10',
    //     ]);

    //     $mapDB = [
    //         'ชาย'   => 'male',
    //         'หญิง'  => 'female',
    //         'อื่น ๆ' => 'other',
    //     ];
    //     if (!empty($validatedCustomer['cust_gender'])) {
    //         $validatedCustomer['cust_gender'] = $mapDB[$validatedCustomer['cust_gender']] ?? null;
    //     }

    //     $validatedCustomer['cust_address'] = $validatedCustomer['cust_full_address'] ?? '';
    //     $validatedCustomer['unlockkey'] = $validatedCustomer['unlockkey'] ?? '';

    //     $validatedVat = $request->validate([
    //         'tax_name'        => 'required|string|max:255',
    //         'tax_tel'         => 'required|string|max:20',
    //         'tax_address'     => 'required|string|max:500',
    //         'tax_province'    => 'required|string|max:255',
    //         'tax_district'    => 'required|string|max:255',
    //         'tax_subdistrict' => 'required|string|max:255',
    //         'tax_zipcode'     => 'required|string|max:10',
    //     ]);

    //     $customer = TblCustomerProd::where('cust_line', $user->line_id ?? null)
    //         ->orWhere('cust_tel', $user->phone ?? null)
    //         ->first();

    //     if (!$customer) {
    //         $customer = new TblCustomerProd();
    //         $customer->cust_line = $user->line_id ?? null;
    //         $customer->cust_tel  = $user->phone ?? $validatedCustomer['cust_tel'];
    //     }

    //     $customer->fill($validatedCustomer);
    //     $customer->save();

    //     $vat = TblCustomerProdVat::where('cust_line', $customer->cust_line)->first();

    //     if (!$vat) {
    //         $vat = new TblCustomerProdVat();
    //         $vat->cust_line = $customer->cust_line;
    //     }

    //     $vat->vat_cust_name    = $validatedVat['tax_name'];
    //     $vat->vat_tel_c        = $validatedVat['tax_tel'];
    //     $vat->vat_cust_address = $validatedVat['tax_address'];
    //     $vat->vat_cust_province = $validatedVat['tax_province'];
    //     $vat->vat_cust_district = $validatedVat['tax_district'];
    //     $vat->vat_cust_subdistrict = $validatedVat['tax_subdistrict'];
    //     $vat->vat_cust_zipcode = $validatedVat['tax_zipcode'];
    //     $vat->save();

    //     return redirect()->route('customer.profile.edit')
    //         ->with('success', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    // }
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
            'line_id' => $user->line_id,
            'phone'   => $user->phone,
            'found_customer' => $customer?->cust_name ?? 'N/A',
        ]);

        if ($customer) {
            $mapDisplay = [
                'male'   => 'ชาย',
                'female' => 'หญิง',
                'other'  => 'อื่น ๆ',
            ];
            $customer->cust_gender = $mapDisplay[$customer->cust_gender] ?? null;

            $customer->cust_full_address = $customer->cust_address ?? '';
            $customer->tax_name = $customer->tax_name ?? '';
            $customer->tax_tel = $customer->tax_tel ?? '';
            $customer->tax_address = $customer->tax_address ?? '';
            $customer->tax_province = $customer->tax_province ?? '';
            $customer->tax_district = $customer->tax_district ?? '';
            $customer->tax_subdistrict = $customer->tax_subdistrict ?? '';
            $customer->tax_zipcode = $customer->tax_zipcode ?? '';
        }

        return Inertia::render('Profile/Customer/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validatedCustomer = $request->validate([
            'cust_firstname'   => 'required|string|max:255',
            'cust_lastname'    => 'required|string|max:255',
            'cust_gender'      => 'nullable|string|in:ชาย,หญิง,อื่น ๆ',
            'cust_email'       => 'nullable|string|max:100',
            'cust_tel'         => 'required|string|max:20',
            'cust_birthdate'   => 'nullable|date',
            'cust_full_address' => 'nullable|string|max:500',
            'cust_province'    => 'nullable|string|max:255',
            'cust_district'    => 'nullable|string|max:255',
            'cust_subdistrict' => 'nullable|string|max:255',
            'cust_zipcode'     => 'nullable|string|max:10',
        ]);

        $mapDB = [
            'ชาย'   => 'male',
            'หญิง'  => 'female',
            'อื่น ๆ' => 'other',
        ];
        if (!empty($validatedCustomer['cust_gender'])) {
            $validatedCustomer['cust_gender'] = $mapDB[$validatedCustomer['cust_gender']] ?? null;
        }

        $validatedCustomer['cust_address'] = $validatedCustomer['cust_full_address'] ?? '';
        $validatedCustomer['unlockkey'] = $validatedCustomer['unlockkey'] ?? '';

        $validatedVat = $request->validate([
            'tax_name'        => 'required|string|max:255',
            'tax_tel'         => 'required|string|max:20',
            'tax_address'     => 'required|string|max:500',
            'tax_province'    => 'required|string|max:255',
            'tax_district'    => 'required|string|max:255',
            'tax_subdistrict' => 'required|string|max:255',
            'tax_zipcode'     => 'required|string|max:10',
        ]);

        $customer = TblCustomerProd::where(function ($q) use ($user) {
            if (!empty($user->line_id)) {
                $q->where('cust_line', $user->line_id);
            }
            if (!empty($user->phone)) {
                $q->orWhere('cust_tel', $user->phone);
            }
        })
            ->first();

        if (!$customer) {
            $customer = new TblCustomerProd();
            $customer->cust_line = $user->line_id ?? null;
            $customer->cust_tel  = $user->phone ?? $validatedCustomer['cust_tel'];
        }

        $customer->fill($validatedCustomer);
        $customer->save();

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

        Log::info('CustomerProfileController@update - Updated customer', [
            'line_id' => $user->line_id,
            'phone' => $user->phone,
            'customer_id' => $customer->id,
            'vat_id' => $vat->id,
        ]);

        return redirect()->route('customer.profile.edit')
            ->with('success', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    }
}