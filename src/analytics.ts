import { supabase } from './supabase';

export type AnalyticsEvent =
  | 'user_signup'
  | 'user_login'
  | 'booking_started'
  | 'booking_created'
  | 'booking_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'promo_applied'
  | 'referral_shared'
  | 'profile_updated'
  | 'vehicle_added'
  | 'cgu_accepted'
  | 'account_deleted'
  | 'subscription_started'
  | 'app_opened';

export async function track(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('analytics').insert({
      event,
      user_id: user?.id ?? null,
      properties: properties ?? {},
      created_at: new Date().toISOString(),
      platform: 'ios', // À remplacer dynamiquement si besoin
    });
  } catch {
    // Les erreurs analytics ne doivent jamais crasher l'app
    if (__DEV__) console.warn('[Analytics] Failed to track:', event);
  }
}
