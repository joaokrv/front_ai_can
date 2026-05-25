import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  LogOut, 
  Trash2, 
  Key, 
  ShieldAlert, 
  CheckCircle,
  Pencil
} from 'lucide-react';

import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import type { UserProfile } from '../../stores/authStore';
import { DaySelector } from '../../components/forms/DaySelector';
import type { DiaSemana } from '../../components/forms/DaySelector';
import { DurationSlider } from '../../components/forms/DurationSlider';
import { TagChip } from '../../components/ui/TagChip';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import styles from './PerfilPage.module.css';
import { useToastStore } from '../../stores/toastStore';


// Schema para alteração de senha
const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Insira a senha atual'),
  new_password: z.string().min(10, 'A nova senha deve conter no mínimo 10 caracteres')
    .regex(/[A-Z]/, 'A nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A nova senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A nova senha deve conter pelo menos um caractere especial'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password']
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

interface SessionItem {
  id: string;
  ip_address: string;
  user_agent: string;
  is_current: boolean;
  last_activity: string;
}

const RESTRICOES_LIST = [
  { key: 'vegano', label: 'Vegano' },
  { key: 'vegetariano', label: 'Vegetariano' },
  { key: 'sem_lactose', label: 'Sem Lactose' },
  { key: 'sem_gluten', label: 'Sem Glúten' },
  { key: 'low_carb', label: 'Low Carb' },
  { key: 'cetogenica', label: 'Cetogênica' },
  { key: 'paleo', label: 'Paleo' },
  { key: 'sem_restricoes', label: 'Sem Restrições' }
];

export const PerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const addToast = useToastStore(state => state.addToast);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [sessions, setSessions] = React.useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Estados para edição de dados físicos
  const [isEditingFisico, setIsEditingFisico] = React.useState(false);
  const [isSavingFisico, setIsSavingFisico] = React.useState(false);
  const [editFisicoValores, setEditFisicoValores] = React.useState({
    idade: 20,
    sexo: 'M',
    altura: 170,
    peso: 70
  });

  // Estados para edição de preferências de IA
  const [isEditingPreferencias, setIsEditingPreferencias] = React.useState(false);
  const [isSavingPreferencias, setIsSavingPreferencias] = React.useState(false);
  const [editPreferenciasValores, setEditPreferenciasValores] = React.useState({
    objetivo: 'hipertrofia',
    local_treino: 'academia',
    dias_disponiveis: [] as string[],
    duracao_sessao: 60,
    nivel_experiencia: 'intermediario'
  });

  // Estados para edição de restrições e saúde
  const [isEditingRestricoes, setIsEditingRestricoes] = React.useState(false);
  const [isSavingRestricoes, setIsSavingRestricoes] = React.useState(false);
  const [editRestricoesValores, setEditRestricoesValores] = React.useState({
    restricoes_alimentares: [] as string[],
    lesoes_cuidados: ''
  });

  // Funções para salvar dados no backend FastAPI via PUT /auth/me
  const handleSaveFisico = async () => {
    setIsSavingFisico(true);
    try {
      const updatedUser = await api.put<UserProfile>('/auth/me', {
        idade: Number(editFisicoValores.idade),
        sexo: editFisicoValores.sexo,
        altura: Number(editFisicoValores.altura),
        peso: Number(editFisicoValores.peso)
      });
      setUser(updatedUser);
      setIsEditingFisico(false);
      addToast('Dados físicos atualizados com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao atualizar dados físicos.', 'error');
    } finally {
      setIsSavingFisico(false);
    }
  };

  const handleSavePreferencias = async () => {
    setIsSavingPreferencias(true);
    try {
      const updatedUser = await api.put<UserProfile>('/auth/me', {
        objetivo: editPreferenciasValores.objetivo,
        local_treino: editPreferenciasValores.local_treino,
        dias_disponiveis: editPreferenciasValores.dias_disponiveis,
        duracao_sessao: Number(editPreferenciasValores.duracao_sessao),
        nivel_experiencia: editPreferenciasValores.nivel_experiencia
      });
      setUser(updatedUser);
      setIsEditingPreferencias(false);
      addToast('Preferências de treino atualizadas com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao atualizar preferências.', 'error');
    } finally {
      setIsSavingPreferencias(false);
    }
  };

  const handleSaveRestricoes = async () => {
    setIsSavingRestricoes(true);
    try {
      const updatedUser = await api.put<UserProfile>('/auth/me', {
        restricoes_alimentares: editRestricoesValores.restricoes_alimentares,
        lesoes_cuidados: editRestricoesValores.lesoes_cuidados
      });
      setUser(updatedUser);
      setIsEditingRestricoes(false);
      addToast('Restrições e dados de saúde atualizados!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao atualizar restrições e saúde.', 'error');
    } finally {
      setIsSavingRestricoes(false);
    }
  };

  // States de modais
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  
  // Senha para exclusão de conta
  const [deletePassword, setDeletePassword] = React.useState('');
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Senhas do modal de alteração de senha
  const [changeError, setChangeError] = React.useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = React.useState<string | null>(null);
  const [isChanging, setIsChanging] = React.useState(false);

  // React Hook Form para alteração de senha
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passErrors },
    reset: resetPasswordForm
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema)
  });

  const carregarDadosPerfil = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [uData, sData] = await Promise.all([
        api.get<UserProfile>('/auth/me'),
        api.get<SessionItem[]>('/auth/sessions')
      ]);
      setUser(uData);
      setSessions(sData);
    } catch (err) {
      // Falha não-crítica — carregamento inicial antes do perfil existir
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    carregarDadosPerfil();
  }, [carregarDadosPerfil]);

  // Logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Revoga sessão ativa individual
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      addToast('Dispositivo desconectado com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao desconectar dispositivo.', 'error');
    }
  };

  // Altera a senha do usuário
  const onChangePassword = async (data: ChangePasswordValues) => {
    setChangeError(null);
    setChangeSuccess(null);
    setIsChanging(true);
    try {
      await api.post('/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password
      });
      addToast('Senha alterada com sucesso! Outras sessões desconectadas.', 'success');
      setChangeSuccess('Senha alterada com sucesso! Todas as outras sessões foram revogadas.');
      resetPasswordForm();
      setIsPasswordModalOpen(false);
      // Recarrega sessões
      const sData = await api.get<SessionItem[]>('/auth/sessions');
      setSessions(sData);
    } catch (err: any) {
      addToast(err.message || 'Erro ao alterar senha. Verifique se a senha atual está correta.', 'error');
      setChangeError(err.message || 'Falha ao alterar senha. Verifique se a senha atual está correta.');
    } finally {
      setIsChanging(false);
    }
  };

  // Exclui a conta permanentemente
  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await api.request('/auth/me', {
        method: 'DELETE',
        bodyData: { password: deletePassword }
      });
      
      addToast('Sua conta foi excluída permanentemente. Sentiremos sua falta!', 'info');
      // Limpa dados locais e vai para o login
      sessionStorage.clear();
      localStorage.clear();
      navigate('/login');
    } catch (err: any) {
      addToast(err.message || 'Senha incorreta. Não foi possível deletar a conta.', 'error');
      setDeleteError(err.message || 'Senha incorreta. Não foi possível deletar a conta.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calcula o IMC e classificação correspondente
  const getIMCInfo = (w?: number, h?: number) => {
    if (!w || !h) return { imc: '—', label: 'Dados incompletos', color: 'var(--text-muted)' };
    const hM = h / 100;
    const imc = w / (hM * hM);
    
    let label = 'Peso Normal';
    let color = 'var(--accent-primary)';
    
    if (imc < 18.5) {
      label = 'Abaixo do peso';
      color = '#FFD400';
    } else if (imc >= 25 && imc < 30) {
      label = 'Sobrepeso';
      color = '#FF9E00';
    } else if (imc >= 30) {
      label = 'Obesidade';
      color = 'var(--feedback-negative)';
    }

    return { imc: imc.toFixed(1), label, color };
  };

  const imcDetails = getIMCInfo(user?.peso, user?.altura);

  const getInitials = (name?: string) => {
    if (!name) return 'JV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Skeleton variant="custom" height={100} />
        <Skeleton variant="custom" height={400} />
      </div>
    );
  }

  // Abas do perfil
  const tabItems = [
    {
      id: 'fisico',
      label: 'Dados Físicos',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!isEditingFisico ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditFisicoValores({
                    idade: user?.idade || 20,
                    sexo: user?.sexo || 'M',
                    altura: user?.altura || 170,
                    peso: user?.peso || 70
                  });
                  setIsEditingFisico(true);
                }}
                leftIcon={<Pencil size={12} />}
              >
                Editar Dados
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingFisico(false)}
                  disabled={isSavingFisico}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveFisico}
                  isLoading={isSavingFisico}
                >
                  Confirmar
                </Button>
              </div>
            )}
          </div>

          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Idade</span>
              {isEditingFisico ? (
                <input
                  type="number"
                  min="11"
                  max="110"
                  className={styles.editInput}
                  value={editFisicoValores.idade}
                  onChange={e => setEditFisicoValores(prev => ({ ...prev, idade: Number(e.target.value) }))}
                />
              ) : (
                <span className={styles.dataValue}>{user?.idade} anos</span>
              )}
            </div>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Sexo Biológico</span>
              {isEditingFisico ? (
                <select
                  className={styles.editSelect}
                  value={editFisicoValores.sexo}
                  onChange={e => setEditFisicoValores(prev => ({ ...prev, sexo: e.target.value }))}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              ) : (
                <span className={styles.dataValue}>
                  {user?.sexo === 'M' ? 'Masculino' : user?.sexo === 'F' ? 'Feminino' : 'Outro'}
                </span>
              )}
            </div>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Altura</span>
              {isEditingFisico ? (
                <input
                  type="number"
                  min="50"
                  max="300"
                  className={styles.editInput}
                  value={editFisicoValores.altura}
                  onChange={e => setEditFisicoValores(prev => ({ ...prev, altura: Number(e.target.value) }))}
                />
              ) : (
                <span className={styles.dataValue}>{user?.altura} cm</span>
              )}
            </div>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Peso Atual</span>
              {isEditingFisico ? (
                <input
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  className={styles.editInput}
                  value={editFisicoValores.peso}
                  onChange={e => setEditFisicoValores(prev => ({ ...prev, peso: Number(e.target.value) }))}
                />
              ) : (
                <span className={styles.dataValue}>{user?.peso} kg</span>
              )}
            </div>
            <div className={styles.dataItem} style={{ gridColumn: 'span 2' }}>
              <span className={styles.dataLabel}>Índice de Massa Corporal (IMC)</span>
              <div className={styles.dataValue} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{imcDetails.imc} kg/m²</span>
                <Badge variant={imcDetails.imc !== '—' && Number(imcDetails.imc) >= 18.5 && Number(imcDetails.imc) < 25 ? 'active' : 'default'} style={{ backgroundColor: imcDetails.color, color: '#000000' }}>
                  {imcDetails.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'preferencias',
      label: 'Preferências IA',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!isEditingPreferencias ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditPreferenciasValores({
                    objetivo: user?.objetivo || 'hipertrofia',
                    local_treino: user?.local_treino || 'academia',
                    dias_disponiveis: user?.dias_disponiveis || [],
                    duracao_sessao: user?.duracao_sessao || 60,
                    nivel_experiencia: user?.nivel_experiencia || 'intermediario'
                  });
                  setIsEditingPreferencias(true);
                }}
                leftIcon={<Pencil size={12} />}
              >
                Editar Preferências
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingPreferencias(false)}
                  disabled={isSavingPreferencias}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSavePreferencias}
                  isLoading={isSavingPreferencias}
                >
                  Confirmar
                </Button>
              </div>
            )}
          </div>

          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Objetivo Principal</span>
              {isEditingPreferencias ? (
                <select
                  className={styles.editSelect}
                  value={editPreferenciasValores.objetivo}
                  onChange={e => setEditPreferenciasValores(prev => ({ ...prev, objetivo: e.target.value }))}
                >
                  <option value="emagrecimento">Emagrecimento</option>
                  <option value="hipertrofia">Hipertrofia</option>
                  <option value="resistencia">Resistência</option>
                  <option value="saude">Saúde & Bem Estar</option>
                </select>
              ) : (
                <span className={styles.dataValue} style={{ textTransform: 'capitalize' }}>{user?.objetivo}</span>
              )}
            </div>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Local de Treino</span>
              {isEditingPreferencias ? (
                <select
                  className={styles.editSelect}
                  value={editPreferenciasValores.local_treino}
                  onChange={e => setEditPreferenciasValores(prev => ({ ...prev, local_treino: e.target.value }))}
                >
                  <option value="academia">Academia</option>
                  <option value="casa">Em Casa</option>
                  <option value="arLivre">Ao Ar Livre</option>
                </select>
              ) : (
                <span className={styles.dataValue} style={{ textTransform: 'capitalize' }}>
                  {user?.local_treino === 'arLivre' ? 'Ao Ar Livre' : user?.local_treino}
                </span>
              )}
            </div>
            <div className={styles.dataItem} style={{ gridColumn: 'span 2' }}>
              <DaySelector
                label={isEditingPreferencias ? "Dias disponíveis para treino" : "Dias disponíveis para treino (somente leitura)"}
                selectedDays={(isEditingPreferencias ? editPreferenciasValores.dias_disponiveis : (user?.dias_disponiveis || [])) as DiaSemana[]}
                onChange={days => setEditPreferenciasValores(prev => ({ ...prev, dias_disponiveis: days }))}
                readonly={!isEditingPreferencias}
              />
            </div>
            <div className={styles.dataItem}>
              <DurationSlider
                label="Duração programada do treino"
                value={isEditingPreferencias ? editPreferenciasValores.duracao_sessao : (user?.duracao_sessao || 60)}
                onChange={val => setEditPreferenciasValores(prev => ({ ...prev, duracao_sessao: val }))}
                disabled={!isEditingPreferencias}
              />
            </div>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Nível de Experiência</span>
              {isEditingPreferencias ? (
                <select
                  className={styles.editSelect}
                  value={editPreferenciasValores.nivel_experiencia}
                  onChange={e => setEditPreferenciasValores(prev => ({ ...prev, nivel_experiencia: e.target.value }))}
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              ) : (
                <span className={styles.dataValue} style={{ textTransform: 'capitalize' }}>{user?.nivel_experiencia}</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'restricoes',
      label: 'Restrições & Saúde',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!isEditingRestricoes ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditRestricoesValores({
                    restricoes_alimentares: user?.restricoes_alimentares || [],
                    lesoes_cuidados: user?.lesoes_cuidados || ''
                  });
                  setIsEditingRestricoes(true);
                }}
                leftIcon={<Pencil size={12} />}
              >
                Editar Restrições
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingRestricoes(false)}
                  disabled={isSavingRestricoes}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveRestricoes}
                  isLoading={isSavingRestricoes}
                >
                  Confirmar
                </Button>
              </div>
            )}
          </div>

          <div className={styles.dataGrid}>
            <div className={styles.dataItem} style={{ gridColumn: 'span 2' }}>
              <span className={styles.dataLabel}>Restrições Alimentares</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {isEditingRestricoes ? (
                  RESTRICOES_LIST.map(item => {
                    const isSelected = editRestricoesValores.restricoes_alimentares.includes(item.key);
                    return (
                      <TagChip
                        key={item.key}
                        active={isSelected}
                        onClick={() => {
                          setEditRestricoesValores(prev => {
                            const list = prev.restricoes_alimentares.includes(item.key)
                              ? prev.restricoes_alimentares.filter(k => k !== item.key)
                              : [...prev.restricoes_alimentares, item.key];
                            return { ...prev, restricoes_alimentares: list };
                          });
                        }}
                      >
                        {item.label}
                      </TagChip>
                    );
                  })
                ) : (
                  user?.restricoes_alimentares && user.restricoes_alimentares.length > 0 ? (
                    user.restricoes_alimentares.map(r => {
                      const mapping = RESTRICOES_LIST.find(l => l.key === r);
                      return (
                        <TagChip key={r} readonly>
                          {mapping?.label || r}
                        </TagChip>
                      );
                    })
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma restrição alimentar cadastrada.</span>
                  )
                )}
              </div>
            </div>
            <div className={styles.dataItem} style={{ gridColumn: 'span 2' }}>
              <span className={styles.dataLabel}>Lesões ou Cuidados Especiais</span>
              {isEditingRestricoes ? (
                <textarea
                  className={styles.editTextarea}
                  value={editRestricoesValores.lesoes_cuidados}
                  onChange={e => setEditRestricoesValores(prev => ({ ...prev, lesoes_cuidados: e.target.value }))}
                  placeholder="Informe dores recorrentes, restrições articulares ou recomendações médicas..."
                />
              ) : (
                <div className={`${styles.dataValue} ${styles.textareaValue}`}>
                  {user?.lesoes_cuidados || 'Nenhuma restrição articular ou lesão relatada.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'seguranca',
      label: 'Sessões & Conta',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Alterar Senha Rápido */}
          <div className={styles.accountSection}>
            <h3 className={styles.accountTitle}>Segurança da Conta</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mantenha sua senha atualizada periodicamente.</span>
              <Button variant="secondary" size="sm" onClick={() => setIsPasswordModalOpen(true)} leftIcon={<Key size={12} />}>
                Alterar Senha
              </Button>
            </div>
          </div>

          {/* Sessões Ativas */}
          <div className={styles.accountSection}>
            <h3 className={styles.accountTitle}>Dispositivos Conectados</h3>
            <div className={styles.sessionsList}>
              {sessions.map(s => (
                <div key={s.id} className={styles.sessionItem}>
                  <div className={styles.sessionInfo}>
                    <span className={styles.sessionTitle}>
                      {s.ip_address} {s.is_current && <Badge variant="active">Dispositivo Atual</Badge>}
                    </span>
                    <span className={styles.sessionMeta}>{s.user_agent.substring(0, 70)}...</span>
                  </div>
                  {!s.is_current && (
                    <Button variant="danger" size="sm" onClick={() => handleRevokeSession(s.id)} style={{ padding: '0.375rem 0.625rem' }}>
                      Revogar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Perigo: Excluir Conta */}
          <div className={styles.accountSection} style={{ borderColor: 'rgba(255, 68, 68, 0.2)', backgroundColor: 'rgba(255,68,68,0.01)' }}>
            <h3 className={styles.accountTitle} style={{ color: 'var(--feedback-negative)', borderColor: 'rgba(255, 68, 68, 0.2)' }}>Zona de Perigo</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Excluir permanentemente sua conta e todos os dados associados.</span>
              <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)} leftIcon={<Trash2 size={12} />} style={{ backgroundColor: 'var(--feedback-negative)', color: '#FFF' }}>
                Excluir Conta
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'configuracoes',
      label: 'Configurações App',
      content: (
        <div className={styles.settingsGrid}>
          {/* Tema (Visual) */}
          <div className={styles.settingsCard}>
            <div className={styles.settingsCardLeft}>
              <span className={styles.settingsTitle}>Modo Escuro (Primary)</span>
              <p className={styles.settingsDesc}>Mantém a paleta de cores dark Obsidian para conforto visual e foco.</p>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" className={styles.toggleInput} checked disabled />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          {/* Apple Health */}
          <div className={styles.settingsCard}>
            <div className={styles.settingsCardLeft}>
              <span className={styles.settingsTitle}>Apple Health <Badge variant="default">Em breve</Badge></span>
              <p className={styles.settingsDesc}>Sincronizar calorias ativas, frequência cardíaca e peso automaticamente.</p>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" className={styles.toggleInput} disabled />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          {/* Strava */}
          <div className={styles.settingsCard}>
            <div className={styles.settingsCardLeft}>
              <span className={styles.settingsTitle}>Strava Integration <Badge variant="default">Em breve</Badge></span>
              <p className={styles.settingsDesc}>Importar treinos de corrida e ciclismo para enriquecer as sugestões nutricionais.</p>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" className={styles.toggleInput} disabled />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Minha Conta</h1>
        <div className={styles.btnGroup}>
          <Button variant="secondary" size="sm" onClick={handleLogout} leftIcon={<LogOut size={12} />}>
            Sair do App
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className={styles.userHeader}>
        <div className={styles.avatar}>{getInitials(user?.nome)}</div>
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>{user?.nome}</h2>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>
      </div>

      {/* Abas de Informações */}
      <Tabs tabs={tabItems} variant="accent" />

      {/* Modal de Alteração de Senha */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setChangeError(null);
          setChangeSuccess(null);
          resetPasswordForm();
        }}
        title="Alterar Senha"
      >
        <form onSubmit={handlePasswordSubmit(onChangePassword)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {changeError && <div className={styles.errorAlert}>{changeError}</div>}
          {changeSuccess && (
            <div style={{ backgroundColor: 'var(--accent-primary-muted)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={14} />
              {changeSuccess}
            </div>
          )}

          <Input
            {...regPassword('current_password')}
            type="password"
            autoComplete="current-password"
            label="Senha Atual"
            placeholder="Senha atual da conta"
            error={passErrors.current_password?.message}
            disabled={isChanging}
          />
          <Input
            {...regPassword('new_password')}
            type="password"
            autoComplete="new-password"
            label="Nova Senha"
            placeholder="Nova senha forte"
            error={passErrors.new_password?.message}
            disabled={isChanging}
          />
          <Input
            {...regPassword('confirm_password')}
            type="password"
            autoComplete="new-password"
            label="Confirmar Nova Senha"
            placeholder="Repita a nova senha"
            error={passErrors.confirm_password?.message}
            disabled={isChanging}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setChangeError(null);
                setChangeSuccess(null);
                resetPasswordForm();
              }}
              disabled={isChanging}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isChanging}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Exclusão de Conta */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletePassword('');
          setDeleteError(null);
        }}
        title="Confirmar Exclusão Definitiva"
        footer={
          <div className={styles.btnGroup}>
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="secondary" size="sm" disabled={isDeleting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteAccount} 
              variant="danger" 
              size="sm"
              isLoading={isDeleting}
              disabled={!deletePassword}
              style={{ backgroundColor: 'var(--feedback-negative)', color: '#FFF' }}
            >
              Excluir Definitivamente
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ShieldAlert size={28} style={{ color: 'var(--feedback-negative)', flexShrink: 0 }} />
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                Você está prestes a excluir sua conta do AICan!
              </p>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                Esta ação é definitiva e removerá seu perfil físico, preferências alimentares, histórico de treinos e feedbacks. 
                Para confirmar a exclusão, insira sua senha atual abaixo.
              </p>
            </div>
          </div>

          {deleteError && <div className={styles.errorAlert}>{deleteError}</div>}

          <Input
            type="password"
            autoComplete="current-password"
            label="Senha Atual"
            placeholder="Confirme sua senha para prosseguir"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            disabled={isDeleting}
          />
        </div>
      </Modal>

    </div>
  );
};
export default PerfilPage;
