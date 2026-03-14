<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PosOrder;
use App\Models\PosOrderItem;
use App\Models\PosAuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncController extends Controller
{
    /**
     * Ingest transactions from the POS client.
     * Expects an array of orders.
     */
    public function ingest(Request $request)
    {
        $payload = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|string',
            'orders.*.status' => 'required|string',
            'orders.*.total' => 'nullable|numeric',
        ]);

        $results = [
            'synced' => [],
            'errors' => []
        ];

        foreach ($payload['orders'] as $orderData) {
            try {
                DB::transaction(function () use ($orderData, &$results) {
                    $order = PosOrder::updateOrCreate(
                        ['order_id' => $orderData['id']],
                        [
                            'terminal_id' => $orderData['terminalId'] ?? 'UNKNOWN',
                            'cashier_id' => $orderData['cashierId'] ?? 'SYSTEM',
                            'service_type' => $orderData['serviceType'] ?? 'TAKEOUT',
                            'table_number' => $orderData['tableNumber'] ?? null,
                            'external_source' => $orderData['externalSource'] ?? null,
                            'external_reference_id' => $orderData['externalReferenceId'] ?? null,
                            'status' => $orderData['status'],
                            'subtotal' => $orderData['subtotal'] ?? 0,
                            'total' => $orderData['total'] ?? $orderData['subtotal'] ?? 0,
                        ]
                    );

                    // Sync items if provided
                    if (isset($orderData['items']) && is_array($orderData['items'])) {
                        // For simplicity in this phase, we replace items. 
                        // In production, we'd handle line-item-id mapping.
                        $order->items()->delete();
                        foreach ($orderData['items'] as $itemData) {
                            $order->items()->create([
                                'item_id' => $itemData['itemId'],
                                'name' => $itemData['name'],
                                'qty' => $itemData['qty'],
                                'base_price' => $itemData['basePrice'],
                                'modifiers' => $itemData['modifiers'] ?? [],
                                'total_amount' => $itemData['totalAmount'],
                            ]);
                        }
                    }

                    $results['synced'][] = $orderData['id'];
                });
            } catch (\Exception $e) {
                Log::error("Sync failed for order {$orderData['id']}: " . $e->getMessage());
                $results['errors'][] = [
                    'id' => $orderData['id'],
                    'message' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => true,
            'results' => $results
        ], count($results['errors']) > 0 ? 207 : 200);
    }
}
