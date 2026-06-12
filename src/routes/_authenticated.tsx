import { auth } from '#/lib/auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import {createServerFn} from '@tanstack/react-start';
import {getRequestHeaders} from '@tanstack/react-start/server';

export const getCurrentUser = createServerFn().handler(async () => {
    const rawHeaders = getRequestHeaders();
    const headers = new Headers(rawHeaders as HeadersInit);
    const session = await auth.api.getSession({
        headers
    });

    return session?.user ?? null;
});

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    
    if(!user) {
     throw redirect({
        to: "/login",
        search: {redirect: location.pathname},
     });
    }

    return {
      user,
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet/>
}
