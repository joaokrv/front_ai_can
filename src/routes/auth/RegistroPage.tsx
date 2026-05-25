import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './RegistroPage.module.css';

// Validação rígida de senha combinando as políticas do backend (mínimo 10 chars, maiúscula, minúscula, número, especial)
const registroSchema = z
  .object({
    nome: z
      .string()
      .min(3, 'O nome deve conter no mínimo 3 caracteres')
      .max(50, 'O nome deve conter no máximo 50 caracteres')
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/, 'O nome deve conter apenas letras e espaços'),
    email: z.string().email('Insira um e-mail válido'),
    password: z
      .string()
      .min(10, 'A senha deve conter no mínimo 10 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
    confirmPassword: z.string(),
    aceite_termos: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso e privacidade',
    }),

  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegistroFormValues = z.infer<typeof registroSchema>;

export const RegistroPage: React.FC = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [regError, setRegError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [passwordValue, setPasswordValue] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
      aceite_termos: false,
    },
  });

  // Calcula dinamicamente a força da senha para feedback visual
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', colorClass: '' };
    
    let score = 0;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      return { score, label: 'Senha Fraca', colorClass: styles.strengthWeak };
    } else if (score === 3) {
      return { score, label: 'Senha Média', colorClass: styles.strengthMedium };
    } else {
      return { score, label: 'Senha Forte', colorClass: styles.strengthStrong };
    }
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegistroFormValues) => {
    setLoading(true);
    setRegError(null);
    try {
      // Cria a conta
      await registerUser(data.nome, data.email, data.password, data.aceite_termos);
      
      // Efetua login automático imediato
      await login(data.email, data.password, true);
      
      // Redireciona para o preenchimento de dados de preferências do onboarding
      navigate('/onboarding');
    } catch (err: any) {
      setRegError(err.message || 'Ocorreu um erro no cadastro. Tente outro e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h2 className={styles.title}>Criar sua conta</h2>
        <p className={styles.subtitle}>
          Etapa 1 de 3 · Insira seus dados para iniciar seu perfil no AICan.
        </p>
      </div>

      {regError && (
        <div className={styles.errorAlert} role="alert">
          {regError}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('nome')}
          type="text"
          label="Nome Completo"
          placeholder="Seu nome"
          error={errors.nome?.message}
          leftIcon={<User size={16} />}
          disabled={loading}
        />

        <Input
          {...register('email')}
          type="email"
          label="E-mail"
          placeholder="exemplo@aican.com.br"
          error={errors.email?.message}
          leftIcon={<Mail size={16} />}
          disabled={loading}
        />

        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
          label="Senha"
          placeholder="Mínimo 10 caracteres"
          error={errors.password?.message}
          leftIcon={<Lock size={16} />}
          rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          disabled={loading}
          onChange={(e) => setPasswordValue(e.target.value)}
        />

        {/* Medidor de força de senha */}
        {passwordValue && (
          <div className={styles.passwordStrength}>
            <div className={styles.strengthBarContainer}>
              <div className={`${styles.strengthBar} ${strength.score >= 1 ? strength.colorClass : ''}`} />
              <div className={`${styles.strengthBar} ${strength.score >= 3 ? strength.colorClass : ''}`} />
              <div className={`${styles.strengthBar} ${strength.score >= 4 ? strength.colorClass : ''}`} />
            </div>
            <span className={styles.strengthText}>{strength.label}</span>
          </div>
        )}

        <Input
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
          label="Confirmar Senha"
          placeholder="Repita sua senha"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock size={16} />}
          rightIcon={showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={loading}
        />

        <div className={styles.termsArea}>
          <input
            type="checkbox"
            id="aceite_termos"
            className={styles.checkbox}
            {...register('aceite_termos')}
            disabled={loading}
          />
          <label htmlFor="aceite_termos" className={styles.termsLabel}>
            Eu aceito os{' '}
            <Link to="/termos-de-uso" target="_blank" className={styles.termsLink}>
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link to="/politica-de-privacidade" target="_blank" className={styles.termsLink}>
              Política de Privacidade
            </Link>{' '}
            do AICan.
          </label>
        </div>
        {errors.aceite_termos && (
          <span className={styles.errorAlert} style={{ marginTop: '-0.5rem', padding: '0.25rem 0.5rem' }}>
            {errors.aceite_termos.message}
          </span>
        )}

        <Button type="submit" variant="primary" fullWidth isLoading={loading} rightIcon={<ArrowRight size={16} />}>
          Continuar
        </Button>
      </form>

      <div className={styles.footer}>
        Já tem uma conta?{' '}
        <Link to="/login" className={styles.loginLink}>
          Entrar
        </Link>
      </div>
    </div>
  );
};
export default RegistroPage;
