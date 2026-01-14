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
import { AuthUser } from "@/lib/convexTypes";
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

export function EmploisFilters({
  user,
}: {
  user: AuthUser | null | undefined;
}) {
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Barre de recherche principale */}
      <div className="flex gap-4">
        <InputGroup>
          <InputGroupInput
            placeholder="Rechercher par titre, ville, type..."
            className="pl-10"
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
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les contrats" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les contrats</SelectItem>
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
          variant="default"
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
        >
          Toutes
        </Badge>
        {JOB_TYPES.map((type) => (
          <Badge
            key={type.value}
            variant="default"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            {type.label}
          </Badge>
        ))}
        {user && (
          <Badge
            variant="default"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            Favoris
          </Badge>
        )}
      </div>
    </div>
  );
}
