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
        mutationFn: (columnIndex) => removeColumn(boardId, columnIndex),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
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
        mutationFn: ({ itemIndex, columnIndex, value }) => updateItemCell(boardId, itemIndex, columnIndex, value),
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