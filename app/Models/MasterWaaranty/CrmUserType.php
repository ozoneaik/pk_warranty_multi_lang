<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class CrmUserType extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'crm_user_types';
    protected $primaryKey = 'id';

    protected $fillable = [
        'type_code',
        'type_name',
        'type_name_en',
        'description',
        'sort_order',
        'is_active',
        'created_by',
        'updated_by',
    ];
}
