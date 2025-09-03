import './App.css';
import {useEffect} from 'react';
import { websocketService } from "./services/WebsocketService";
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router';

import ScannerListPage from './pages/ScannerListPage';
import ScannerDetailPage from './pages/ScannerDetailPage';
import MainLayout from "./components/MainLayout";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LogsPage from "./pages/LogsPage";
import {environment} from "./environments/environment";

function App() {
  useEffect(() => {
    return () => {
      websocketService.close();
    }
  }, [])

  const routes = [];
  let hasIndex = false;
  if (environment.features.scanner) {
    hasIndex = true;
    routes.push(
      {
        index: true,
        element: <ScannerListPage />
      }
    );
    routes.push(
      {
        path: '/scanner/:id',
        element: <ScannerDetailPage />
      }
    )
  }

  if (environment.features.logs) {
    routes.push(
      {
        path: '/logs',
        element: <LogsPage />
      }
    );
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <MainLayout/>,
      children: routes
    },
  ]);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#aaaaaa',
      }
    },
    components: {
      MuiLink: {
        styleOverrides: {
          root: {
            color: '#ffffff',
            textDecoration: 'none',
            '&:hover': {
              color: '#90caf9',
            },
            '&:visited': {
              color: '#ffffff',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
