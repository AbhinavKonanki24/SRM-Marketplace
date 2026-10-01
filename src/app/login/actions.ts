'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const AuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  const parsed = AuthSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    redirect('/error?message=' + encodeURIComponent(parsed.error.issues[0].message))
  }

  const data = parsed.data

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const parsed = AuthSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    redirect('/error?message=' + encodeURIComponent(parsed.error.issues[0].message))
  }

  const data = parsed.data

  if (!data.email.endsWith('@srmist.edu.in')) {
    redirect('/error?message=Only SRM students (@srmist.edu.in) can sign up.')
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  // If email confirmation is enabled, session will be null
  if (!authData.session) {
    redirect('/error?message=' + encodeURIComponent('Account created! Please check your email to verify your account before signing in.'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
