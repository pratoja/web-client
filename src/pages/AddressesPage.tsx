import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { api, extractApiErrorMessage } from '../config/api';
import { PrimaryButton } from '../components/PrimaryButton';
import { Address } from '../types/checkout';

const FALLBACK_LAT = -23.5505;
const FALLBACK_LNG = -46.6333;

const EMPTY_FORM = { label: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' };

export function AddressesPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [capturedLat, setCapturedLat] = useState<number | null>(null);
  const [capturedLng, setCapturedLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  async function loadAddresses() {
    setIsLoading(true);
    try {
      const { data } = await api.get<Address[]>('/addresses');
      setAddresses(data);
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível carregar seus endereços.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function openNewForm() {
    setEditingAddressId(null);
    setForm(EMPTY_FORM);
    setCapturedLat(null);
    setCapturedLng(null);
    setLocationMessage('');
    setShowForm(true);
  }

  function openEditForm(address: Address) {
    setEditingAddressId(address.id);
    setForm({
      label: address.label ?? '',
      street: address.street,
      number: address.number,
      complement: address.complement ?? '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });
    setCapturedLat(null);
    setCapturedLng(null);
    setLocationMessage('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingAddressId(null);
    setForm(EMPTY_FORM);
  }

  function handleUseMyLocation() {
    setLocationMessage('');
    if (!navigator.geolocation) {
      setLocationMessage('Seu navegador não tem suporte a localização.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCapturedLat(position.coords.latitude);
        setCapturedLng(position.coords.longitude);
        setLocationMessage('📍 Localização capturada com sucesso.');
        setIsLocating(false);
      },
      () => {
        setLocationMessage('Não foi possível obter sua localização agora.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function updateForm<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    const cleanZip = form.zipCode.replace(/\D/g, '');
    if (!form.street.trim() || !form.number.trim() || !form.neighborhood.trim() || !form.city.trim() || !form.state.trim()) {
      window.alert('Preencha rua, número, bairro, cidade e estado.');
      return;
    }
    if (form.state.trim().length !== 2) {
      window.alert('Digite a sigla do estado com 2 letras (ex: SP).');
      return;
    }
    if (cleanZip.length !== 8) {
      window.alert('O CEP deve ter 8 números.');
      return;
    }

    const payload = {
      label: form.label.trim() || undefined,
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim() || undefined,
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      zipCode: cleanZip,
    };

    setIsSaving(true);
    try {
      if (editingAddressId) {
        const editPayload = capturedLat != null && capturedLng != null ? { ...payload, lat: capturedLat, lng: capturedLng } : payload;
        const { data } = await api.patch<Address>(`/addresses/${editingAddressId}`, editPayload);
        setAddresses((current) => current.map((item) => (item.id === data.id ? data : item)));
      } else {
        const { data } = await api.post<Address>('/addresses', {
          ...payload,
          lat: capturedLat ?? FALLBACK_LAT,
          lng: capturedLng ?? FALLBACK_LNG,
          isDefault: addresses.length === 0,
        });
        setAddresses((current) => [data, ...current]);
      }
      closeForm();
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível salvar.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSetDefault(address: Address) {
    if (address.isDefault) return;
    setBusyAddressId(address.id);
    try {
      const { data } = await api.patch<Address>(`/addresses/${address.id}`, { isDefault: true });
      setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === data.id })));
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível definir como padrão.'));
    } finally {
      setBusyAddressId(null);
    }
  }

  async function handleDelete(address: Address) {
    if (!window.confirm(`Tem certeza que quer excluir "${address.label || address.street}"?`)) return;
    setBusyAddressId(address.id);
    try {
      await api.delete(`/addresses/${address.id}`);
      setAddresses((current) => current.filter((item) => item.id !== address.id));
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível excluir o endereço.'));
    } finally {
      setBusyAddressId(null);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 60px' }}>
      <button type="button" onClick={() => navigate('/perfil')} style={{ background: 'none', border: 'none', color: colors.primaryDark, fontWeight: 700, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
        ‹ Voltar
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Meus endereços</h1>

      {isLoading ? (
        <p style={{ color: colors.textMuted }}>Carregando...</p>
      ) : (
        <>
          {addresses.length === 0 ? (
            <p style={{ color: colors.textMuted }}>Você ainda não tem nenhum endereço salvo.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} style={{ backgroundColor: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{address.label || 'Endereço'}</strong>
                  {address.isDefault ? (
                    <span style={{ backgroundColor: colors.primary, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>Padrão</span>
                  ) : null}
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                  {address.street}, {address.number}
                  {address.complement ? ` - ${address.complement}` : ''}
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted }}>
                  {address.neighborhood} · {address.city}/{address.state}
                </div>

                {busyAddressId === address.id ? (
                  <span style={{ fontSize: 13, color: colors.textMuted }}>Aguarde...</span>
                ) : (
                  <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                    {!address.isDefault ? (
                      <button type="button" onClick={() => handleSetDefault(address)} style={linkStyle}>
                        Definir como padrão
                      </button>
                    ) : null}
                    <button type="button" onClick={() => openEditForm(address)} style={linkStyle}>
                      Editar
                    </button>
                    <button type="button" onClick={() => handleDelete(address)} style={{ ...linkStyle, color: colors.danger }}>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {!showForm ? (
            <button type="button" onClick={openNewForm} style={{ border: 'none', background: 'none', color: colors.primaryDark, fontWeight: 700, cursor: 'pointer', padding: '10px 0' }}>
              + Adicionar novo endereço
            </button>
          ) : (
            <div style={{ backgroundColor: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 14 }}>
              <strong>{editingAddressId ? 'Editar endereço' : 'Novo endereço'}</strong>
              <FieldInput label="Nome do endereço" value={form.label} onChange={(v) => updateForm('label', v)} placeholder="Ex: Casa, Trabalho" />
              <FieldInput label="Rua" value={form.street} onChange={(v) => updateForm('street', v)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 100 }}>
                  <FieldInput label="Número" value={form.number} onChange={(v) => updateForm('number', v)} />
                </div>
                <div style={{ flex: 1 }}>
                  <FieldInput label="Complemento" value={form.complement} onChange={(v) => updateForm('complement', v)} />
                </div>
              </div>
              <FieldInput label="Bairro" value={form.neighborhood} onChange={(v) => updateForm('neighborhood', v)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <FieldInput label="Cidade" value={form.city} onChange={(v) => updateForm('city', v)} />
                </div>
                <div style={{ width: 80 }}>
                  <FieldInput label="UF" value={form.state} onChange={(v) => updateForm('state', v.toUpperCase())} maxLength={2} />
                </div>
              </div>
              <FieldInput label="CEP" value={form.zipCode} onChange={(v) => updateForm('zipCode', v)} maxLength={9} />

              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                style={{ width: '100%', border: `1px solid ${colors.primary}`, borderRadius: 10, padding: 10, background: 'none', color: colors.primaryDark, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 10, marginBottom: 6 }}
              >
                {isLocating ? 'Localizando...' : '📍 Usar minha localização atual'}
              </button>
              {locationMessage ? <p style={{ fontSize: 12, color: colors.textMuted }}>{locationMessage}</p> : null}

              <PrimaryButton onClick={handleSave} loading={isSaving} style={{ marginTop: 8 }}>
                {editingAddressId ? 'Salvar alterações' : 'Salvar endereço'}
              </PrimaryButton>
              <button type="button" onClick={closeForm} style={{ width: '100%', border: 'none', background: 'none', color: colors.textMuted, fontWeight: 600, marginTop: 10, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, maxLength }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ width: '100%', borderRadius: 10, border: `1px solid ${colors.border}`, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }}
      />
    </div>
  );
}

const linkStyle: React.CSSProperties = { border: 'none', background: 'none', color: colors.primaryDark, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 };
