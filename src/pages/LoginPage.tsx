import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { extractApiErrorMessage } from '../config/api';
import { PrimaryButton } from '../components/PrimaryButton';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'E-mail ou senha incorretos.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, textAlign: 'center' }}>Entrar</h1>
      <p style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>
        Entre para finalizar seu pedido, ver seus favoritos e acompanhar suas entregas.
      </p>

      <form onSubmit={handleSubmit} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 24 }}>
        <label style={labelStyle}>E-mail</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>Senha</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

        {errorMessage ? <p style={{ color: colors.danger, fontSize: 13 }}>{errorMessage}</p> : null}

        <PrimaryButton type="submit" loading={isSubmitting} style={{ marginTop: 10 }}>
          Entrar
        </PrimaryButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: 18, color: colors.textMuted }}>
        Não tem conta?{' '}
        <Link to="/cadastro" state={{ from }} style={{ color: colors.primaryDark, fontWeight: 700 }}>
          Criar conta
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
