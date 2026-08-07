<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    public function index()
    {
        $staff = Personnel::orderBy('name', 'asc')->get()->map(function ($item) {
            return [
                'id' => $item->code,
                'code' => $item->code,
                'name' => $item->name,
                'role' => $item->role,
                'status' => $item->status ?? 'Available',
                'attendanceStatus' => $item->attendance_status ?? 'Absent',
                'activeOrder' => $item->active_order ?? '—',
            ];
        });

        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        $person = Personnel::updateOrCreate(
            ['code' => $data['code']],
            [
                'name' => $data['name'],
                'role' => $data['role'],
                'status' => $data['status'] ?? 'Available',
                'attendance_status' => $data['attendanceStatus'] ?? 'Absent',
                'active_order' => $data['activeOrder'] ?? '—',
            ]
        );

        return response()->json(['success' => true, 'person' => $person]);
    }
}
