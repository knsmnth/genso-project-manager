<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::orderBy('name', 'asc')->get();
        return response()->json($teams);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        $team = Team::updateOrCreate(
            ['name' => $data['name']],
            [
                'lead' => $data['lead'],
                'size' => $data['size'] ?? count($data['members'] ?? []),
                'jobs' => $data['jobs'] ?? 0,
                'members' => $data['members'] ?? [],
            ]
        );

        return response()->json(['success' => true, 'team' => $team]);
    }
}
