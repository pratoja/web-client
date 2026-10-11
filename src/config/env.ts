// Igual ao client-app e ao admin-web: este site conversa direto com o
// backend que já está no ar em produção (o mesmo que o app do Cliente e o
// Painel Administrativo usam).
export const API_URL = 'https://prato-ja-backend.onrender.com/api/v1';

// O Socket.IO (tempo real — status do pedido, entregador) roda no mesmo
// servidor, na raiz (sem /api/v1).
export const SOCKET_URL = 'https://prato-ja-backend.onrender.com';
