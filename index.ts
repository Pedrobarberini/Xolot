import { registerRootComponent } from "expo";
import React from "react";
import App from "./App";
import { ThemeProvider } from "./src/ThemeProvider";
import { SessionProvider } from "./src/features/auth";
import { sessionRepository } from "./src/bootstrap/authServices";

function Root() {
  return React.createElement(
    ThemeProvider,
    null,
    React.createElement(
      SessionProvider,
      { repository: sessionRepository },
      React.createElement(App),
    ),
  );
}

registerRootComponent(Root);
