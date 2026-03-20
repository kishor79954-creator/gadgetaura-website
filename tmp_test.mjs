import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, compare_at_price, image_url, homepageslot, stock_count")
    .in("homepageslot", [1, 2, 3, 4])
    .order("homepageslot", { ascending: true })

  console.log("FEATURED:", data, error);
}

check();
