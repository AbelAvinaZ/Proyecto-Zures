import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const fetchUsersForSelect = async () => {
    const res = await api.get('/users');
    const allUsers = res.data.data.users || [];

    // Filtrar: activos, email verificado, rol mayor a UNREGISTERED
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
        avatar: user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=random&size=128',
    }));
};

const useUsersForSelect = () => {
    return useQuery({
        queryKey: ['usersForSelect'],
        queryFn: fetchUsersForSelect,
        staleTime: 10 * 60 * 1000, // 10 minutos
        select: (data) => data || [],
    });
};

export default useUsersForSelect;