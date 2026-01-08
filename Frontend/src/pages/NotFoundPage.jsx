const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
        <p className="text-lg">Lo sentimos, la página que buscas no existe.</p>
        <a href="/dashboard" className="text-blue-500">
          Volver al dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
