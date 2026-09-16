<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$items = App\Models\CatalogItem::where('type', 'item_type')->get(['id', 'code', 'name', 'color']);
echo "Total item_types in DB: " . $items->count() . "\n";
foreach ($items->take(5) as $i) {
    echo "ID: {$i->id} | Code: {$i->code} | Name: {$i->name} | Color: {$i->color}\n";
}
