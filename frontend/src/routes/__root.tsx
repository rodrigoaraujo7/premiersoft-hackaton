import { useState } from "react";

import {
  useLocation,
  createRootRoute,
  Link,
  Outlet,
  type LinkProps,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleCloseDialog = () => {
    setIsUploading(false);
    setSelectedFile(null);
    setSelectedCategory("");
  };

  return (
    <main>
      <header className="grid grid-cols-1 md:grid-cols-[1fr_768px_1fr] fixed top-0 left-0 right-0 z-10 w-full p-2 border-b border-gray-200 bg-white">
        <Dialog
          open={isUploading}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseDialog();
            } else {
              setIsUploading(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="col-start-1 col-end-2 md:col-start-2 md:col-end-3 justify-self-end cursor-pointer">
              <Upload className="size-4" />
              Enviar dados
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Dados</DialogTitle>
              <DialogDescription>
                Selecione o arquivo que deseja enviar para análise.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.json,.xml,.hl7,.fhir"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full p-8 border-[1px] border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          ✓ {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Clique ou arraste o arquivo para trocar
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-black hover:text-blue-500">
                            Clique para selecionar
                          </span>{" "}
                          ou arraste o arquivo aqui
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          CSV, JSON, XML, HL7, FHIR
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medico">Médicos</SelectItem>
                  <SelectItem value="paciente">Pacientes</SelectItem>
                  <SelectItem value="hospital">Hospitais</SelectItem>
                  <SelectItem value="estado">Estados</SelectItem>
                  <SelectItem value="municipio">Municípios</SelectItem>
                  <SelectItem value="cid">CID</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex justify-end">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCloseDialog}
                    disabled={!selectedFile || !selectedCategory}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
