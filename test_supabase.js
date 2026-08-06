import { createClient } from '@supabase/supabase-js';

const url = 'https://zwaswfvbnhcitkccgxvw.supabase.co';
const key = 'sb_publishable_Z0hbsXB5AJGirXtqXRMhRQ_h8JhhTTi';

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const sampleOrder = {
      code: 'WO-8492',
      asset_name: 'Coconut Dorm',
      space: 'Room 21',
      scope: 'Check electrical outlets, install new LED light fixtures, inspect wire insulation.',
      workgroup: 'Building Repair & Maintenance',
      status: 'In Progress',
      priority: 'Medium',
      worktype: 'Electrical',
      start_date: '2024-08-24',
      end_date: '2024-08-26',
      start_time: '08:30 AM',
      end_time: '05:00 PM',
      foreman: 'Robert Chen',
      assigned: ['Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez'],
      description: 'Multiple electrical outlets are inactive. Main breaker checked.'
    };

    const { error: insertError } = await supabase.from('work_orders').upsert(sampleOrder, { onConflict: 'code' });
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('✅ Successfully inserted sample work order WO-8492 into Supabase!');
    }

    const { data: woData2 } = await supabase.from('work_orders').select('*');
    console.log('✅ Verified count after insert:', woData2 ? woData2.length : 0);

    const { data: pData, error: pError } = await supabase.from('personnel').select('*');
    if (pError) {
      console.error('personnel query error:', pError);
    } else {
      console.log('✅ Successfully queried personnel. Count:', pData ? pData.length : 0);
    }

    const { data: wgData, error: wgError } = await supabase.from('work_groups').select('*');
    if (wgError) {
      console.error('work_groups query error:', wgError);
    } else {
      console.log('✅ Successfully queried work_groups. Count:', wgData ? wgData.length : 0);
    }

    const { data: wlData, error: wlError } = await supabase.from('daily_work_logs').select('*');
    if (wlError) {
      console.error('daily_work_logs query error:', wlError);
    } else {
      console.log('✅ Successfully queried daily_work_logs. Count:', wlData ? wlData.length : 0);
    }

  } catch (err) {
    console.error('Connection test exception:', err);
  }
}

testConnection();
