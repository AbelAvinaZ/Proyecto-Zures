import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBoard, addColumn, removeColumn, createItem, updateItemCell } from '../api';

const useBoard = (boardId) => {
    return useQuery({
        queryKey: ['board', boardId],
        queryFn: () => getBoard(boardId),
        enabled: !!boardId,
    });
};

const useAddColumn = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (columnData) => addColumn(boardId, columnData),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
    });
};

const useRemoveColumn = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (columnId) => removeColumn(boardId, columnId),
        onSuccess: () => queryClient.invalidateQueries(['board', boardId]),
    });
};

const useCreateItem = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (values) => createItem(boardId, values),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
    });
};

const useUpdateItemCell = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemIndex, columnId, value }) => updateItemCell(boardId, itemIndex, columnId, value),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
    });
};

export default {
    useBoard,
    useAddColumn,
    useRemoveColumn,
    useCreateItem,
    useUpdateItemCell,
};