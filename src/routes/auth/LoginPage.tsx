import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import styles from './LoginPage.module.css';

// Schema de validação do formulário de Login
const loginSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(1, 'Insira sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isForgotOpen, setIsForgotOpen] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setLoginError(null);
    try {
      const user = await login(data.email, data.password, rememberMe);
      if (user.onboarding_completo) {
        navigate('/hoje');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h2 className={styles.title}>Entrar no AICan</h2>
        <p className={styles.subtitle}>Acesse sua conta para visualizar seus planos de treino e nutrição.</p>
      </div>

      {loginError && (
        <div className={styles.errorAlert} role="alert">
          {loginError}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
          label="Senha"
          placeholder="Sua senha"
          error={errors.password?.message}
          leftIcon={<Lock size={16} />}
          rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          onRightIconClick={() => setShowPassword(!showPassword)}
          disabled={loading}
        />

        <div className={styles.forgotArea}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            Lembrar conexão
          </label>
          <button
            type="button"
            className={styles.forgotLink}
            onClick={() => setIsForgotOpen(true)}
            disabled={loading}
          >
            Esqueci a senha
          </button>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={loading} rightIcon={<ArrowRight size={16} />}>
          Entrar
        </Button>
      </form>

      <div className={styles.footer}>
        Não tem uma conta?{' '}
        <Link to="/registro" className={styles.registerLink}>
          Cadastre-se
        </Link>
      </div>

      {/* Modal explicativo do Esqueci a Senha */}
      <Modal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Recuperação de Senha"
        footer={
          <Button onClick={() => setIsForgotOpen(false)} variant="secondary" size="sm">
            Entendido
          </Button>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
          Para fins do MVP v1, a redefinição autônoma de senha ainda não está implementada.
          Caso tenha esquecido sua senha, crie uma nova conta ou entre em contato com nosso suporte.
        </p>
      </Modal>
    </div>
  );
};
export default LoginPage;
