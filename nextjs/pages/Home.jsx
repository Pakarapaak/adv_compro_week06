import React from "react";
import Link from "next/link";
import { Container, Typography, Stack, Button } from "@mui/material";
import useBearStore from "@/store/useBearStore";

export default function Home() {
  const user = useBearStore((state) => state.user);

  return (
    <Container sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        Welcome to My Shopping Site
      </Typography>
      <Typography variant="h6" gutterBottom>
        Navigate using the menu above
      </Typography>

      {user && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Link href="/additem" passHref>
            <Button variant="contained" color="primary">
              Add Item
            </Button>
          </Link>

          <Link href="/Home" passHref>
            <Button variant="outlined" color="secondary">
              Refresh Home
            </Button>
          </Link>
        </Stack>
      )}

      {!user && (
        <Typography variant="body1" sx={{ mt: 4 }}>
          Please login or register from the navigation bar to manage your items.
        </Typography>
      )}
    </Container>
  );
}
