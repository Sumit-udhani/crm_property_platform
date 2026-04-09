// @next
import dynamic from 'next/dynamic';

const AuthSetPassword = dynamic(() => import('@/views/auth/set-password'));

export default function SetPasswordPage() {
  return <AuthSetPassword />;
}