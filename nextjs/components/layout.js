import { useRouter } from "next/router";
import NavigationLayout from "./NavigationBar";

export default function Layout({ children }) {
  const router = useRouter();
  const hideNavbarPaths = ["/login", "/register"]; // Add paths where navbar should be hidden
  const shouldHideNavbar = hideNavbarPaths.includes(router.pathname);

  return (
    <>
      {!shouldHideNavbar && <NavigationLayout />}
      <main>{children}</main>
    </>
  );
}
