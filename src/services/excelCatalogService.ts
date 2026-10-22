import * as XLSX from 'xlsx';
import { CatalogItem, CatalogType } from '../types';

export interface ConflictItemPair {
  id: string; // Unique conflict identifier
  existingItem: CatalogItem;
  newItem: CatalogItem;
  conflictReason: 'code' | 'name' | 'both';
  resolution: 'replace' | 'ignore';
}

export interface ParseCatalogExcelResult {
  totalRows: number;
  cleanItems: CatalogItem[];
  conflicts: ConflictItemPair[];
  errors: string[];
}

// Normalizer for flexible column header matching
const normalizeHeader = (header: string): string => {
  return header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Aliases for header mapping
const HEADER_ALIASES: Record<string, string[]> = {
  name: [
    'name',
    'officename',
    'worktype',
    'activitytype',
    'itemtype',
    'equipmentname',
    'toolname',
    'itemname',
    'worktypename',
    'facilityname',
    'entryname',
    'label'
  ],
  code: [
    'code',
    'id',
    'identifier',
    'codeid',
    'codeidentifier',
    'number',
    'tag',
    'codeno',
    'itemcode',
    'officecode'
  ],
  acronym: ['acronym', 'abbr', 'abbreviation', 'shortcode'],
  title: [
    'title',
    'officetitle',
    'worktitle',
    'itemtitle',
    'shorttitle',
    'formaltitle'
  ],
  color: ['color', 'tagcolor', 'badgecolor', 'hex', 'colorcode', 'preset'],
  category: ['category', 'classification', 'group', 'type', 'classtype'],
  location: [
    'location',
    'depotbay',
    'storagelocation',
    'storage',
    'depot',
    'bay',
    'rack'
  ],
  quantity: ['quantity', 'qty', 'units', 'stock', 'count', 'amount'],
  owner: ['owner', 'custodian', 'managingdepartment', 'office', 'incharge'],
  purchased: [
    'purchased',
    'datepurchased',
    'purchasedate',
    'dateacquired',
    'acquisitiondate',
    'receiptdate'
  ],
  description: [
    'description',
    'notes',
    'specifications',
    'remarks',
    'specs',
    'details',
    'comment'
  ]
};

const mapRowToFields = (row: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(row)) {
    if (val === undefined || val === null || val === '') continue;
    const norm = normalizeHeader(key);

    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(norm) && result[field] === undefined) {
        result[field] = val;
        break;
      }
    }
  }

  return result;
};

/**
 * Parse an Excel (.xlsx, .xls) or .csv file and extract catalog items
 */
export const parseCatalogFile = async (
  file: File,
  catalogType: CatalogType,
  existingItems: CatalogItem[]
): Promise<ParseCatalogExcelResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    return {
      totalRows: 0,
      cleanItems: [],
      conflicts: [],
      errors: ['The selected spreadsheet contains no visible sheets.']
    };
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: ''
  });

  if (rawRows.length === 0) {
    return {
      totalRows: 0,
      cleanItems: [],
      conflicts: [],
      errors: ['The selected spreadsheet is empty.']
    };
  }

  const cleanItems: CatalogItem[] = [];
  const conflicts: ConflictItemPair[] = [];
  const errors: string[] = [];

  // Index existing items for fast collision checking
  const existingByNormalizedCode = new Map<string, CatalogItem>();
  const existingByNormalizedName = new Map<string, CatalogItem>();

  existingItems.forEach((item) => {
    if (item.code && item.code.trim()) {
      existingByNormalizedCode.set(item.code.trim().toLowerCase(), item);
    }
    if (item.name && item.name.trim()) {
      existingByNormalizedName.set(item.name.trim().toLowerCase(), item);
    }
  });

  let rowIdx = 0;
  for (const raw of rawRows) {
    rowIdx++;
    const mapped = mapRowToFields(raw);

    const name = (mapped.name || '').toString().trim();
    if (!name) {
      // Skip empty or invalid rows without a name
      continue;
    }

    const code = (mapped.code || '').toString().trim();
    const acronym = (mapped.acronym || '').toString().trim();
    const title = (mapped.title || '').toString().trim();
    const color = (mapped.color || '').toString().trim();
    const category = (mapped.category || '').toString().trim();
    const location = (mapped.location || '').toString().trim();
    const owner = (mapped.owner || '').toString().trim();
    const description = (mapped.description || '').toString().trim();
    const purchased = (mapped.purchased || '').toString().trim();
    const quantity = mapped.quantity ? Number(mapped.quantity) || 1 : 1;

    // Generate unique ID
    const generatedId = `${catalogType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${rowIdx}`;

    const parsedItem: CatalogItem = {
      id: generatedId,
      type: catalogType,
      name,
      code: code || undefined,
      acronym: acronym || undefined,
      title: title || undefined,
      color: color || undefined,
      category: category || undefined,
      location: location || undefined,
      owner: owner || undefined,
      purchased: purchased || undefined,
      quantity,
      description: description || undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Check for collision with existing items
    const normCode = code ? code.toLowerCase() : null;
    const normName = name.toLowerCase();

    const existingMatchByCode = normCode ? existingByNormalizedCode.get(normCode) : null;
    const existingMatchByName = existingByNormalizedName.get(normName);

    if (existingMatchByCode || existingMatchByName) {
      const match = existingMatchByCode || existingMatchByName!;
      const isCodeMatch = Boolean(existingMatchByCode);
      const isNameMatch = Boolean(existingMatchByName);

      let conflictReason: 'code' | 'name' | 'both' = 'name';
      if (isCodeMatch && isNameMatch) conflictReason = 'both';
      else if (isCodeMatch) conflictReason = 'code';

      conflicts.push({
        id: `conflict_${rowIdx}_${Date.now()}`,
        existingItem: match,
        newItem: {
          ...parsedItem,
          id: match.id // retain existing id if replaced
        },
        conflictReason,
        resolution: 'replace' // default choice recommended
      });
    } else {
      // Also protect against duplicates WITHIN the same uploaded spreadsheet
      if (normCode) existingByNormalizedCode.set(normCode, parsedItem);
      existingByNormalizedName.set(normName, parsedItem);

      cleanItems.push(parsedItem);
    }
  }

  return {
    totalRows: rawRows.length,
    cleanItems,
    conflicts,
    errors
  };
};

