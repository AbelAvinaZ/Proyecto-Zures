import useAuth from "../hooks/useAuth";
import ProfileEditForm from "../components/profile/ProfileEditForm";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <img
          src={user.avatar || "default-avatar.jpg"}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-4"
        />
        <p>
          <strong>Nombre:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Rol:</strong> {user.roleDisplay}
        </p>
        <p>
          <strong>Departamento:</strong> {user.department || "N/A"}
        </p>
        <p>
          <strong>Branch ID:</strong> {user.branchId || "N/A"}
        </p>
        <p>
          <strong>Activo:</strong> {user.isActive ? "Sí" : "No"}
        </p>
        <p>
          <strong>Verificado:</strong> {user.emailVerified ? "Sí" : "No"}
        </p>

        <h2 className="text-xl mt-6 mb-4">Editar Perfil</h2>
        <ProfileEditForm />
      </div>
    </div>
  );
};

export default ProfilePage;
