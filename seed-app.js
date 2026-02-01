require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const appData = {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    app_code: "PLATFORM",
    app_name: "Platform Services Console",
    app_description: "Pusat kendali layanan integrasi, notifikasi, dan workflow lintas aplikasi.",
    app_type: "infrastructure",
    base_url: "http://localhost:3008",
    is_active: true,
    requires_employee: false
};

async function seed() {
    console.log('Seeding Platform Services app into iam_applications...');
    const { data, error } = await supabase
        .from('iam_applications')
        .upsert(appData)
        .select();

    if (error) {
        console.error('Error seeding app:', error);
    } else {
        console.log('Success:', data);
    }
}

seed();
