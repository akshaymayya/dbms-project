import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwljfnsxrnosgtbcupob.supabase.co';
const supabaseKey = 'sb_publishable_pdTreWPW-7Z0ZBIGgS9m7A_RKwUUDlO';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('bookings').insert([{
    slot_id: 'A6',
    customer_name: 'kk',
    vehicle_number: 'MH12',
    start_time: '12:00',
    end_time: '13:00'
  }]);

  if (error) {
    console.error('INSERT ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

testInsert();
