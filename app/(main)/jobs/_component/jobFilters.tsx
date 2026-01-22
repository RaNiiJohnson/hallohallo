"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useQueryStates, parseAsString } from "nuqs";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "use-debounce";

const JOB_TYPES = [
  { value: "Au pair", label: "Au pair" },
  { value: "Formation", label: "Formation" },
  { value: "Volontariat", label: "Volontariat" },
  { value: "Stage", label: "Stage" },
  { value: "Mini-job", label: "Mini-job" },
  { value: "Emploi", label: "Emploi" },
  { value: "Bourse d'étude", label: "Bourse d'étude" },
];

const CONTRACT_TYPES = [
  { value: "CDD", label: "CDD" },
  { value: "CDI", label: "CDI" },
  { value: "FSJ/FOJ/BFD", label: "FSJ/FOJ/BFD" },
  { value: "Temps plein", label: "Temps plein" },
  { value: "Temps partiel", label: "Temps partiel" },
  { value: "Freelance", label: "Freelance" },
  { value: "Aprentissage", label: "Aprentissage" },
];

export function JobFilters({ isAuthenticated }: { isAuthenticated: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition();

  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    type: parseAsString.withDefault("all"),
    contract: parseAsString.withDefault("all"),
  });

  // 1. L'unique source de vérité pour l'affichage de l'input
  const [localSearch, setLocalSearch] = useState(filters.search);

  // 2. On calcule la valeur debouncée
  const [debouncedSearch] = useDebounce(localSearch, 600);

  // 3. Un SEUL effet pour pousser vers l'URL
  useEffect(() => {
    // On vérifie si la valeur a vraiment changé pour éviter les rendus inutiles
    if (debouncedSearch !== filters.search) {
      startTransition(() => {
        setFilters({ search: debouncedSearch || null });
      });
    }
  }, [debouncedSearch, setFilters, filters.search]);

  const clearAll = () => {
    setLocalSearch(""); 
    setFilters({ search: null, type: "all", contract: "all" });
  };

  return (
    <div className="bg-background sticky top-0 p-6 pt-20 z-10 ">
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Barre de recherche principale */}
        <div className="flex gap-4">
          <InputGroup>
            <InputGroupInput
              placeholder="Rechercher ..."
              className="pl-10"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Popover>
                <PopoverTrigger asChild>
                  <InputGroupButton variant="outline">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtres</span>
                  </InputGroupButton>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Filtres</h3>
                      <Button
                        onClick={clearAll}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-auto p-0"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Effacer tout
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Type de contrat
                        </label>
                        <Select
                          value={filters.contract}
                          onValueChange={(value) =>
                            setFilters({ contract: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tous les contrats" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Tous les contrats
                            </SelectItem>
                            {CONTRACT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Filtres rapides par type */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filters.type === "all" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            onClick={() => setFilters({ type: "all" })}
          >
            Tous
          </Badge>
          {JOB_TYPES.map((type) => (
            <Badge
              key={type.value}
              variant={filters.type === type.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => setFilters({ type: type.value })}
            >
              {type.label}
            </Badge>
          ))}
          {isAuthenticated && (
            <Badge
              variant={filters.type === "favorite" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              // onClick={() => setFilters({ type: "favorite" })}
            >
              Favoris
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
