<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pos_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->string('terminal_id');
            $table->string('cashier_id');
            $table->string('service_type');
            $table->string('table_number')->nullable();
            $table->string('external_source')->nullable();
            $table->string('external_reference_id')->nullable();
            $table->string('status');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_orders');
    }
};
