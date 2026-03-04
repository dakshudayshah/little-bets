import { supabase } from './supabase';

function getSessionId(): string {
  let id = sessionStorage.getItem('lb_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('lb_session_id', id);
  }
  return id;
}

export function track(eventName: string, properties: Record<string, unknown> = {}) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    supabase
      .from('events')
      .insert({
        event_name: eventName,
        properties,
        user_id: session?.user?.id ?? null,
        session_id: getSessionId(),
        page_url: window.location.pathname,
      })
      .then(() => {});
  });
}
