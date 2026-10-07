import { MasterCatalogsState, CatalogItem } from '../types';
import registryJson from './registryData.json';

const defaultOffices: CatalogItem[] = registryJson.offices.map((o: any, idx: number) => ({
  id: `off-${idx + 1}`,
  type: 'office',
  name: o.name,
  code: o.code,
  acronym: o.acronym,
  title: o.title,
  category: 'University Office',
  isActive: true,
  createdAt: '2026-08-01'
}));

const defaultWorkTypes: CatalogItem[] = registryJson.workTypes.map((wt: any, idx: number) => ({
  id: `wt-${idx + 1}`,
  type: 'work_type',
  name: wt.name,
  code: wt.code,
  title: wt.title,
  category: 'Work Classification',
  isActive: true,
  createdAt: '2026-08-01'
}));

const defaultActivityTypes: CatalogItem[] = registryJson.activityTypes.map((at: any, idx: number) => ({
  id: `act-${idx + 1}`,
  type: 'activity_type',
  name: at.name,
  code: at.code,
  category: 'Activity Classification',
  isActive: true,
  createdAt: '2026-08-01'
}));

export const ITEM_TYPE_COLOR_PALETTE = [
  '#8BA869', // 01 Building/Structure - Sage Green
  '#4F46E5', // 02 Wall Partitions - Indigo
  '#0284C7', // 03 Doors & Windows - Sky Blue
  '#D97706', // 04 Ceilings - Amber
  '#7C3AED', // 05 Flooring & Tiling - Purple
  '#0D9488', // 06 Roofing & Gutters - Teal
  '#E11D48', // 07 Cabinets & Millwork - Rose
  '#EA580C', // 08 Lighting Fixtures - Orange
  '#F59E0B', // 09 Power Outlets & Switches - Warm Amber
  '#2563EB', // 10 Distribution Panel - Blue
  '#059669', // 11 Sanitary Fixtures - Emerald
  '#0891B2', // 12 Water Pipelines & Valves - Cyan
  '#475569', // 13 Drainage & Sewerage - Slate
  '#3B82F6', // 14 Air Conditioning Units - Frost Blue
  '#10B981', // 15 Ventilation Fans - Mint
  '#B45309', // 16 Exhaust Systems - Russet
  '#9333EA', // 17 Desks & Tables - Violet
  '#6366F1', // 18 Chairs & Seating - Periwinkle
  '#64748B', // 19 Storage & Shelving - Cool Slate
  '#65A30D', // 20 Sidewalks & Pavements - Lime
  '#78716C', // 21 Fences & Gates - Warm Stone
  '#16A34A', // 22 Landscaping Elements - Green
];

