require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://cunchjbiaycbqvptuefa.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
    console.warn('Warning: SUPABASE_KEY is missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
