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
import { Progress } from "@/components/ui/progress";

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Configuração de tamanho máximo do arquivo
  const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 5; // 5GB

  const handleCloseDialog = () => {
    setIsUploading(false);
    setSelectedFile(null);
    setSelectedCategory("");
    setUploadProgress(0);
    setUploadStatus("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > MAX_FILE_SIZE) {
      alert("Arquivo muito grande. O tamanho máximo permitido é 5GB.");
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async (file: File, category: string) => {
    setUploadStatus("Iniciando upload...");
    setUploadProgress(10);

    try {
      // Mapear categoria para endpoint correto
      const categoryEndpoints: { [key: string]: string } = {
        medico: "medicos",
        paciente: "pacientes",
        hospital: "hospitais",
        estado: "estados",
        municipio: "municipios",
        cid: "cid",
      };

      const endpoint = categoryEndpoints[category];
      if (!endpoint) {
        throw new Error(`Categoria não suportada: ${category}`);
      }

      setUploadStatus("Enviando arquivo...");
      setUploadProgress(50);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`http://localhost:3000/upload/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha no upload");
      }

      const result = await response.json();
      setUploadProgress(100);
      setUploadStatus("Upload concluído com sucesso!");

      console.log("Upload resultado:", result);
      handleCloseDialog();
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadStatus(
        `Erro no upload: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) return;

    setUploadProgress(0);
    await uploadFile(selectedFile, selectedCategory);
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

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Dados</DialogTitle>
              <DialogDescription>
                Selecione o arquivo que deseja enviar para análise (até 5GB).
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.json,.xml,.hl7,.fhir"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                  onChange={handleFileChange}
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
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
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
                          CSV, JSON, XML, HL7, FHIR (até 5GB)
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Category selection */}
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

              {/* Progress indicator */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-600">{uploadStatus}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={
                      !selectedFile || !selectedCategory || uploadProgress > 0
                    }
                  >
                    {uploadProgress > 0 ? "Enviando..." : "Enviar"}
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
