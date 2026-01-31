'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function logoutAction() {
    const supabase = await createClient()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error)
    }

    // Clear paths and redirect
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function updateProfileAction(formData: FormData) {
    const supabase = await createAdminClient()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string
    const displayName = formData.get('displayName') as string | null

    if (!userId) return { success: false, message: 'Missing userId' }

    let avatar_url = undefined

    if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file)

        if (uploadError) return { success: false, message: uploadError.message }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        avatar_url = publicUrl
    }

    const updateData: any = {}
    if (displayName) updateData.display_name = displayName
    if (avatar_url) updateData.avatar_url = avatar_url

    if (Object.keys(updateData).length === 0) return { success: true }

    const { error: updateError } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('auth_id', userId)

    if (updateError) return { success: false, message: updateError.message }

    revalidatePath('/settings')
    return { success: true }
}

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) return { success: false, message: 'Email and password are required' }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        return { success: false, message: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
