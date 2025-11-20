import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import "./App.css";
import "@mantine/dates/styles.css";
import AppContents from "./AppContents";
import { Notifications } from "@mantine/notifications";
import theme from "./Theme/Theme";
export const isProduction = import.meta.env.MODE !== "development";

const basename = isProduction ? "/clinicpe/management" : "/";

function App() {
  return (
    <>
      <MantineProvider theme={theme}>
        <BrowserRouter basename={basename}>
          <Notifications position="top-right" />
          <AppContents />
        </BrowserRouter>
      </MantineProvider>
    </>
  );
}

export default App;
