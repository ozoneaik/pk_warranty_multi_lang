<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class TblCustomerProd extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'tbl_customer_prod';
    protected $fillable = [
        // 'cust_firstname',
        // 'cust_lastname',
        // 'cust_gender',
        // 'cust_email',
        // 'cust_line',
        // 'cust_tel',
        // 'cust_birthdate',


        // 'cust_full_address',
        // 'cust_address',
        // 'cust_subdistrict',
        // 'cust_district',
        // 'cust_province',
        // 'cust_zipcode',
        // 'accept_news',
        // 'accept_policy',
        // 'accept_pdpa',
        // 'accept_analyze_prod',
        // 'accept_marketing',
        // 'unlockkey',
        // 'datetime',
        // 'status',
        // 'insurance_expire'
        
        // พื้นฐานลูกค้า
        'cust_tel',
        'cust_prefix',
        'cust_firstname',
        'cust_lastname',
        'cust_gender',
        'cust_email',
        'cust_line',
        'cust_birthdate',

        // ที่อยู่
        'cust_full_address',
        'cust_address',
        'cust_subdistrict',
        'cust_district',
        'cust_province',
        'cust_zipcode',

        // อื่น ๆ
        'cust_mechanic',
        'cust_business',
        'cust_code',
        'cust_uid',

        // การยินยอม/การตลาด
        'accept_news',
        'accept_policy',
        'accept_pdpa',
        'accept_analyze_prod',
        'accept_marketing',
        'accepted_pdpa_at',
        'accepted_analyze_prod_at',
        'accepted_marketing_at',

        // ระบบ
        'unlockkey',
        'cre_key',
        'datetime',
        'status',
        'cust_type',
        
        'point_rocket',
        'point',
    ];
    public $timestamps = false;
}
