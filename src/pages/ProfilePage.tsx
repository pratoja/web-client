import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { api, extractApiErrorMessage } from '../config/api';
import { PrimaryButton } from '../components/PrimaryButton';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  function openEditProfile() {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setIsEditingProfile(true);
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      window.alert('Digite seu nome.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const { data } = await api.patch('/auth/me', { name: name.trim(), phone: phone.trim() || undefined });
      updateUser(data);
      setIsEditingProfile(false);
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível salvar.'));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSavePassword() {
    if (!currentPassword || !newPassword) {
      window.alert('Preencha a senha atual e a nova senha.');
      return;
    }
    if (newPassword.length < 8) {
      window.alert('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      window.alert('A confirmação não é igual à nova senha.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      window.alert('Sua senha foi alterada.');
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível trocar a senha.'));
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleLogout() {
    if (window.confirm('Sair da conta? Você vai precisar entrar de novo para fazer pedidos.')) {
      logout();
      navigate('/');
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Meu perfil</h1>

      <Card>
        {!isEditingProfile ? (
          <>
            <Field label="Nome" value={user?.name} />
            <Field label="E-mail" value={user?.email} />
            <Field label="Celular" value={user?.phone || 'Não informado'} />
            <LinkButton onClick={openEditProfile}>Editar perfil</LinkButton>
          </>
        ) : (
          <>
            <FieldLabel>Nome</FieldLabel>
            <Input value={name} onChange={setName} />
            <FieldLabel>Celular</FieldLabel>
            <Input value={phone} onChange={setPhone} placeholder="Ex: 11999998888" />
            <PrimaryButton onClick={handleSaveProfile} loading={isSavingProfile} style={{ marginTop: 10 }}>
              Salvar
            </PrimaryButton>
            <LinkButton onClick={() => setIsEditingProfile(false)} muted>
              Cancelar
            </LinkButton>
          </>
        )}
      </Card>

      <Link to="/perfil/enderecos" style={menuItemStyle}>
        <span style={{ fontWeight: 700 }}>Meus endereços</span>
        <span>›</span>
      </Link>

      {!isChangingPassword ? (
        <div onClick={() => setIsChangingPassword(true)} style={{ ...menuItemStyle, cursor: 'pointer' }}>
          <span style={{ fontWeight: 700 }}>Trocar senha</span>
          <span>›</span>
        </div>
      ) : (
        <Card>
          <FieldLabel>Senha atual</FieldLabel>
          <Input value={currentPassword} onChange={setCurrentPassword} type="password" />
          <FieldLabel>Nova senha</FieldLabel>
          <Input value={newPassword} onChange={setNewPassword} type="password" placeholder="Mínimo 8 caracteres" />
          <FieldLabel>Confirmar nova senha</FieldLabel>
          <Input value={confirmNewPassword} onChange={setConfirmNewPassword} type="password" />
          <PrimaryButton onClick={handleSavePassword} loading={isSavingPassword} style={{ marginTop: 10 }}>
            Salvar nova senha
          </PrimaryButton>
          <LinkButton onClick={() => setIsChangingPassword(false)} muted>
            Cancelar
          </LinkButton>
        </Card>
      )}

      <PrimaryButton onClick={handleLogout} variant="outline" style={{ marginTop: 8 }}>
        Sair da conta
      </PrimaryButton>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: colors.surface, borderRadius: 14, border: `1px solid ${colors.border}`, padding: 16, marginBottom: 16 }}>{children}</div>;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 16, color: colors.text, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginTop: 10, marginBottom: 4 }}>{children}</label>;
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', height: 42, borderRadius: 10, border: `1px solid ${colors.border}`, paddingLeft: 12, fontSize: 14, boxSizing: 'border-box' }}
    />
  );
}

function LinkButton({ children, onClick, muted }: { children: React.ReactNode; onClick: () => void; muted?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ display: 'block', border: 'none', background: 'none', color: muted ? colors.textMuted : colors.primaryDark, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 12, padding: 0 }}
    >
      {children}
    </button>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: colors.surface,
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  padding: 16,
  marginBottom: 16,
  textDecoration: 'none',
  color: colors.text,
};
