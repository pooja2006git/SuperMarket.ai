import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

const SUPABASE_URL = 'https://ujxibknmaijlbqnnkdie.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqeGlia25tYWlqbGJxbm5rZGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTI0Mzc2NiwiZXhwIjoyMDk2ODE5NzY2fQ.dZuSP-9Eir0-wmAd5NVC1AxgcE1xfwFrIqDNlTorlyo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Loading embedding model...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const { data: products, error } = await supabase.from('products').select('*');
  if (error) { console.error('Error fetching products:', error); return; }

  console.log(`Embedding ${products.length} products...`);

  for (const product of products) {
    const content = `${product.name} in category ${product.category}. Price: ₹${product.price}. Stock: ${product.stock_quantity} units.`;
    
    const output = await extractor(content, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    const { error: insertError } = await supabase.from('product_embeddings').upsert({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: product.price,
      stock_quantity: product.stock_quantity,
      content,
      embedding,
    }, { onConflict: 'product_id' });

    if (insertError) console.error(`Error inserting ${product.name}:`, insertError);
    else console.log(`✓ Embedded: ${product.name}`);
  }

  console.log('Done!');
}

run();