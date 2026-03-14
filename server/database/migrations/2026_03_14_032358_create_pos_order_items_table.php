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
        Schema::create('pos_order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id'); // Link to pos_orders.order_id
            $table->string('item_id');
            $table->string('name');
            $table->integer('qty');
            $table->decimal('base_price', 15, 2);
            $table->json('modifiers')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->timestamps();

            $table->index('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_order_items');
    }
};
