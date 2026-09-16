<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyWorkLogSnapshot;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DailyWorkLogSnapshotController extends Controller
{
    /**
     * Get list of all available snapshot dates with summaries.
     */
    public function index()
    {
        $snapshots = DailyWorkLogSnapshot::select([
            'id',
            'snapshot_date',
            'total_orders',
            'total_tasks',
            'total_personnel',
            'total_equipment',
            'total_inspections',
            'saved_by',
            'is_auto_saved',
            'created_at',
            'updated_at'
        ])
        ->orderBy('snapshot_date', 'desc')
        ->get();

        return response()->json($snapshots);
    }

    /**
     * Retrieve full snapshot entries for a specific date (YYYY-MM-DD).
     */
    public function show($date)
    {
        try {
            $parsedDate = Carbon::parse($date)->toDateString();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format'], 422);
        }

        $snapshot = DailyWorkLogSnapshot::where('snapshot_date', $parsedDate)->first();

        if (!$snapshot) {
            return response()->json([
                'message' => 'No snapshot recorded for this date.',
                'snapshot_date' => $parsedDate,
                'entries' => []
            ], 404);
        }

        return response()->json($snapshot);
    }

    /**
     * Store or update a snapshot for a date (typically today).
     */
    public function store(Request $request)
    {
        $request->validate([
            'entries' => 'required|array',
            'snapshot_date' => 'nullable|date'
        ]);

        $date = $request->input('snapshot_date')
            ? Carbon::parse($request->input('snapshot_date'))->toDateString()
            : Carbon::today()->toDateString();

        $rawEntries = $request->input('entries', []);
        $entries = array_values(array_filter($rawEntries, function ($item) {
            return empty($item['isOnHold']);
        }));
        $contentHash = md5(json_encode($entries));

        // Calculate metrics
        $metrics = $this->calculateMetrics($entries);

        $existing = DailyWorkLogSnapshot::where('snapshot_date', $date)->first();

        if ($existing) {
            // Check if there are no changes
            if ($existing->content_hash === $contentHash) {
                return response()->json([
                    'success' => true,
                    'unchanged' => true,
                    'message' => 'Already saved. No new changes detected for ' . $date,
                    'snapshot' => $existing
                ]);
            }

            // Update existing record
            $existing->update([
                'entries' => $entries,
                'total_orders' => $metrics['total_orders'],
                'total_tasks' => $metrics['total_tasks'],
                'total_personnel' => $metrics['total_personnel'],
                'total_equipment' => $metrics['total_equipment'],
                'total_inspections' => $metrics['total_inspections'],
                'saved_by' => $request->input('saved_by', $existing->saved_by ?? 'Lead Foreman'),
                'is_auto_saved' => $request->boolean('is_auto_saved', false),
                'content_hash' => $contentHash
            ]);

            return response()->json([
                'success' => true,
                'unchanged' => false,
                'message' => 'Work log snapshot updated successfully for ' . $date,
                'snapshot' => $existing
            ]);
        }

        // Create new record
        $snapshot = DailyWorkLogSnapshot::create([
            'snapshot_date' => $date,
            'entries' => $entries,
            'total_orders' => $metrics['total_orders'],
            'total_tasks' => $metrics['total_tasks'],
            'total_personnel' => $metrics['total_personnel'],
            'total_equipment' => $metrics['total_equipment'],
            'total_inspections' => $metrics['total_inspections'],
            'saved_by' => $request->input('saved_by', 'Lead Foreman'),
            'is_auto_saved' => $request->boolean('is_auto_saved', false),
            'content_hash' => $contentHash
        ]);

        return response()->json([
            'success' => true,
            'unchanged' => false,
            'message' => 'Work log snapshot saved successfully for ' . $date,
            'snapshot' => $snapshot
        ], 201);
    }

    /**
     * Update historical snapshot for a past or specific date.
     */
    public function update(Request $request, $date)
    {
        try {
            $parsedDate = Carbon::parse($date)->toDateString();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format'], 422);
        }

        $request->validate([
            'entries' => 'required|array'
        ]);

        $rawEntries = $request->input('entries', []);
        $entries = array_values(array_filter($rawEntries, function ($item) {
            return empty($item['isOnHold']);
        }));
        $contentHash = md5(json_encode($entries));
        $metrics = $this->calculateMetrics($entries);

        $snapshot = DailyWorkLogSnapshot::where('snapshot_date', $parsedDate)->first();

        if (!$snapshot) {
            // Create retroactive snapshot if none existed
            $snapshot = DailyWorkLogSnapshot::create([
                'snapshot_date' => $parsedDate,
                'entries' => $entries,
                'total_orders' => $metrics['total_orders'],
                'total_tasks' => $metrics['total_tasks'],
                'total_personnel' => $metrics['total_personnel'],
                'total_equipment' => $metrics['total_equipment'],
                'total_inspections' => $metrics['total_inspections'],
                'saved_by' => $request->input('saved_by', 'Lead Foreman'),
                'is_auto_saved' => false,
                'content_hash' => $contentHash
            ]);

            return response()->json([
                'success' => true,
                'unchanged' => false,
                'message' => 'Past work log created for ' . $parsedDate,
                'snapshot' => $snapshot
            ]);
        }

        if ($snapshot->content_hash === $contentHash) {
            return response()->json([
                'success' => true,
                'unchanged' => true,
                'message' => 'Already saved. No changes detected for ' . $parsedDate,
                'snapshot' => $snapshot
            ]);
        }

        $snapshot->update([
            'entries' => $entries,
            'total_orders' => $metrics['total_orders'],
            'total_tasks' => $metrics['total_tasks'],
            'total_personnel' => $metrics['total_personnel'],
            'total_equipment' => $metrics['total_equipment'],
            'total_inspections' => $metrics['total_inspections'],
            'saved_by' => $request->input('saved_by', $snapshot->saved_by),
            'content_hash' => $contentHash
        ]);

        return response()->json([
            'success' => true,
            'unchanged' => false,
            'message' => 'Past work log updated for ' . $parsedDate,
            'snapshot' => $snapshot
        ]);
    }

    /**
     * Helper to compute metrics from entries array.
     */
    private function calculateMetrics(array $entries): array
    {
        $uniqueOrders = [];
        $uniquePersonnel = [];
        $totalEquipment = 0;
        $totalInspections = 0;

        foreach ($entries as $item) {
            if (!empty($item['workOrderNumber'])) {
                $uniqueOrders[$item['workOrderNumber']] = true;
            }

            if (!empty($item['assignedPersonnel']) && is_array($item['assignedPersonnel'])) {
                foreach ($item['assignedPersonnel'] as $p) {
                    if (is_string($p) && trim($p) !== '') {
                        $uniquePersonnel[trim($p)] = true;
                    }
                }
            }

            if (!empty($item['equipmentList']) && is_array($item['equipmentList'])) {
                $totalEquipment += count($item['equipmentList']);
            }

            if (!empty($item['inspectionList']) && is_array($item['inspectionList'])) {
                $totalInspections += count($item['inspectionList']);
            }
        }

        return [
            'total_orders' => count($uniqueOrders),
            'total_tasks' => count($entries),
            'total_personnel' => count($uniquePersonnel),
            'total_equipment' => $totalEquipment,
            'total_inspections' => $totalInspections
        ];
    }
}
