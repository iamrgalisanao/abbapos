<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosAuditLog extends Model
{
    protected $table = 'pos_audit_logs';

    protected $fillable = [
        'action_timestamp',
        'user_id',
        'terminal_id',
        'action',
        'details',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'action_timestamp' => 'datetime'
    ];
}
