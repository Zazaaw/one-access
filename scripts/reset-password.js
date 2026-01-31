
const { createClient } = require('@supabase/supabase-js');

// Kredensial dari .env hcis-web
const SUPABASE_URL = 'https://hwaeumoelgykkrvhcgbn.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YWV1bW9lbGd5a2tydmhjZ2JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NDI0NCwiZXhwIjoyMDc5OTcwMjQ0fQ.AEi_XxfpaQDZWO5j-MpZgmEn4YWQ6n4F3ZWHrJ3AbKY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const USER_ID = '8280f458-16ec-4977-ae3f-160232946bc1'; // ID dari check-user.js
const NEW_PASSWORD = '123456';

async function resetPassword() {
    console.log(`Mereset password untuk User ID: ${USER_ID}...`);

    const { data, error } = await supabase.auth.admin.updateUserById(
        USER_ID,
        { password: NEW_PASSWORD }
    );

    if (error) {
        console.error("❌ Gagal reset password:", error.message);
    } else {
        console.log("✅ Password BERHASIL direset!");
        console.log(`📧 User Email: ${data.user.email}`);
        console.log(`🔑 New Password: ${NEW_PASSWORD}`);
        console.log("Silakan login sekarang juga.");
    }
}

resetPassword();
