import { useState } from "react";
import useWorkspaces from "../hooks/useWorkspaces";
import WorkspaceCard from "../components/dashboard/WorkspaceCard";
import CreateWorkspaceModal from "../components/common/CreateWorkspaceModal";
import { toast } from "react-toastify";

const DashboardPage = () => {
  const { data: workspaces = [], isLoading, error, refetch } = useWorkspaces();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSuccess = () => {
    refetch(); // Recargar lista
    toast.success("Workspace creado");
  };

  if (isLoading)
    return <div className="text-center p-8">Cargando workspaces...</div>;
  if (error)
    return (
      <div className="text-center p-8 text-red-500">Error: {error.message}</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Workspaces</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Crear Workspace
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">No tienes workspaces aún</p>
            <p className="mt-2 text-gray-500">
              Crea uno para empezar a organizar tus boards
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <WorkspaceCard key={ws._id} workspace={ws} />
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default DashboardPage;
