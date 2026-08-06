import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WorkOrder } from '../types';

const STORAGE_KEY = 'infra_work_orders';

export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedData: WorkOrder[] = data.map((item) => ({
          code: item.code,
          assetName: item.asset_name,
          space: item.space || '',
          scope: item.scope || '',
          workgroup: item.workgroup || '',
          status: item.status || 'Pending',
          priority: item.priority || 'Medium',
          worktype: item.worktype || '',
          startDate: item.start_date || '',
          endDate: item.end_date || '',
          startTime: item.start_time || '',
          endTime: item.end_time || '',
          foreman: item.foreman || '',
          assigned: item.assigned || [],
          description: item.description || '',
          workTitle: item.work_title || '',
          dateReceived: item.date_received || '',
          requesterName: item.requester_name || '',
          requestingOffice: item.requesting_office || '',
          roomNo: item.room_no || '',
          isLocked: item.is_locked || false,
          tasks: item.tasks || []
        }));
        // Sync local cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedData));
        return mappedData;
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local storage cache:', e);
    }
  }

  // Fallback to local storage
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached work orders', e);
    }
  }
  return [];
};

export const saveWorkOrderToDb = async (order: WorkOrder): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const dbPayload = {
        code: order.code,
        asset_name: order.assetName,
        space: order.space,
        scope: order.scope,
        workgroup: order.workgroup,
        status: order.status,
        priority: order.priority,
        worktype: order.worktype,
        start_date: order.startDate || null,
        end_date: order.endDate || null,
        start_time: order.startTime,
        end_time: order.endTime,
        foreman: order.foreman,
        assigned: order.assigned,
        description: order.description,
        work_title: order.workTitle,
        date_received: order.dateReceived || null,
        requester_name: order.requesterName,
        requesting_office: order.requestingOffice,
        room_no: order.roomNo,
        is_locked: order.isLocked || false,
        tasks: order.tasks || []
      };

      const { error } = await supabase
        .from('work_orders')
        .upsert(dbPayload, { onConflict: 'code' });

      if (error) {
        console.error('Failed to save work order to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase save error:', e);
      return false;
    }
  }
  return true;
};

export const deleteWorkOrderFromDb = async (code: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('code', code);

      if (error) {
        console.error('Failed to delete work order from Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase delete error:', e);
      return false;
    }
  }
  return true;
};
