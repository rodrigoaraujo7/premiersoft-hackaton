import {
  createRootRoute,
  Link,
  Outlet,
  type LinkProps,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => {
  return (
    <main className="grid grid-cols-1 min-h-screen md:grid-cols-[1fr_768px_1fr]">
      <div className="col-start-1 col-end-2 md:col-start-2 md:col-end-3">
        <div className="flex justify-between gap-4 p-4 md:px-0">
          <CustomLink to="/">Home</CustomLink>
          <CustomLink to="/about">About</CustomLink>
        </div>

        <hr />

        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </main>
  );
};

const CustomLink = ({ children, ...props }: LinkProps) => {
  return <Link {...props}>{children}</Link>;
};

export const Route = createRootRoute({ component: RootLayout });
