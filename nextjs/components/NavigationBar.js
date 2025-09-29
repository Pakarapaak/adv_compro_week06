import * as React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import useBearStore from "@/store/useBearStore";

const NavigationBar = () => {
  const router = useRouter();
  const { appName, user, logout } = useBearStore();

  const handleLogout = () => {
    logout();
    router.push("/Home");
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#666" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ cursor: "pointer", color: "#fff" }}
          onClick={() => router.push("/Home")}
        >
          {appName}
        </Typography>

        <div style={{ flexGrow: 1 }} />

        {!user ? (
          <>
            <Button color="inherit" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button color="inherit" onClick={() => router.push("/register")}>
              Register
            </Button>
          </>
        ) : (
          <>
            <Typography sx={{ color: "#fff", marginRight: 2 }}>
              {user.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
