const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hwaeumoelgykkrvhcgbn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YWV1bW9lbGd5a2tydmhjZ2JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NDI0NCwiZXhwIjoyMDc5OTcwMjQ0fQ.AEi_XxfpaQDZWO5j-MpZgmEn4YWQ6n4F3ZWHrJ3AbKY');

async function fixBucket() {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    console.log('Current Buckets:', buckets.map(b => b.name));

    if (!buckets.find(b => b.name === 'avatars')) {
        const { data, error } = await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
        });
        if (error) console.error('Error creating bucket:', error);
        else console.log('Successfully created avatars bucket');
    } else {
        console.log('Bucket avatars already exists');
    }
}
fixBucket();
