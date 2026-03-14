<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosOrderItem extends Model
{
    protected $table = 'pos_order_items';

    protected $fillable = [
        'order_id',
        'item_id',
        'name',
        'qty',
        'base_price',
        'modifiers',
        'total_amount'
    ];

    protected $casts = [
        'modifiers' => 'array'
    ];

    public function order()
    {
        return $this->belongsTo(PosOrder::class, 'order_id', 'order_id');
    }
}
