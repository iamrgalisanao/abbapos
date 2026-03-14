<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $fillable = [
        'store_name',
        'tin',
        'branch_code',
        'address',
        'vat_reg',
        'owner'
    ];
}
