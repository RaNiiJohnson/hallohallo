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
import { useEffect, useState, useTransition } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "use-debounce";

const LISTING_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison" },
  { value: "studio", label: "Studio" },
  { value: "shared", label: "Colocation" },
  { value: "room", label: "Chambre" },
];

const BEDROOMS_OPTIONS = [
  { value: "1", label: "1 chambre" },
  { value: "2", label: "2 chambres" },
  { value: "3", label: "3 chambres" },
  { value: "4", label: "4+ chambres" },
];

export function RealEstatesFilters({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    type: parseAsString.withDefault("all"),
    bedrooms: parseAsInteger.withDefault(0),
    minPrice: parseAsInteger.withDefault(0),
    maxPrice: parseAsInteger.withDefault(0),
  });

  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localMinPrice, setLocalMinPrice] = useState(
    filters.minPrice > 0 ? filters.minPrice.toString() : "",
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    filters.maxPrice > 0 ? filters.maxPrice.toString() : "",
  );

  const [debouncedSearch] = useDebounce(localSearch, 600);
  const [debouncedMin] = useDebounce(localMinPrice, 1000);
  const [debouncedMax] = useDebounce(localMaxPrice, 1000);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      startTransition(() => {
        setFilters({ search: debouncedSearch || null });
      });
    }
  }, [debouncedSearch, setFilters, filters.search]);

  useEffect(() => {
    const min = debouncedMin === "" ? 0 : parseInt(debouncedMin);
    if (isNaN(min)) return;

    // Ne mettre à jour que si la valeur change réellement
    if (min !== filters.minPrice) {
      startTransition(() => {
        setFilters({ minPrice: min || null });
      });
    }
  }, [debouncedMin, filters.minPrice, setFilters]);

  useEffect(() => {
    const max = debouncedMax === "" ? 0 : parseInt(debouncedMax);
    if (isNaN(max)) return;

    if (max !== filters.maxPrice) {
      startTransition(() => {
        setFilters({ maxPrice: max || null });
      });
    }
  }, [debouncedMax, filters.maxPrice, setFilters]);

  const clearAll = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setFilters({
      search: null,
      type: "all",
      bedrooms: 0,
      minPrice: null,
      maxPrice: null,
    });
  };

  return (
    <div className="bg-background sticky top-0 p-6 pt-20 z-20 ">
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        {/* Barre de recherche principale */}
        <div className="flex gap-4">
          <InputGroup>
            <InputGroupInput
              placeholder="Rechercher..."
              className="pl-10"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
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
                  <div
                    className="space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Filtres avancés</h3>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-auto p-0"
                        onClick={clearAll}
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
                        <Select
                          value={filters.bedrooms.toString()}
                          onValueChange={(value) => {
                            setFilters({ bedrooms: parseInt(value) });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Toutes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={"0"}>Toutes</SelectItem>
                            {BEDROOMS_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prix min (€)
                        </label>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={localMinPrice}
                          onChange={(e) => setLocalMinPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Prix max (€)
                        </label>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={localMaxPrice}
                          onChange={(e) => setLocalMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className=" flex-wrap pt-2 gap-2 md:hidden flex">
                      <Badge
                        variant={filters.type === "all" ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setFilters({ type: "all" })}
                      >
                        Tous
                      </Badge>
                      {LISTING_TYPES.map((type) => (
                        <Badge
                          key={type.value}
                          variant={
                            filters.type === type.value ? "default" : "outline"
                          }
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setFilters({ type: type.value })}
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
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Filtres rapides par type */}
        <div className="hidden md:flex md:flex-wrap md:gap-2">
          <Badge
            variant={filters.type === "all" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            onClick={() => setFilters({ type: "all" })}
          >
            Tous
          </Badge>
          {LISTING_TYPES.map((type) => (
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
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              Favoris
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
