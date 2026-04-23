import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Filter, Search } from "lucide-react";

export default function ComFilters() {
  return (
    <div className="bg-background sticky top-0 p-2 z-40">
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        <div className="flex gap-4">
          <InputGroup>
            <InputGroupInput placeholder="Rechercher ..." className="pl-10" />
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
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Type de contrat
                      </label>
                    </div>
                    <div></div>
                  </div>
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </div>
  );
}
