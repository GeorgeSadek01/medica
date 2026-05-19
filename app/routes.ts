import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("layouts/AuthLayout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("register", "routes/auth/register.tsx"),
  ]),
  layout("layouts/MainLayout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/patient", "routes/dashboard/patient/index.tsx"),
    route("dashboard/doctor", "routes/dashboard/doctor/index.tsx"),
    route("dashboard/admin", "routes/dashboard/admin/index.tsx"),
  ]),
  route("unauthorized", "routes/unauthorized.tsx"),
  index("routes/home.tsx"),
] satisfies RouteConfig;
