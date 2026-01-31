const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hwaeumoelgykkrvhcgbn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YWV1bW9lbGd5a2tydmhjZ2JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM5NDI0NCwiZXhwIjoyMDc5OTcwMjQ0fQ.AEi_XxfpaQDZWO5j-MpZgmEn4YWQ6n4F3ZWHrJ3AbKY');

async function checkConfirmation() {
    const { data, error } = await supabase.auth.admin.getUserById('8280f458-16ec-4977-ae3f-160232946bc1');
    if (error) {
        console.error(error);
        return;
    }

    console.log('Confirmed At:', data.user.email_confirmed_at);

    if (!data.user.email_confirmed_at) {
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            '8280f458-16ec-4977-ae3f-160232946bc1',
            { email_confirm: true }
        );
        if (updateError) console.error(updateError);
        else console.log('User manually confirmed.');
    } else {
        console.log('User is already confirmed.');
    }
}
checkConfirmation();
