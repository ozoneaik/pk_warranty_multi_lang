<?php

namespace App\Models\MasterWaaranty;

use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    protected $connection = 'mysql_slip';
    protected $table = 'channels';

    protected $fillable = ['name', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function dealers()
    {
        return $this->hasMany(Dealer::class, 'channel_id');
    }
}
