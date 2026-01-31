
const { createClient } = require('@supabase/supabase-js');

// Kredensial dari .env hcis-web yang saya lihat tadi
const SUPABASE_URL = 'https://hwaeumoelgykkrvhcgbn.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YWV1bW9lbGd5a2tydmhjZ2JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NDI0NCwiZXhwIjoyMDc5OTcwMjQ0fQ.AEi_XxfpaQDZWO5j-MpZgmEn4YWQ6n4F3ZWHrJ3AbKY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkUser() {
    console.log("Mencari user dengan NIK 3023255 di auth.users...");

    // List users (karena kita tidak bisa filter based on email partial di admin API dengan mudah, kita ambil list dan filter manual atau coba exact match logat lokal)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error:", error);
        return;
    }

    const found = users.filter(u => u.email && u.email.includes('3023255'));

    if (found.length > 0) {
        console.log("\n✅ DITEMUKAN USER:");
        found.forEach(u => {
            console.log(`- Email: ${u.email}`);
            console.log(`- ID: ${u.id}`);
            console.log(`- Last Sign In: ${u.last_sign_in_at}`);
        });
    } else {
        console.log("❌ TIDAK DITEMUKAN user dengan angka 3023255 di emailnya.");
        console.log("Sampel 5 user lain di DB:");
        users.slice(0, 5).forEach(u => console.log(`- ${u.email}`));
    }
}

checkUser();
