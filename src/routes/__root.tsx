import { debug } from '@/utils/debug';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { lazy } from 'react';

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : lazy(() =>
      // Lazy load in development
      import('@tanstack/router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    );

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 20, // 20 hours
    },
    mutations: {
      onError: (error, variables, context) => {
        debug('[QueryClient_onError]', {
          error,
          variables,
          context,
        });
      },
    },
  },
});

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>

        <TanStackRouterDevtools />
      </>
    );
  },
});
