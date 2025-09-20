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
import { Button } from "@/components/ui/button";

import { tv } from "tailwind-variants";

import { Upload } from "lucide-react";

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
  base: "flex-1 items-center justify-center w-full text-center p-2 rounded-md transition-colors",
  variants: {
    isActive: {
      true: "bg-black text-white",
      false: "",
    },
  },
});

const RootLayout = () => {
  return (
    <main>
      <header className="grid grid-cols-1 md:grid-cols-[1fr_768px_1fr] fixed top-0 left-0 right-0 z-10 w-full p-2 border-b border-gray-200 bg-white">
        <Button className="col-start-1 col-end-2 md:col-start-2 md:col-end-3 justify-self-end cursor-pointer">
          <Upload className="size-4" />
          Enviar dados
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_768px_1fr] p-2 mt-16">
        <div className="col-start-1 col-end-2 md:col-start-2 md:col-end-3">
          <div className="hidden justify-between gap-4 p-4 md:flex md:px-0">
            {routes.map((route, index) => (
              <CustomLink to={route.path} key={index}>
                {route.name}
              </CustomLink>
            ))}
          </div>

          <Accordion className="md:hidden" type="single" collapsible>
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
