import { Link } from "react-router-dom";

const WorkspaceCard = ({ workspace }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{workspace.name}</h3>
      <p className="text-gray-600 mb-4">
        {workspace.description || "Sin descripción"}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Creado por: {workspace.createdBy?.name || "Desconocido"}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Privado: {workspace.isPrivate ? "Sí" : "No"}
      </p>
      <Link
        to={`/workspaces/${workspace._id}`}
        className="text-blue-600 hover:underline font-medium"
      >
        Ver boards →
      </Link>
    </div>
  );
};

export default WorkspaceCard;
