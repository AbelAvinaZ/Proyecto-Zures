import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createBoard,
    updateBoard,
    deactivateBoard,
    inviteToBoard,
    addColumn,
    removeColumn,
    createItem,
    updateItemCell,
    deleteItem,
    reorderColumns,
    reorderItems,
} from '../api';

const useCreateBoard = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBoard,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['workspaces']);
            queryClient.invalidateQueries(['boards', data.workspaceId]);
        },
    });
};

const useUpdateBoard = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => updateBoard(boardId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
    });
};

const useDeactivateBoard = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => deactivateBoard(boardId),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
    });
};

const useInviteToBoard = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => inviteToBoard(boardId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
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

const useReorderColumns = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderedIds) => reorderColumns(boardId, orderedIds),
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
        mutationFn: ({ itemIndex, columnIndex, value }) =>
            updateItemCell(boardId, itemIndex, columnIndex, value),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
    });
};

const useReorderItems = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderedIds) => reorderItems(boardId, orderedIds),
        onSuccess: () => queryClient.invalidateQueries(['board', boardId]),
    });
};

const useDeleteItem = (boardId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemIndex) => deleteItem(boardId, itemIndex),
        onSuccess: () => {
            queryClient.invalidateQueries(['board', boardId]);
        },
    });
};

export default {
    useCreateBoard,
    useUpdateBoard,
    useDeactivateBoard,
    useInviteToBoard,
    useAddColumn,
    useRemoveColumn,
    useCreateItem,
    useUpdateItemCell,
    useDeleteItem,
    useReorderColumns,
    useReorderItems,
};