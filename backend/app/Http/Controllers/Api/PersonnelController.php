<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use App\Models\PersonnelAttendance;
use App\Models\PersonnelLeave;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    /**
     * List all personnel, optionally resolving today's attendance & active leaves.
     */
    public function index(Request $request)
    {
        $today = Carbon::today()->format('Y-m-d');

        // Fetch all personnel
        $staff = Personnel::orderBy('name', 'asc')->get();

        // Fetch active leaves for today
        $activeLeaves = PersonnelLeave::where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->get()
            ->keyBy('personnel_code');

        // Fetch today's recorded attendance entries if any
        $todayAttendance = PersonnelAttendance::where('date', $today)
            ->get()
            ->keyBy('personnel_code');

        $result = $staff->map(function ($item) use ($activeLeaves, $todayAttendance) {
            $code = $item->code;

            // Determine attendance status:
            // 1. If explicit attendance recorded today, use it
            // 2. Otherwise if on scheduled leave today, status is 'on_leave'
            // 3. Otherwise fallback to stored status or default 'present'
            $attStatus = 'present';
            if (isset($todayAttendance[$code])) {
                $attStatus = $todayAttendance[$code]->status;
            } elseif (isset($activeLeaves[$code])) {
                $attStatus = 'on_leave';
            } elseif (!empty($item->attendance_status)) {
                $clean = strtolower($item->attendance_status);
                if (str_contains($clean, 'leave')) {
                    $attStatus = 'on_leave';
                } elseif (str_contains($clean, 'absent')) {
                    $attStatus = 'absent';
                } else {
                    $attStatus = 'present';
                }
            }

            return [
                'id' => $item->code,
                'code' => $item->code,
                'name' => $item->name,
                'role' => $item->role,
                'status' => $item->status ?? 'Available',
                'attendanceStatus' => $attStatus,
                'activeOrder' => $item->active_order ?? '—',
                'email' => $item->email ?? '',
                'phone' => $item->phone ?? '',
                'department' => $item->department ?? 'General Services',
                'team' => $item->team ?? '',
                'dateHired' => $item->date_hired ?? '',
                'emergencyContact' => $item->emergency_contact ?? '',
                'notes' => $item->notes ?? '',
                'isOnLeaveToday' => isset($activeLeaves[$code]),
                'leaveDetails' => isset($activeLeaves[$code]) ? $activeLeaves[$code] : null,
            ];
        });

        return response()->json($result);
    }

    /**
     * Upsert a single personnel profile.
     */
    public function store(Request $request)
    {
        $data = $request->all();

        $person = Personnel::updateOrCreate(
            ['code' => $data['code']],
            [
                'name' => $data['name'],
                'role' => $data['role'],
                'status' => $data['status'] ?? 'Available',
                'attendance_status' => $data['attendanceStatus'] ?? 'present',
                'active_order' => $data['activeOrder'] ?? '—',
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'department' => $data['department'] ?? 'General Services',
                'team' => $data['team'] ?? null,
                'date_hired' => $data['dateHired'] ?? null,
                'emergency_contact' => $data['emergencyContact'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]
        );

        return response()->json(['success' => true, 'person' => $person]);
    }

    /**
     * Get full dossier for "View Records": Profile, personal Attendance Log, and Work Order History.
     */
    public function showRecords($code)
    {
        $person = Personnel::where('code', $code)->first();
        if (!$person) {
            return response()->json(['error' => 'Personnel not found'], 404);
        }

        // Attendance records for this person (ordered by date desc)
        $attendance = PersonnelAttendance::where('personnel_code', $code)
            ->orderBy('date', 'desc')
            ->limit(90)
            ->get()
            ->map(function ($rec) {
                $cDate = Carbon::parse($rec->date);
                return [
                    'id' => $rec->id,
                    'date' => $rec->date,
                    'formattedDate' => $cDate->format('M d, Y'),
                    'dayOfWeek' => $cDate->format('l'),
                    'status' => $rec->status,
                    'notes' => $rec->notes ?? '',
                ];
            });

        // Work orders where this person is assigned or foreman
        $workOrders = WorkOrder::all()->filter(function ($wo) use ($person, $code) {
            $isForeman = strcasecmp($wo->foreman ?? '', $person->name) === 0 || strcasecmp($wo->foreman ?? '', $code) === 0;
            $assigned = is_array($wo->assigned) ? $wo->assigned : (json_decode($wo->assigned ?? '[]', true) ?: []);
            $isAssigned = in_array($person->name, $assigned) || in_array($code, $assigned);
            return $isForeman || $isAssigned;
        })->values()->map(function ($wo) {
            return [
                'code' => $wo->code,
                'workTitle' => $wo->work_title ?: $wo->asset_name,
                'assetName' => $wo->asset_name,
                'status' => $wo->status,
                'priority' => $wo->priority,
                'startDate' => $wo->start_date ?? '—',
                'endDate' => $wo->end_date ?? '—',
                'foreman' => $wo->foreman ?? '—',
            ];
        });

        // Scheduled leaves for this person
        $leaves = PersonnelLeave::where('personnel_code', $code)
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json([
            'profile' => [
                'code' => $person->code,
                'name' => $person->name,
                'role' => $person->role,
                'status' => $person->status,
                'attendanceStatus' => $person->attendance_status,
                'activeOrder' => $person->active_order,
                'email' => $person->email ?? '',
                'phone' => $person->phone ?? '',
                'department' => $person->department ?? 'General Services',
                'team' => $person->team ?? '',
                'dateHired' => $person->date_hired ?? '',
                'emergencyContact' => $person->emergency_contact ?? '',
                'notes' => $person->notes ?? '',
            ],
            'attendanceHistory' => $attendance,
            'workOrders' => $workOrders,
            'leaves' => $leaves,
        ]);
    }

    /**
     * Batch or single save attendance check for a specific date.
     */
    public function saveAttendance(Request $request)
    {
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $records = $request->input('records', []); // array of ['personnel_code' => '...', 'status' => '...']

        foreach ($records as $entry) {
            $code = $entry['personnel_code'] ?? null;
            $status = $entry['status'] ?? 'present';
            $notes = $entry['notes'] ?? null;

            if ($code) {
                PersonnelAttendance::updateOrCreate(
                    ['personnel_code' => $code, 'date' => $date],
                    ['status' => $status, 'notes' => $notes]
                );

                // If date is today, update the personnel's current attendance_status
                if ($date === Carbon::today()->format('Y-m-d')) {
                    Personnel::where('code', $code)->update(['attendance_status' => $status]);
                }
            }
        }

        return response()->json(['success' => true, 'date' => $date, 'count' => count($records)]);
    }

    /**
     * General attendance history: provides date-by-date rosters with full lists of people.
     */
    public function attendanceHistory(Request $request)
    {
        $queryDate = $request->input('date');

        // All personnel lookup map
        $allPersonnel = Personnel::all()->keyBy('code');

        if ($queryDate) {
            $attendanceDates = [$queryDate];
        } else {
            // Get unique dates from attendance or last 7 days
            $datesFromDb = PersonnelAttendance::select('date')
                ->distinct()
                ->orderBy('date', 'desc')
                ->limit(14)
                ->pluck('date')
                ->toArray();

            $today = Carbon::today()->format('Y-m-d');
            if (!in_array($today, $datesFromDb)) {
                array_unshift($datesFromDb, $today);
            }
            $attendanceDates = $datesFromDb;
        }

        $historyList = [];

        foreach ($attendanceDates as $d) {
            $carbonDate = Carbon::parse($d);
            $records = PersonnelAttendance::where('date', $d)->get()->keyBy('personnel_code');
            
            // Check leaves for this date
            $leavesForDate = PersonnelLeave::where('start_date', '<=', $d)
                ->where('end_date', '>=', $d)
                ->get()
                ->keyBy('personnel_code');

            $roster = [
                'present' => [],
                'absent' => [],
                'half_am' => [],
                'half_pm' => [],
                'on_leave' => [],
            ];

            foreach ($allPersonnel as $code => $p) {
                $status = 'present'; // Default
                $notes = '';

                if (isset($records[$code])) {
                    $status = $records[$code]->status;
                    $notes = $records[$code]->notes ?? '';
                } elseif (isset($leavesForDate[$code])) {
                    $status = 'on_leave';
                    $notes = $leavesForDate[$code]->leave_type;
                }

                $personData = [
                    'code' => $p->code,
                    'name' => $p->name,
                    'role' => $p->role,
                    'status' => $status,
                    'notes' => $notes,
                    'activeOrder' => $p->active_order ?? '—',
                ];

                if (isset($roster[$status])) {
                    $roster[$status][] = $personData;
                } else {
                    $roster['present'][] = $personData;
                }
            }

            $totalStaff = $allPersonnel->count();
            $presentCount = count($roster['present']);
            $absentCount = count($roster['absent']);
            $halfCount = count($roster['half_am']) + count($roster['half_pm']);
            $leaveCount = count($roster['on_leave']);

            $effectivePresent = $presentCount + ($halfCount * 0.5);
            $compliance = $totalStaff > 0 ? round(($effectivePresent / $totalStaff) * 100) : 100;

            $historyList[] = [
                'date' => $d,
                'formattedDate' => $carbonDate->format('M d, Y'),
                'dayOfWeek' => $carbonDate->format('l'),
                'compliance' => $compliance,
                'totalStaff' => $totalStaff,
                'counts' => [
                    'present' => $presentCount,
                    'absent' => $absentCount,
                    'half_am' => count($roster['half_am']),
                    'half_pm' => count($roster['half_pm']),
                    'on_leave' => $leaveCount,
                ],
                'roster' => $roster,
            ];
        }

        return response()->json($historyList);
    }

    /**
     * List all scheduled leaves.
     */
    public function getLeaves()
    {
        $leaves = PersonnelLeave::orderBy('start_date', 'desc')->get()->map(function ($l) {
            $person = Personnel::where('code', $l->personnel_code)->first();
            return [
                'id' => $l->id,
                'personnelCode' => $l->personnel_code,
                'personnelName' => $person ? $person->name : $l->personnel_code,
                'role' => $person ? $person->role : '',
                'leaveType' => $l->leave_type,
                'startDate' => $l->start_date,
                'endDate' => $l->end_date,
                'reason' => $l->reason ?? '',
                'status' => $l->status ?? 'Approved',
                'createdAt' => $l->created_at ? $l->created_at->format('M d, Y') : '',
            ];
        });

        return response()->json($leaves);
    }

    /**
     * Store/schedule a leave.
     */
    public function storeLeave(Request $request)
    {
        $data = $request->validate([
            'personnelCode' => 'required|string',
            'leaveType' => 'required|string',
            'startDate' => 'required|string',
            'endDate' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $leave = PersonnelLeave::create([
            'personnel_code' => $data['personnelCode'],
            'leave_type' => $data['leaveType'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'],
            'reason' => $data['reason'] ?? '',
            'status' => 'Approved',
        ]);

        // If today is within this leave window, set today's attendance as on_leave
        $today = Carbon::today()->format('Y-m-d');
        if ($data['startDate'] <= $today && $data['endDate'] >= $today) {
            PersonnelAttendance::updateOrCreate(
                ['personnel_code' => $data['personnelCode'], 'date' => $today],
                ['status' => 'on_leave', 'notes' => $data['leaveType']]
            );
            Personnel::where('code', $data['personnelCode'])->update(['attendance_status' => 'on_leave']);
        }

        return response()->json(['success' => true, 'leave' => $leave]);
    }

    /**
     * Update an existing scheduled leave.
     */
    public function updateLeave(Request $request, $id)
    {
        $data = $request->validate([
            'personnelCode' => 'required|string',
            'leaveType' => 'required|string',
            'startDate' => 'required|string',
            'endDate' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $leave = PersonnelLeave::findOrFail($id);
        $leave->update([
            'personnel_code' => $data['personnelCode'],
            'leave_type' => $data['leaveType'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'],
            'reason' => $data['reason'] ?? '',
        ]);

        $today = Carbon::today()->format('Y-m-d');
        if ($data['startDate'] <= $today && $data['endDate'] >= $today) {
            PersonnelAttendance::updateOrCreate(
                ['personnel_code' => $data['personnelCode'], 'date' => $today],
                ['status' => 'on_leave', 'notes' => $data['leaveType']]
            );
            Personnel::where('code', $data['personnelCode'])->update(['attendance_status' => 'on_leave']);
        } else {
            // Check if there are other leaves for today
            $hasOther = PersonnelLeave::where('personnel_code', $data['personnelCode'])
                ->where('start_date', '<=', $today)
                ->where('end_date', '>=', $today)
                ->exists();
            if (!$hasOther) {
                Personnel::where('code', $data['personnelCode'])->update(['attendance_status' => 'present']);
                PersonnelAttendance::updateOrCreate(
                    ['personnel_code' => $data['personnelCode'], 'date' => $today],
                    ['status' => 'present', 'notes' => '']
                );
            }
        }

        return response()->json(['success' => true, 'leave' => $leave]);
    }

    /**
     * Delete/cancel a scheduled leave.
     */
    public function destroyLeave($id)
    {
        $leave = PersonnelLeave::findOrFail($id);
        $code = $leave->personnel_code;
        $leave->delete();

        $today = Carbon::today()->format('Y-m-d');
        $hasOther = PersonnelLeave::where('personnel_code', $code)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->exists();

        if (!$hasOther) {
            Personnel::where('code', $code)->update(['attendance_status' => 'present']);
            PersonnelAttendance::updateOrCreate(
                ['personnel_code' => $code, 'date' => $today],
                ['status' => 'present', 'notes' => '']
            );
        }

        return response()->json(['success' => true]);
    }
}
