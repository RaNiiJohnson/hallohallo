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
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";

const LISTING_TYPES = [
  { value: "Appartement", label: "Appartement" },
  { value: "Maison", label: "Maison" },
  { value: "Studio", label: "Studio" },
  { value: "Colocation", label: "Colocation" },
  { value: "Chambre", label: "Chambre" },
];

const BEDROOMS_OPTIONS = [
  { value: "1", label: "1 chambre" },
  { value: "2", label: "2 chambres" },
  { value: "3", label: "3 chambres" },
  { value: "4", label: "4+ chambres" },
];

export function RealEstatesFilters({ isAuthenticated }: { isAuthenticated: boolean }) {

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Barre de recherche principale */}
      <div className="flex gap-4">
        <InputGroup>
          <InputGroupInput
            placeholder="Rechercher par titre, ville, quartier..."
            className="pl-10"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
              <PopoverTrigger asChild>
                <InputGroupButton variant="outline">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtres</span>

                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  ></Badge>
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-4" align="end">
                <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Filtres avancés</h3>

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
                        Nombre de chambres
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {BEDROOMS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prix min (€)
                        </label>
                        <Input type="number" placeholder="Min" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prix max (€)
                        </label>
                        <Input type="number" placeholder="Max" />
                      </div>
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
          variant={"outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
         
        >
          Tous
        </Badge>
        {LISTING_TYPES.map((type) => (
          <Badge
            key={type.value}
            variant={"outline"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            {type.label}
          </Badge>
        ))}
        {isAuthenticated && (
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
          >
            Favoris
          </Badge>
        )}
      </div>
    </div>
  );
}
