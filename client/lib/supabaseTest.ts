import { supabase } from './supabaseClient';

// Fetch all rows from the 'test' table
export async function fetchTestRows() {
  const { data, error } = await supabase.from('test').select('*');
  if (error) throw error;
  return data;
}

// Insert a row into the 'test' table
export async function insertTestRow(row: Record<string, any>) {
  const { data, error } = await supabase.from('test').insert([row]);
  if (error) throw error;
  return data;
}

// Update a row in the 'test' table by id
export async function updateTestRow(id: number, updates: Record<string, any>) {
  const { data, error } = await supabase.from('test').update(updates).eq('id', id);
  if (error) throw error;
  return data;
}

// Delete a row from the 'test' table by id
export async function deleteTestRow(id: number) {
  const { data, error } = await supabase.from('test').delete().eq('id', id);
  if (error) throw error;
  return data;
}
