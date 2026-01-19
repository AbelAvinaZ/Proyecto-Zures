import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deactivateWorkspace,
    inviteToWorkspace,
} from '../api';

const useWorkspace = (workspaceId) => {
    return useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: () => getWorkspace(workspaceId),
        enabled: !!workspaceId,
    });
};

const useCreateWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkspace,
        onSuccess: () => {
            queryClient.invalidateQueries(['workspaces']);
        },
    });
};

const useUpdateWorkspace = (workspaceId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => updateWorkspace(workspaceId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace', workspaceId]);
            queryClient.invalidateQueries(['workspaces']);
        },
    });
};

const useDeactivateWorkspace = (workspaceId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => deactivateWorkspace(workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace', workspaceId]);
            queryClient.invalidateQueries(['workspaces']);
        },
    });
};

const useInviteToWorkspace = (workspaceId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => inviteToWorkspace(workspaceId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace', workspaceId]);
        },
    });
};

export default {
    useWorkspace,
    useCreateWorkspace,
    useUpdateWorkspace,
    useDeactivateWorkspace,
    useInviteToWorkspace,
};