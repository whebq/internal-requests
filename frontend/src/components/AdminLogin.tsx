import { useState, type FormEvent } from "react";

interface AdminLoginProps {
  isAdmin: boolean;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => void;
}

export function AdminLogin({ isAdmin, onLogin, onLogout }: AdminLoginProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(username, password);
      setPassword("");
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="panel admin-panel">
        <span>Администратор</span>
        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>
    );
  }

  return (
    <form className="panel admin-panel" onSubmit={(event) => void handleSubmit(event)}>
      <h2>Вход администратора</h2>
      <label>
        Логин
        <input value={username} onChange={(event) => setUsername(event.target.value)} disabled={loading} />
      </label>
      <label>
        Пароль
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        Войти
      </button>
    </form>
  );
}
