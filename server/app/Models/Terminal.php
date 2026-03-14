<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Terminal extends Model
{
    protected $fillable = [
        'terminal_id',
        'serial_number',
        'accreditation_number',
        'accreditation_date',
        'ptu_number',
        'ptu_date'
    ];
}
