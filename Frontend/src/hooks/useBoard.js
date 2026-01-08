import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const fetchBoard = async (boardId) => {
    const res = await api.get(`/boards/${boardId}`);
    return res.data.data.board;
};

const useBoard = (boardId) => {
    return useQuery({
        queryKey: ['board', boardId],
        queryFn: () => fetchBoard(boardId),
        enabled: !!boardId,
        staleTime: 1 * 60 * 1000, // 1 minuto
    });
};

export default useBoard;