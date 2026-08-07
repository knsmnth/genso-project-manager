<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyWorkLog;
use Illuminate\Http\Request;

class DailyWorkLogController extends Controller
{
    public function index()
    {
        $logs = DailyWorkLog::orderBy('created_at', 'desc')->get();
        return response()->json($logs);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        $log = DailyWorkLog::create([
            'group_title' => $data['groupTitle'],
            'group_subtitle' => $data['groupSubtitle'] ?? null,
            'work_order_number' => $data['workOrderNumber'],
            'category' => $data['category'] ?? null,
            'work_type' => $data['workType'] ?? null,
            'description' => $data['description'] ?? null,
            'start_date' => $data['startDate'] ?? null,
            'completion_date' => $data['completionDate'] ?? null,
            'assigned_lead' => $data['assignedLead'] ?? null,
            'personnel_count' => $data['personnelCount'] ?? 0,
            'assigned_personnel' => $data['assignedPersonnel'] ?? [],
            'inspections_count' => $data['inspectionsCount'] ?? 0,
            'has_comments' => $data['hasComments'] ?? false,
            'is_on_hold' => $data['isOnHold'] ?? false,
            'remarks_list' => $data['remarksList'] ?? [],
            'equipment_list' => $data['equipmentList'] ?? [],
        ]);

        return response()->json(['success' => true, 'log' => $log]);
    }
}
