<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkOrder;
use Illuminate\Http\Request;

class WorkOrderController extends Controller
{
    public function index()
    {
        $orders = WorkOrder::orderBy('created_at', 'desc')->get()->map(function ($item) {
            return [
                'code' => $item->code,
                'assetName' => $item->asset_name,
                'space' => $item->space ?? '',
                'scope' => $item->scope ?? '',
                'workgroup' => $item->workgroup ?? '',
                'status' => $item->status ?? 'Pending',
                'priority' => $item->priority ?? 'Medium',
                'worktype' => $item->worktype ?? '',
                'startDate' => $item->start_date ?? '',
                'endDate' => $item->end_date ?? '',
                'startTime' => $item->start_time ?? '',
                'endTime' => $item->end_time ?? '',
                'foreman' => $item->foreman ?? '',
                'assigned' => $item->assigned ?? [],
                'description' => $item->description ?? '',
                'workTitle' => $item->work_title ?? '',
                'dateReceived' => $item->date_received ?? '',
                'requesterName' => $item->requester_name ?? '',
                'requestingOffice' => $item->requesting_office ?? '',
                'roomNo' => $item->room_no ?? '',
                'isLocked' => (bool) ($item->is_locked ?? false),
                'tasks' => $item->tasks ?? [],
                'itemTypes' => $item->item_types ?? [],
            ];
        });

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        $order = WorkOrder::updateOrCreate(
            ['code' => $data['code']],
            [
                'asset_name' => $data['assetName'] ?? '',
                'space' => $data['space'] ?? '',
                'scope' => $data['scope'] ?? '',
                'workgroup' => $data['workgroup'] ?? '',
                'status' => $data['status'] ?? 'Pending',
                'priority' => $data['priority'] ?? 'Medium',
                'worktype' => $data['worktype'] ?? '',
                'start_date' => $data['startDate'] ?? null,
                'end_date' => $data['endDate'] ?? null,
                'start_time' => $data['startTime'] ?? null,
                'end_time' => $data['endTime'] ?? null,
                'foreman' => $data['foreman'] ?? '',
                'assigned' => $data['assigned'] ?? [],
                'description' => $data['description'] ?? '',
                'work_title' => $data['workTitle'] ?? null,
                'date_received' => $data['dateReceived'] ?? null,
                'requester_name' => $data['requesterName'] ?? null,
                'requesting_office' => $data['requestingOffice'] ?? null,
                'room_no' => $data['roomNo'] ?? null,
                'is_locked' => $data['isLocked'] ?? false,
                'tasks' => $data['tasks'] ?? [],
                'item_types' => $data['itemTypes'] ?? [],
            ]
        );

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function destroy($code)
    {
        WorkOrder::where('code', urldecode($code))->delete();
        return response()->json(['success' => true]);
    }
}
