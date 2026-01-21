import { useQuery } from '@tanstack/react-query';
import boardHooks from './useBoard';

const useBoardTags = (boardId, columnIndex) => {
    const { useBoard } = boardHooks;
    const { data: board } = useBoard(boardId);

    return useQuery({
        queryKey: ['boardTags', boardId, columnIndex],
        queryFn: () => {
            if (!board) return [];
            // Extraer todos los tags usados en esa columna
            const tagsSet = new Set();
            board.items.forEach(item => {
                const cellValue = item.values.get(columnIndex.toString());
                if (Array.isArray(cellValue)) {
                    cellValue.forEach(tag => {
                        if (tag?.name) tagsSet.add(JSON.stringify({ name: tag.name, color: tag.color }));
                    });
                }
            });
            return Array.from(tagsSet).map(str => JSON.parse(str));
        },
        enabled: !!board && columnIndex !== undefined,
        staleTime: 2 * 60 * 1000,
    });
};

export default useBoardTags;