import {
  useLocation,
  createRootRoute,
  Link,
  Outlet,
  type LinkProps,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { tv } from "tailwind-variants";

type Route = {
  name: string;
  path: LinkProps["to"];
};

const routes: Route[] = [
  { name: "Médicos", path: "/medico" },
  { name: "Pacientes", path: "/pacientes" },
  { name: "Hospitais", path: "/hospitais" },
  { name: "Estados", path: "/estados" },
  { name: "Municípios", path: "/municipios" },
  { name: "CID", path: "/cid" },
];

const link = tv({
  base: "flex-1 items-center justify-center w-full text-center px-2 py-4 rounded-md transition-colors",
  variants: {
    isActive: {
      true: "bg-gray-100",
      false: "",
    },
  },
});

const RootLayout = () => {
  return (
    <main className="grid grid-cols-1 min-h-screen md:grid-cols-[1fr_768px_1fr]">
      <div className="col-start-1 col-end-2 md:col-start-2 md:col-end-3">
        <div className="hidden justify-between gap-4 p-4 md:flex md:px-0">
          {routes.map((route, index) => (
            <CustomLink to={route.path} key={index}>
              {route.name}
            </CustomLink>
          ))}
        </div>

        <Accordion className="p-4 md:hidden" type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Categorias</AccordionTrigger>
            {routes.map((route, index) => (
              <AccordionContent key={index}>
                <Link to={route.path}>{route.name}</Link>
              </AccordionContent>
            ))}
          </AccordionItem>
        </Accordion>

        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </main>
  );
};

const CustomLink = ({ children, ...props }: LinkProps) => {
  const location = useLocation();

  return (
    <Link
      className={link({ isActive: location.pathname === props.to })}
      {...props}
    >
      {children}
    </Link>
  );
};

export const Route = createRootRoute({ component: RootLayout });