export const getItemTypeColor = (name: string, catalogs?: MasterCatalogsState): string => {
  if (!name) return '#8BA869';
  if (catalogs?.itemTypes && catalogs.itemTypes.length > 0) {
    const found = catalogs.itemTypes.find((it) => it.name.toLowerCase() === name.toLowerCase());
    if (found?.color) return found.color;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % ITEM_TYPE_COLOR_PALETTE.length;
  return ITEM_TYPE_COLOR_PALETTE[idx];
};

const defaultItemTypes: CatalogItem[] = registryJson.itemTypes.map((it: any, idx: number) => ({
  id: `item-${idx + 1}`,
  type: 'item_type',
  name: it.name,
  code: it.code,
  title: it.title,
  color: ITEM_TYPE_COLOR_PALETTE[idx % ITEM_TYPE_COLOR_PALETTE.length],
  category: 'Item Classification',
  isActive: true,
  createdAt: '2026-08-01'
}));

const defaultEquipment: CatalogItem[] = [
  {
    id: 'eq-cat-1',
    type: 'equipment',
    name: 'Hydraulic Pipe Sealer',
    code: 'EQ-001',
    category: 'Plumbing & Pressure',
    location: 'Facilities Depot Bay 1',
    owner: 'Physical Plant Office',
    purchased: '2024-03-15',
    quantity: 4,
    isActive: true,
    description: 'Heavy-duty hydraulic clamp tool for rapid high-pressure line sealing and pipe crimping.',
    createdAt: '2026-08-01'
  },
  {
    id: 'eq-cat-2',
    type: 'equipment',
    name: 'Industrial Extension Ladder',
    code: 'EQ-002',
    category: 'Height & Safety',
    location: 'Tool Depot Rack A',
    owner: 'General Services Office',
    purchased: '2023-11-20',
    quantity: 8,
    isActive: true,
    description: '28-foot fiberglass dual-extension ladder with non-conductive rails and anti-slip feet.',
    createdAt: '2026-08-01'
  },
  {
    id: 'eq-cat-3',
    type: 'equipment',
    name: 'Digital Multimeter & Clamp',
    code: 'EQ-003',
    category: 'Electrical Diagnostic',
    location: 'Electrician Locker',
    owner: 'Electrical Engineering',
    purchased: '2024-01-10',
    quantity: 12,
    isActive: true,
    description: 'True-RMS 1000V digital multimeter with non-contact voltage sensor and current clamp.',
    createdAt: '2026-08-01'
  },
  {
    id: 'eq-cat-4',
    type: 'equipment',
    name: 'Commercial Vacuum Recovery System',
    code: 'EQ-004',
    category: 'HVAC Equipment',
    location: 'HVAC Bay 3',
    owner: 'Mechanical & Climate',
    purchased: '2023-08-05',
    quantity: 3,
    isActive: true,
    description: 'Refrigerant recovery pump and 2-stage deep vacuum system for HVAC maintenance.',
    createdAt: '2026-08-01'
  },
  {
    id: 'eq-cat-5',
    type: 'equipment',
    name: 'Heavy-Duty Rotary Hammer Drill',
    code: 'EQ-005',
    category: 'Power Tools',
    location: 'Tool Depot Rack C',
    owner: 'Civil Works',
    purchased: '2024-05-18',
    quantity: 6,
    isActive: true,
    description: 'SDS-Plus 1-inch masonry hammer drill with vibration damping and depth gauge.',
    createdAt: '2026-08-01'
  },
  {
    id: 'eq-cat-6',
    type: 'equipment',
    name: 'Thermal Imaging Inspection Camera',
    code: 'EQ-006',
    category: 'Inspection & Diagnostic',
    location: 'Supervisor Vault',
    owner: 'EHS & Safety',
    purchased: '2025-02-14',
    quantity: 2,
    isActive: true,
    description: 'High-resolution handheld infrared thermal imaging camera for electrical and insulation audits.',
    createdAt: '2026-08-01'
  },
  {
    id: 'eq-cat-7',
    type: 'equipment',
    name: 'Pressure Washer 2200 PSI',
    code: 'EQ-007',
    category: 'Cleaning & Washdown',
    location: 'Facilities Shed',
    owner: 'Building Repair & Maint.',
    purchased: '2024-09-08',
    quantity: 5,
    isActive: true,
    description: 'Electric induction motor commercial pressure washer with interchangeable spray nozzles.',
    createdAt: '2026-08-01'
  }
];

export const DEFAULT_CATALOGS_STATE: MasterCatalogsState = {
  offices: defaultOffices,
  workTypes: defaultWorkTypes,
  activityTypes: defaultActivityTypes,
  itemTypes: defaultItemTypes,
  equipment: defaultEquipment
};

const STORAGE_KEY = 'genso_master_catalogs_v2';

export const loadStoredCatalogs = (): MasterCatalogsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATALOGS_STATE;
    const parsed = JSON.parse(raw);
    return {
      offices: Array.isArray(parsed.offices) && parsed.offices.length > 0 ? parsed.offices : DEFAULT_CATALOGS_STATE.offices,
      workTypes: Array.isArray(parsed.workTypes) && parsed.workTypes.length > 0 ? parsed.workTypes : DEFAULT_CATALOGS_STATE.workTypes,
      activityTypes: Array.isArray(parsed.activityTypes) && parsed.activityTypes.length > 0 ? parsed.activityTypes : DEFAULT_CATALOGS_STATE.activityTypes,
      itemTypes: Array.isArray(parsed.itemTypes) && parsed.itemTypes.length > 0
        ? parsed.itemTypes.map((it: any, idx: number) => ({
            ...it,
            color: it.color || ITEM_TYPE_COLOR_PALETTE[idx % ITEM_TYPE_COLOR_PALETTE.length]
          }))
        : DEFAULT_CATALOGS_STATE.itemTypes,
      equipment: Array.isArray(parsed.equipment) && parsed.equipment.length > 0
        ? parsed.equipment.map((eq: any) => {
            const def = defaultEquipment.find((d) => d.code === eq.code || d.id === eq.id || d.name === eq.name);
            return {
              ...eq,
              owner: eq.owner ?? def?.owner ?? '',
              purchased: eq.purchased ?? eq.purchasedDate ?? def?.purchased ?? ''
            };
          })
        : DEFAULT_CATALOGS_STATE.equipment
    };
  } catch {
    return DEFAULT_CATALOGS_STATE;
  }
};

export const saveStoredCatalogs = (data: MasterCatalogsState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save master catalogs to local storage', e);
  }
};