/**
 * Generate and download a sample Excel file tailored for the active category
 */
export const downloadSampleTemplate = (catalogType: CatalogType) => {
  let fileName = `GenSO_${catalogType}_template.xlsx`;
  let headers: string[] = [];
  let sampleRows: any[][] = [];

  switch (catalogType) {
    case 'office':
      fileName = 'GenSO_Offices_Template.xlsx';
      headers = ['Office Name', 'Code', 'Acronym', 'Office Title'];
      sampleRows = [
        ['Office of the President', '101', 'OP', 'OP'],
        ['Human Resource Management Office', '102', 'HRMO', 'HRMO'],
        ['University ICT Services', '103', 'UICTS', 'UICTS'],
        ['Physical Plant and Facilities Office', '104', 'PPFO', 'PPFO']
      ];
      break;

    case 'work_type':
      fileName = 'GenSO_Work_Types_Template.xlsx';
      headers = ['Work Type', 'Code', 'Work Title'];
      sampleRows = [
        ['General Repair', '11', 'REPAIR'],
        ['Replacement & Overhaul', '12', 'REPLACEMENT'],
        ['Fabrication & Installation', '13', 'FAB & INSTALL'],
        ['Preventive Maintenance', '14', 'PREVENTIVE']
      ];
      break;

    case 'activity_type':
      fileName = 'GenSO_Activity_Types_Template.xlsx';
      headers = ['Activity Type', 'Code'];
      sampleRows = [
        ['Carpentry & Masonry', '01'],
        ['Electrical Systems & Wiring', '02'],
        ['Plumbing & Sanitation', '03'],
        ['Air Conditioning & HVAC', '04'],
        ['Welding & Metal Fabrication', '05']
      ];
      break;

    case 'item_type':
      fileName = 'GenSO_Item_Types_Template.xlsx';
      headers = ['Item Type', 'Code', 'Item Title', 'Tag Color'];
      sampleRows = [
        ['Building / Structure', '01', 'BUILDING', '#006C49'],
        ['Floor / Hallway', '02', 'FLOOR', '#2563EB'],
        ['Wall & Ceiling', '03', 'WALL', '#D97706'],
        ['Door & Locks', '04', 'DOOR', '#DC2626']
      ];
      break;

    case 'equipment':
      fileName = 'GenSO_Equipment_Template.xlsx';
      headers = [
        'Equipment Name',
        'Code',
        'Category',
        'Storage Location',
        'Quantity',
        'Owner',
        'Date Purchased',
        'Description'
      ];
      sampleRows = [
        [
          'Heavy Duty Concrete Drill',
          'EQ-001',
          'Power Tools',
          'Depot Bay 1, Rack A',
          2,
          'Facilities Management Office',
          '2024-03-15',
          '800W rotary hammer drill'
        ],
        [
          'Industrial Scaffolding Kit',
          'EQ-002',
          'Heavy Duty',
          'Depot Bay 3',
          4,
          'Physical Plant Office',
          '2023-11-20',
          '6-tier galvanized steel scaffolding'
        ]
      ];
      break;

    default:
      headers = ['Name', 'Code', 'Title'];
      sampleRows = [['Sample Item', '01', 'SAMPLE']];
  }

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = headers.map(() => ({ wch: 26 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, fileName);
};
