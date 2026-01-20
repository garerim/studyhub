import React from "react";

import { ToggleTheme } from "./toggle-theme";

export const Header = () => {
  return (
    <header className="flex w-full items-center justify-end gap-4">
      <div className="flex items-center gap-2">
        <ToggleTheme />
      </div>
    </header>
  );
};
