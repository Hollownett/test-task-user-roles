import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserRoleTable from './components/UserRoleTable';
import { Toaster } from './components/ui/sonner';
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100%', margin: '24px auto' }}>
        <div className="shad-card">
          <UserRoleTable />
          <Toaster position="top-right"/>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
