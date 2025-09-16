<?php

namespace App\Http\Controllers;

use App\Models\MasterWaaranty\TblCustomerProd;
use App\Models\MasterWaaranty\TblCustomerProdVat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();
        $customer = TblCustomerProd::where('cust_line', $user->line_id ?? null)
            ->orWhere('cust_tel', $user->phone ?? null)
            ->with('vatInfo') 
            ->first();

        return Inertia::render('Profile/Customer/Edit', [
            'customer' => $customer,
            'vat'      => $customer?->vatInfo, 
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $validatedCustomer = $request->validate([
            'cust_firstname'   => 'required|string|max:255',
            'cust_lastname'    => 'required|string|max:255',
            'cust_gender'      => 'nullable|string|in:ชาย,หญิง',
            'cust_tel'         => 'required|string|max:20',
            'cust_birthdate'   => 'nullable|date',
            'cust_full_address' => 'nullable|string|max:500',
            'cust_province'    => 'nullable|string|max:255',
            'cust_district'    => 'nullable|string|max:255',
            'cust_subdistrict' => 'nullable|string|max:255',
            'cust_zipcode'     => 'nullable|string|max:10',
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

        $customer = TblCustomerProd::where('cust_line', $user->line_id ?? null)
            ->orWhere('cust_tel', $user->phone ?? null)
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

        $vat->vat_cust_name    = $validatedVat['tax_name'];
        $vat->vat_tel_c        = $validatedVat['tax_tel'];
        $vat->vat_cust_address = $validatedVat['tax_address'];
        $vat->vat_cust_province = $validatedVat['tax_province'];
        $vat->vat_cust_district = $validatedVat['tax_district'];
        $vat->vat_cust_subdistrict = $validatedVat['tax_subdistrict'];
        $vat->vat_cust_zipcode = $validatedVat['tax_zipcode'];
        $vat->save();

        return redirect()->route('customer.profile.edit')
            ->with('success', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    }
}