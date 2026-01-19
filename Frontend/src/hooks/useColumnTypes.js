import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const fetchColumnTypes = async () => {
    const res = await api.get('/boards/column-types');
    return res.data.data.columnTypes;
};

const useColumnTypes = () => {
    return useQuery({
        queryKey: ['columnTypes'],
        queryFn: fetchColumnTypes,
        staleTime: Infinity,
    });
};

export default useColumnTypes;