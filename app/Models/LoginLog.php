<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    //
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'line_id',
        'ip_address',
        'user_agent',
        'provider',
        'status',
        'failure_reason',
        'metadata',
        'login_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'login_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id', 'id');
    }
}
