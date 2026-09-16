<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegistrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $jsonPath = database_path('data/registry_data.json');
        if (!file_exists($jsonPath)) {
            $this->command->error("Registry JSON not found at: {$jsonPath}");
            return;
        }

        $raw = file_get_contents($jsonPath);
        $data = json_decode($raw, true);

        DB::transaction(function () use ($data) {
            DB::table('catalogs')->whereIn('type', ['office', 'asset', 'work_type', 'activity_type', 'item_type'])->delete();

            $now = now();
            $rows = [];

            // 1. Offices
            foreach ($data['offices'] as $o) {
                $rows[] = [
                    'type' => 'office',
                    'name' => trim($o['name']),
                    'code' => trim($o['code']),
                    'acronym' => trim($o['acronym'] ?? ''),
                    'title' => trim($o['title'] ?? ''),
                    'category' => 'University Office',
                    'location' => null,
                    'contact_person' => null,
                    'quantity' => 1,
                    'is_active' => 1,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // 2. Work Types
            foreach ($data['workTypes'] as $wt) {
                $rows[] = [
                    'type' => 'work_type',
                    'name' => trim($wt['name']),
                    'code' => trim($wt['code']),
                    'acronym' => null,
                    'title' => trim($wt['title'] ?? ''),
                    'category' => 'Work Classification',
                    'location' => null,
                    'contact_person' => null,
                    'quantity' => 1,
                    'is_active' => 1,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // 3. Activity Types
            foreach ($data['activityTypes'] as $at) {
                $rows[] = [
                    'type' => 'activity_type',
                    'name' => trim($at['name']),
                    'code' => trim($at['code']),
                    'acronym' => null,
                    'title' => null,
                    'category' => 'Activity Classification',
                    'location' => null,
                    'contact_person' => null,
                    'quantity' => 1,
                    'is_active' => 1,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // 4. Item Types
            foreach ($data['itemTypes'] as $it) {
                $rows[] = [
                    'type' => 'item_type',
                    'name' => trim($it['name']),
                    'code' => trim($it['code']),
                    'acronym' => null,
                    'title' => trim($it['title'] ?? ''),
                    'category' => 'Item Classification',
                    'location' => null,
                    'contact_person' => null,
                    'quantity' => 1,
                    'is_active' => 1,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            foreach (array_chunk($rows, 50) as $chunk) {
                DB::table('catalogs')->insert($chunk);
            }
        });

        $this->command->info("Seeded: " . count($data['offices']) . " offices, " . count($data['workTypes']) . " work types, " . count($data['activityTypes']) . " activity types, " . count($data['itemTypes']) . " item types.");
    }
}
