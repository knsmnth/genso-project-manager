<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Display a grouped listing of all active catalog entries.
     */
    public function index()
    {
        $items = CatalogItem::orderBy('name', 'asc')->get()->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'type' => $item->type,
                'name' => $item->name,
                'code' => $item->code ?? '',
                'acronym' => $item->acronym ?? '',
                'title' => $item->title ?? '',
                'color' => $item->color ?? '',
                'category' => $item->category ?? '',
                'location' => $item->location ?? '',
                'owner' => $item->owner ?? '',
                'purchased' => $item->purchased ?? '',
                'contactPerson' => $item->contact_person ?? '',
                'quantity' => (int) ($item->quantity ?? 1),
                'isActive' => (bool) ($item->is_active ?? true),
                'description' => $item->description ?? '',
                'createdAt' => $item->created_at ? $item->created_at->format('Y-m-d') : null,
            ];
        });

        return response()->json([
            'offices' => $items->where('type', 'office')->values(),
            'assets' => $items->where('type', 'asset')->values(),
            'workTypes' => $items->where('type', 'work_type')->values(),
            'activityTypes' => $items->where('type', 'activity_type')->values(),
            'itemTypes' => $items->where('type', 'item_type')->values(),
            'equipment' => $items->where('type', 'equipment')->values(),
        ]);
    }

    /**
     * Store a newly created or updated catalog record.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|string|in:office,asset,work_type,activity_type,item_type,equipment',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'acronym' => 'nullable|string|max:100',
            'title' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'owner' => 'nullable|string|max:255',
            'purchased' => 'nullable|string|max:255',
            'contactPerson' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:0',
            'isActive' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $item = CatalogItem::firstOrCreate(
            ['type' => $data['type'], 'name' => trim($data['name'])],
            [
                'code' => $data['code'] ?? null,
                'acronym' => $data['acronym'] ?? null,
                'title' => $data['title'] ?? null,
                'color' => $data['color'] ?? null,
                'category' => $data['category'] ?? null,
                'location' => $data['location'] ?? null,
                'owner' => $data['owner'] ?? null,
                'purchased' => $data['purchased'] ?? null,
                'contact_person' => $data['contactPerson'] ?? null,
                'quantity' => $data['quantity'] ?? 1,
                'is_active' => $data['isActive'] ?? true,
                'description' => $data['description'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'item' => [
                'id' => (string) $item->id,
                'type' => $item->type,
                'name' => $item->name,
                'code' => $item->code ?? '',
                'acronym' => $item->acronym ?? '',
                'title' => $item->title ?? '',
                'color' => $item->color ?? '',
                'category' => $item->category ?? '',
                'location' => $item->location ?? '',
                'owner' => $item->owner ?? '',
                'purchased' => $item->purchased ?? '',
                'contactPerson' => $item->contact_person ?? '',
                'quantity' => (int) ($item->quantity ?? 1),
                'isActive' => (bool) $item->is_active,
                'description' => $item->description ?? '',
                'createdAt' => $item->created_at ? $item->created_at->format('Y-m-d') : null,
            ]
        ], 201);
    }

    /**
     * Update an existing catalog record.
     */
    public function update(Request $request, $id)
    {
        $item = CatalogItem::findOrFail($id);

        $data = $request->all();

        $item->update([
            'name' => isset($data['name']) ? trim($data['name']) : $item->name,
            'code' => $data['code'] ?? $item->code,
            'acronym' => $data['acronym'] ?? $item->acronym,
            'title' => $data['title'] ?? $item->title,
            'color' => $data['color'] ?? $item->color,
            'category' => $data['category'] ?? $item->category,
            'location' => $data['location'] ?? $item->location,
            'owner' => $data['owner'] ?? $item->owner,
            'purchased' => $data['purchased'] ?? $item->purchased,
            'contact_person' => $data['contactPerson'] ?? $item->contact_person,
            'quantity' => isset($data['quantity']) ? (int) $data['quantity'] : $item->quantity,
            'is_active' => isset($data['isActive']) ? (bool) $data['isActive'] : $item->is_active,
            'description' => $data['description'] ?? $item->description,
        ]);

        return response()->json([
            'success' => true,
            'item' => [
                'id' => (string) $item->id,
                'type' => $item->type,
                'name' => $item->name,
                'code' => $item->code ?? '',
                'acronym' => $item->acronym ?? '',
                'title' => $item->title ?? '',
                'color' => $item->color ?? '',
                'category' => $item->category ?? '',
                'location' => $item->location ?? '',
                'owner' => $item->owner ?? '',
                'purchased' => $item->purchased ?? '',
                'contactPerson' => $item->contact_person ?? '',
                'quantity' => (int) $item->quantity,
                'isActive' => (bool) $item->is_active,
                'description' => $item->description ?? '',
                'createdAt' => $item->created_at ? $item->created_at->format('Y-m-d') : null,
            ]
        ]);
    }

    /**
     * Remove the specified catalog entry.
     */
    public function destroy($id)
    {
        CatalogItem::where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
