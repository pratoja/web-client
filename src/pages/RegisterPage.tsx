import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { extractApiErrorMessage } from '../config/api';
import { PrimaryButton } from '../components/PrimaryButton';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!termsAccepted) {
      setErrorMessage('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        termsAccepted: true,
      });
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Não foi possível criar sua conta.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, textAlign: 'center' }}>Criar conta</h1>
      <p style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>
        Rápido e grátis — só o necessário para fazer seus pedidos.
      </p>

      <form onSubmit={handleSubmit} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 24 }}>
        <label style={labelStyle}>Nome</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>E-mail</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Celular (opcional)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 11999998888" style={inputStyle} />

        <label style={labelStyle}>Senha</label>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 14, fontSize: 13, color: colors.textMuted }}>
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} style={{ marginTop: 2 }} />
          Li e aceito os Termos de Uso e a Política de Privacidade.
        </label>

        {errorMessage ? <p style={{ color: colors.danger, fontSize: 13 }}>{errorMessage}</p> : null}

        <PrimaryButton type="submit" loading={isSubmitting} style={{ marginTop: 14 }}>
          Criar conta
        </PrimaryButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: 18, color: colors.textMuted }}>
        Já tem conta?{' '}
        <Link to="/entrar" state={{ from }} style={{ color: colors.primaryDark, fontWeight: 700 }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: colors.text, marginTop: 14, marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  paddingLeft: 14,
  fontSize: 14,
  boxSizing: 'border-box',
};
