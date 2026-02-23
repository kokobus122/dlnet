import { Link } from "@tanstack/react-router";
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFilteredUsers } from "@/server/user";
import { useQuery } from "@tanstack/react-query";

export const NavSearch = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  const getFilteredUsersFn = useServerFn(getFilteredUsers);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleValueChange = (value: string) => {
    setInputValue(value);
    setOpen(!!value);
  };

  const { data: filteredUsers = [] } = useQuery({
    queryKey: ["filteredUsers", debouncedValue],
    queryFn: () => getFilteredUsersFn({ data: { query: debouncedValue } }),
    enabled: !!debouncedValue,
    staleTime: 1000 * 60 * 5,
  });

  // on select
  const handleSelect = (value: string) => {
    console.log("Selected user:", value);
    setOpen(false);
    setInputValue("");
  };

  return (
    <div className="relative overflow-visible">
      <Command className="shadow-md mx-auto rounded-none border-none bg-sage placeholder:text-zinc-100 text-zinc-100 placeholder:text-sm text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent relative overflow-visible">
        <CommandInput
          placeholder="Search..."
          onValueChange={handleValueChange}
          className="border-none"
        />
        {open && filteredUsers.length > 0 && (
          <CommandList className="absolute z-50 top-full left-0 right-0 mt-1 bg-sage border border-zinc-600 rounded-md max-h-64 overflow-y-auto">
            {filteredUsers.map((user) => (
              <CommandItem
                key={user.name}
                className="hover:bg-zinc-700 cursor-pointer"
                onSelect={() => handleSelect(user.name)}
              >
                {user.name}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
};
