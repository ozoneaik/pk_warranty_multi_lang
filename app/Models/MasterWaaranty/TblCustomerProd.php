<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class TblCustomerProd extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'tbl_customer_prod';
    protected $fillable = [
        'cust_firstname',
        'cust_lastname',
        'cust_gender',
        'cust_line',
        'cust_tel',
        'cust_birthdate',


        'cust_full_address',
        'cust_address',
        'cust_subdistrict',
        'cust_district',
        'cust_province',
        'cust_zipcode',
        'accept_news',
        'accept_policy',
        'accept_pdpa',
        'accept_analyze_prod',
        'accept_marketing',
        'unlockkey',
        'datetime',
        'status',
        'insurance_expire'
    ];
    public $timestamps = false;
}
