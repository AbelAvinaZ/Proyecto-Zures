import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const fetchWorkspaces = async () => {
    const res = await api.get('/workspaces');
    return res.data.data.workspaces;
};

const useWorkspaces = () => {
    return useQuery({
        queryKey: ['workspaces'],
        queryFn: fetchWorkspaces,
        staleTime: 5 * 60 * 1000, // 5 minutos de cache
    });
};

export default useWorkspaces;