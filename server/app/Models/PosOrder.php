<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosOrder extends Model
{
    protected $table = 'pos_orders';

    protected $fillable = [
        'order_id',
        'terminal_id',
        'cashier_id',
        'service_type',
        'table_number',
        'external_source',
        'external_reference_id',
        'status',
        'subtotal',
        'total'
    ];

    public function items()
    {
        return $this->hasMany(PosOrderItem::class, 'order_id', 'order_id');
    }
}
