import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    const role = params.get("role");
    const token = params.get("token");

    if (token) {
      // Si viene token directo, lo verificamos con el backend
      const verify = async () => {
        try {
          await api.get(`/auth/verify-email?token=${token}`);
          toast.success(
            "¡Correo verificado correctamente! Ahora puedes iniciar sesión."
          );
          navigate("/login?verified=true", { replace: true });
        } catch (err) {
          console.error(err);
          toast.error("Token inválido o expirado");
          navigate("/login", { replace: true });
        }
      };
      verify();
      return;
    }

    if (verified === "true") {
      toast.success(
        "¡Correo verificado correctamente! Ahora puedes iniciar sesión.",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );

      if (role === "MASTER") {
        toast.info(
          "¡Felicidades! Eres el primer usuario verificado y has sido promovido a MASTER."
        );
      }
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        <LoginForm />
        <p className="mt-4 text-center">
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </p>
        <p className="mt-2 text-center">
          <a href="/register" className="text-blue-500 hover:underline">
            ¿No tienes cuenta? Regístrate
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
