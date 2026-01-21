import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../api';

const fetchUsersForSelect = async () => {
    const res = await getAllUsers();
    const allUsers = res || [];

    // Filtrar: activos, verificados, rol > UNREGISTERED
    const filtered = allUsers.filter(user =>
        user.isActive === true &&
        user.emailVerified === true &&
        user.role !== 'UNREGISTERED'
    );

    // Formato para react-select
    return filtered.map(user => ({
        value: user.id,
        label: user.name,
        email: user.email,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`,
    }));
};

const useDynamicCellData = (type) => {
    const usersQuery = useQuery({
        queryKey: ['dynamicData', 'USER'],
        queryFn: fetchUsersForSelect,
        staleTime: 10 * 60 * 1000, // 10 minutos
        enabled: type === 'USER',
        select: (data) => data || [],
    });

    // Puedes agregar más tipos aquí en el futuro
    switch (type) {
        case 'USER':
            return usersQuery;

        default:
            return { data: [], isLoading: false, error: null };
    }
};

export default useDynamicCellData;