import RegisterForm from "../components/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>
        <RegisterForm />
        <p className="mt-4 text-center">
          <a href="/login" className="text-blue-500 hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
