import React from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { Link } from 'react-router';
import {TitleContext} from "../context/TitleContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {environment} from "../environments/environment";

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [title, setTitle] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const isDetailPage = location.pathname.startsWith('/scanner/');

  return (
    <TitleContext.Provider value={{title, setTitle}}>
      <Box sx={{ display: 'flex' }}>
        {/* App Bar */}
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            {isDetailPage && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => navigate(-1)} // or navigate('/') if you want to hardcode
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap>
              {title || 'Сканери'}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Side Drawer */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <List>
            {
              environment.features.scanner ?
                (<ListItem
                  button
                  component={Link}
                  to="/" onClick={() => setDrawerOpen(false)}
                  sx={{
                    color: '#fff',
                    '&:visited': { color: '#fff' },
                    textDecoration: 'none',
                  }}
                >
                  <ListItemText
                    primary="Сканери"
                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                  />
                </ListItem>)
                : null
            }
            {
              environment.features.logs ?
                (<ListItem
                  button
                  component={Link}
                  to="/logs" onClick={() => setDrawerOpen(false)}
                  sx={{
                    color: '#fff',
                    '&:visited': { color: '#fff' },
                    textDecoration: 'none',
                  }}
                >
                  <ListItemText
                    primary="Логи"
                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                  />
                </ListItem>)
                : null
            }
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 8 }} // mt:8 for AppBar space
        >
          <Outlet />
        </Box>
      </Box>
    </TitleContext.Provider>
  );
}
