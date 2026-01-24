import api from '../utils/api';

// Auth
export const registerUser = (data) => api.post('/auth/register', data).then(res => res.data);
export const verifyEmailToken = (token) => api.get(`/auth/verify-email?token=${token}`).then(res => res.data);
export const loginUser = (data) => api.post('/auth/login', data).then(res => res.data);
export const logoutUser = () => api.post('/auth/logout').then(res => res.data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data).then(res => res.data);
export const resetPassword = (token, data) => api.post(`/auth/reset-password/${token}`, data).then(res => res.data);

// Users
export const getAllUsers = () => api.get('/users').then(res => res.data.data.users);
export const updateUserRole = (userId, role) => api.patch(`/users/${userId}/role`, { role }).then(res => res.data.data.user);
export const getMyProfile = () => api.get('/users/me').then(res => res.data.data.user);
export const updateMyProfile = (data) => api.patch('/users/me', data).then(res => res.data.data.user);
export const changeMyPassword = (data) => api.patch('/users/me/password', data).then(res => res.data);

// Workspaces
export const getWorkspaces = () => api.get('/workspaces').then(res => res.data.data.workspaces);
export const getWorkspace = (id) => api.get(`/workspaces/${id}`).then(res => res.data.data.workspace);
export const createWorkspace = (data) => api.post('/workspaces', data).then(res => res.data.data.workspace);
export const updateWorkspace = (id, data) => api.patch(`/workspaces/${id}`, data).then(res => res.data.data.workspace);
export const deactivateWorkspace = (id) => api.patch(`/workspaces/${id}/deactivate`).then(res => res.data.data.workspace);
export const inviteToWorkspace = (id, userId) => api.post(`/workspaces/${id}/invite`, { userId }).then(res => res.data.data.workspace);

// Boards
export const getBoardsByWorkspace = (workspaceId) => api.get(`/boards/workspace/${workspaceId}`).then(res => res.data.data.boards);
export const getBoard = (id) => api.get(`/boards/${id}`).then(res => res.data.data.board);
export const createBoard = (data) => api.post('/boards', data).then(res => res.data.data.board);
export const updateBoard = (id, data) => api.patch(`/boards/${id}`, data).then(res => res.data.data.board);
export const deactivateBoard = (id) => api.patch(`/boards/${id}/deactivate`).then(res => res.data.data.board);
export const inviteToBoard = (id, userId) => api.post(`/boards/${id}/invite`, { userId }).then(res => res.data.data.board);

// Columnas
export const addColumn = (boardId, data) => api.post(`/boards/${boardId}/columns`, data).then(res => res.data.data.board);
export const reorderColumns = (boardId, orderedColumnIds) => api.patch(`/boards/${boardId}/reorder-columns`, { orderedColumnIds }).then(res => res.data.data.board);
export const removeColumn = (boardId, columnId) => api.delete(`/boards/${boardId}/columns/${columnId}`).then(res => res.data.data.board);


// Items
export const createItem = (boardId, values) => api.post(`/boards/${boardId}/items`, { values }).then(res => res.data.data.item);
export const updateItemCell = (boardId, itemIndex, columnId, value) => api.patch(`/boards/${boardId}/items/${itemIndex}/columns/${columnId}`, { value }).then(res => res.data.data.item);
export const reorderItems = (boardId, orderedItemIds) => api.patch(`/boards/${boardId}/reorder-items`, { orderedItemIds }).then(res => res.data.data.board);
export const deleteItem = (boardId, itemId) => api.delete(`/boards/${boardId}/items/${itemId}`).then(res => res.data.data.board);

// Charts
export const addChart = (boardId, data) => api.post(`/boards/${boardId}/charts`, data).then(res => res.data.data.board);
export const removeChart = (boardId, chartIndex) => api.delete(`/boards/${boardId}/charts/${chartIndex}`).then(res => res.data.data.board);

