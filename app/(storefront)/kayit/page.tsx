'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useT } from '@/components/providers/language-provider'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Kullanım koşullarını kabul etmelisiniz'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const t = useT()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false
    }
  })

  const acceptTerms = watch('acceptTerms')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password
        })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Kayıt başarısız')
      }

      toast.success(t('register_success'))
      router.push('/giris')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('product_add_error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-background p-8 rounded-sm shadow-sm">
          <div className="text-center mb-8">
            <Link href="/" className="font-serif text-3xl tracking-[0.2em]">
              SETRA
            </Link>
            <h1 className="mt-6 font-serif text-2xl">{t('register_title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('register_subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('first_name')}</Label>
                <Input
                  id="firstName"
                  placeholder={t('first_name')}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">{t('last_name')}</Label>
                <Input
                  id="lastName"
                  placeholder={t('last_name')}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('email_placeholder')}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">{t('phone_label')}</Label>
              <Input
                id="phone"
                placeholder="05XX XXX XX XX"
                {...register('phone')}
              />
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
              />
              <label htmlFor="acceptTerms" className="text-sm leading-tight">
                <Link href="/kullanim-kosullari" className="underline">
                  {t('accept_terms_text')}
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('register_loading') : t('register_title')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('already_have_account')}{' '}
            <Link
              href="/giris"
              className="text-foreground font-medium hover:underline"
            >
              {t('sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
