<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class TblCustomerProdVat extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'tbl_customer_prod_vat';

    protected $fillable = [
        'cust_line',
        'vat_tel_c',
        'vat_cust_name',
        'vat_cust_address',
        'vat_cust_province',
        'vat_cust_district',
        'vat_cust_subdistrict',
        'vat_cust_zipcode',
    ];
    public $timestamps = false;
}
