import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  Dumbbell, 
  Home, 
  Compass,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

import api from '../../lib/api';
import { DaySelector } from '../../components/forms/DaySelector';
import type { DiaSemana } from '../../components/forms/DaySelector';
import { DurationSlider } from '../../components/forms/DurationSlider';
import { TagChip } from '../../components/ui/TagChip';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from '../onboarding/OnboardingPage.module.css';

// Schema de validação do formulário com coerções numéricas
const preferencesSchema = z.object({
  idade: z.coerce.number().int().min(11, 'Idade mínima 11 anos').max(110, 'Idade máxima 110 anos'),
  altura: z.coerce.number().min(50, 'Altura mínima 50 cm').max(300, 'Altura máxima 300 cm'),
  peso: z.coerce.number().min(20, 'Peso mínimo 20 kg').max(300, 'Peso máximo 300 kg'),
  sexo: z.enum(['M', 'F', 'O', 'N']),
  objetivo: z.enum(['perder', 'ganhar', 'hipertrofia', 'definicao']),
  local_treino: z.enum(['academia', 'casa', 'arLivre']),
  dias_disponiveis: z.array(z.string()).min(1, 'Selecione pelo menos um dia disponível'),
  duracao_sessao: z.number().min(15).max(300),
  nivel_experiencia: z.enum(['iniciante', 'intermediario', 'avancado']),
  restricoes_alimentares: z.array(z.string()).default([]),
  lesoes_cuidados: z.string().max(500, 'Máximo de 500 caracteres para lesões').default(''),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

const RESTRICOES_MAPPING = [
  { key: 'vegano', label: 'Vegano' },
  { key: 'vegetariano', label: 'Vegetariano' },
  { key: 'sem_lactose', label: 'Sem Lactose' },
  { key: 'sem_gluten', label: 'Sem Glúten' },
  { key: 'low_carb', label: 'Low Carb' },
  { key: 'cetogenica', label: 'Cetogênica' },
  { key: 'paleo', label: 'Paleo' },
  { key: 'sem_restricoes', label: 'Sem Restrições' }
];

export const PreferenciasPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema) as any,
    defaultValues: {
      idade: undefined as any,
      altura: undefined as any,
      peso: undefined as any,
      sexo: 'M',
      objetivo: 'hipertrofia',
      local_treino: 'academia',
      dias_disponiveis: ['segunda', 'quarta', 'sexta'],
      duracao_sessao: 60,
      nivel_experiencia: 'intermediario',
      restricoes_alimentares: ['sem_restricoes'],
      lesoes_cuidados: '',
    },
  });

  const selectedObjetivo = watch('objetivo');
  const selectedLocal = watch('local_treino');
  const selectedNivel = watch('nivel_experiencia');
  const selectedRestricoes = watch('restricoes_alimentares');

  // Busca os dados físicos e preferências existentes do usuário para pré-preenchimento
  React.useEffect(() => {
    const carregarPerfilExistente = async () => {
      try {
        const dados = await api.get<any>('/auth/me');
        if (dados && dados.idade !== null) {
          const restricoesUI = (dados.restricoes_alimentares || []).map((r: string) => {
            if (r === 'lactose') return 'sem_lactose';
            if (r === 'gluten') return 'sem_gluten';
            return r;
          });
          
          if (restricoesUI.length === 0) {
            restricoesUI.push('sem_restricoes');
          }

          reset({
            idade: dados.idade,
            altura: dados.altura,
            peso: dados.peso,
            sexo: dados.sexo || 'M',
            objetivo: dados.objetivo || 'hipertrofia',
            local_treino: dados.local_treino || 'academia',
            dias_disponiveis: dados.dias_disponiveis || ['segunda', 'quarta', 'sexta'],
            duracao_sessao: dados.duracao_sessao || 60,
            nivel_experiencia: dados.nivel_experiencia || 'intermediario',
            restricoes_alimentares: restricoesUI,
            lesoes_cuidados: dados.lesoes_cuidados || '',
          });
        }
      } catch (err) {
        // Falha não-crítica — carregamento inicial antes do perfil existir
      }
    };

    carregarPerfilExistente();
  }, [reset]);

  const handleRestricaoToggle = (key: string) => {
    if (key === 'sem_restricoes') {
      setValue('restricoes_alimentares', ['sem_restricoes']);
      return;
    }

    let newList = selectedRestricoes.filter(r => r !== 'sem_restricoes');
    if (newList.includes(key)) {
      newList = newList.filter(r => r !== key);
      if (newList.length === 0) {
        newList = ['sem_restricoes'];
      }
    } else {
      newList = [...newList, key];
    }
    setValue('restricoes_alimentares', newList);
  };

  const onSubmit = async (data: PreferencesFormValues) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Usuário não autenticado.');
      }

      // Sanitiza e mapeia as restrições alimentares para o que o backend espera
      const restricoesSanitizadas = (data.restricoes_alimentares || [])
        .filter(r => r !== 'sem_restricoes')
        .map(r => {
          if (r === 'sem_lactose') return 'lactose';
          if (r === 'sem_gluten') return 'gluten';
          return r;
        });

      const payload = {
        ...data,
        restricoes_alimentares: restricoesSanitizadas,
      };

      // Salva os dados no endpoint PUT /auth/me do backend
      await api.put('/auth/me', payload);
      
      // Prossegue para a etapa de geração do plano
      navigate('/onboarding/geracao');
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar suas preferências. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ minHeight: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>
      <div className={styles.formArea} style={{ width: '100%', padding: 0 }}>
        <div className={styles.formWrapper} style={{ maxWidth: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Configurações do Plano</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Ajuste seus dados físicos e metas para que a IA do AICan recalcule sua rotina.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/hoje')}
              leftIcon={<ChevronLeft size={16} />}
            >
              Voltar ao Dashboard
            </Button>
          </div>

          {submitError && <div className={styles.errorAlert}>{submitError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            
            {/* Seção 1: Dados Físicos */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>1. Dados Físicos Básicos</h3>
                <p className={styles.sectionDesc}>Calculamos taxas de metabolismo e intensidade com base nessas informações.</p>
              </div>

              <div className={styles.physicalGrid}>
                <Input
                  {...register('idade')}
                  type="number"
                  label="Idade (anos)"
                  placeholder="Ex: 25"
                  error={errors.idade?.message}
                  disabled={loading}
                />

                <div className={styles.selectWrapper}>
                  <label htmlFor="sexo-select" className={styles.selectLabel}>Sexo Biológico</label>
                  <select
                    id="sexo-select"
                    className={styles.select}
                    {...register('sexo')}
                    disabled={loading}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                    <option value="N">Não Informar</option>
                  </select>
                </div>

                <Input
                  {...register('altura')}
                  type="number"
                  label="Altura (cm)"
                  placeholder="Ex: 175"
                  error={errors.altura?.message}
                  disabled={loading}
                />

                <Input
                  {...register('peso')}
                  type="number"
                  step="0.1"
                  label="Peso Atual (kg)"
                  placeholder="Ex: 75.4"
                  error={errors.peso?.message}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Seção 2: Objetivos */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>2. Qual seu objetivo principal?</h3>
                <p className={styles.sectionDesc}>Iremos orientar a IA para focar as calorias e os exercícios nesta meta.</p>
              </div>

              <div className={styles.optionGrid}>
                {[
                  { key: 'hipertrofia', title: 'Hipertrofia', desc: 'Ganho de massa muscular magra e força', icon: <TrendingUp size={20} /> },
                  { key: 'perder', title: 'Perda de Peso', desc: 'Queima de gordura e déficit calórico orientado', icon: <Flame size={20} /> },
                  { key: 'definicao', title: 'Definição Muscular', desc: 'Tonificação muscular com foco em simetria', icon: <Sparkles size={20} /> },
                  { key: 'ganhar', title: 'Ganho de Peso', desc: 'Superávit calórico para ganho de peso geral', icon: <Activity size={20} /> },
                ].map((obj) => (
                  <div
                    key={obj.key}
                    className={`${styles.optionCard} ${selectedObjetivo === obj.key ? styles.optionActive : ''}`}
                    onClick={() => setValue('objetivo', obj.key as any)}
                  >
                    <div className={styles.optionHeader}>
                      {obj.icon}
                    </div>
                    <span className={styles.optionTitle}>{obj.title}</span>
                    <p className={styles.optionDesc}>{obj.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção 3: Planejamento */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>3. Planejamento do Treino</h3>
                <p className={styles.sectionDesc}>Defina os locais de preferência e sua disponibilidade semanal.</p>
              </div>

              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Onde deseja treinar?</label>
                <div className={styles.optionGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {[
                    { key: 'academia', title: 'Academia', icon: <Dumbbell size={18} /> },
                    { key: 'casa', title: 'Em Casa', icon: <Home size={18} /> },
                    { key: 'arLivre', title: 'Ao Ar Livre', icon: <Compass size={18} /> }
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`${styles.optionCard} ${selectedLocal === item.key ? styles.optionActive : ''}`}
                      onClick={() => setValue('local_treino', item.key as any)}
                      style={{ padding: '1rem', textAlign: 'center', alignItems: 'center' }}
                    >
                      {item.icon}
                      <span className={styles.optionTitle} style={{ marginTop: '0.25rem' }}>{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Controller
                name="dias_disponiveis"
                control={control}
                render={({ field }) => (
                  <DaySelector
                    label="Dias disponíveis na semana"
                    selectedDays={field.value as DiaSemana[]}
                    onChange={(days) => field.onChange(days)}
                    readonly={loading}
                  />
                )}
              />
              {errors.dias_disponiveis && (
                <span className={styles.errorText}>{errors.dias_disponiveis.message}</span>
              )}

              <Controller
                name="duracao_sessao"
                control={control}
                render={({ field }) => (
                  <DurationSlider
                    label="Duração média da sessão de treino"
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    disabled={loading}
                  />
                )}
              />

              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Nível de Experiência Física</label>
                <div className={styles.optionGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {[
                    { key: 'iniciante', title: 'Iniciante', desc: 'Pouca prática' },
                    { key: 'intermediario', title: 'Intermediário', desc: '1 a 2 anos' },
                    { key: 'avancado', title: 'Avançado', desc: 'Mais de 2 anos' }
                  ].map((level) => (
                    <div
                      key={level.key}
                      className={`${styles.optionCard} ${selectedNivel === level.key ? styles.optionActive : ''}`}
                      onClick={() => setValue('nivel_experiencia', level.key as any)}
                      style={{ padding: '0.875rem', textAlign: 'center', alignItems: 'center' }}
                    >
                      <span className={styles.optionTitle}>{level.title}</span>
                      <span className={styles.optionDesc} style={{ fontSize: '0.625rem' }}>{level.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção 4: Nutrição e Saúde */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>4. Nutrição & Restrições de Saúde</h3>
                <p className={styles.sectionDesc}>Iremos personalizar as sugestões pré e pós-treino com base em suas intolerâncias e restrições físicas.</p>
              </div>

              <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Restrições Alimentares</label>
                <div className={styles.tagsContainer}>
                  {RESTRICOES_MAPPING.map((chip) => {
                    const isSelected = selectedRestricoes.includes(chip.key);
                    return (
                      <TagChip
                        key={chip.key}
                        active={isSelected}
                        onClick={() => handleRestricaoToggle(chip.key)}
                        readonly={loading}
                      >
                        {chip.label}
                      </TagChip>
                    );
                  })}
                </div>
              </div>

              <div className={styles.textareaWrapper}>
                <label htmlFor="lesoes" className={styles.selectLabel}>Lesões ou Cuidados Especiais (Opcional)</label>
                <textarea
                  id="lesoes"
                  className={styles.textarea}
                  placeholder="Ex: Hérnia de disco L4-L5, dor articular no joelho esquerdo..."
                  {...register('lesoes_cuidados')}
                  disabled={loading}
                />
                {errors.lesoes_cuidados && (
                  <span className={styles.errorText}>{errors.lesoes_cuidados.message}</span>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className={styles.actionsBar} style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/hoje')}
                disabled={loading}
              >
                Cancelar e Voltar
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                rightIcon={<ArrowRight size={16} />}
              >
                Salvar e Recalcular Plano
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
export default PreferenciasPage;
