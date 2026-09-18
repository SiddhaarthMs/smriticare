import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { ElderlyLayout } from "@/components/layout/ElderlyLayout";
import { AIJourneyPage } from "@/pages/AIJourneyPage";
import { BrainGymPage } from "@/pages/BrainGymPage";
import { CaregiverDashboardPage } from "@/pages/CaregiverDashboardPage";
import { DemoModePage } from "@/pages/DemoModePage";
import { ElderlyHomePage } from "@/pages/ElderlyHomePage";
import { GamePage } from "@/pages/GamePage";
import { HealthcareDashboardPage } from "@/pages/HealthcareDashboardPage";
import { LandingPage } from "@/pages/LandingPage";
import { MyDayPage } from "@/pages/MyDayPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RoleSelectionPage } from "@/pages/RoleSelectionPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SocialPage } from "@/pages/SocialPage";
import { VoicePage } from "@/pages/VoicePage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

function buildRouteTree() {
  const landingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => (
      <AppLayout>
        <LandingPage />
      </AppLayout>
    ),
  });
  const roleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/role",
    component: () => (
      <AppLayout>
        <RoleSelectionPage />
      </AppLayout>
    ),
  });
  const elderlyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/elderly",
    component: () => (
      <ElderlyLayout>
        <ElderlyHomePage />
      </ElderlyLayout>
    ),
  });
  const brainGymRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/brain-gym",
    component: () => (
      <ElderlyLayout>
        <BrainGymPage />
      </ElderlyLayout>
    ),
  });
  const gameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/games/$gameId",
    component: () => (
      <ElderlyLayout>
        <GamePage />
      </ElderlyLayout>
    ),
  });
  const myDayRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/my-day",
    component: () => (
      <ElderlyLayout>
        <MyDayPage />
      </ElderlyLayout>
    ),
  });
  const voiceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/voice",
    component: () => (
      <ElderlyLayout>
        <VoicePage />
      </ElderlyLayout>
    ),
  });
  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/profile",
    component: () => (
      <ElderlyLayout>
        <ProfilePage />
      </ElderlyLayout>
    ),
  });
  const socialRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/social",
    component: () => (
      <ElderlyLayout>
        <SocialPage />
      </ElderlyLayout>
    ),
  });
  const aiJourneyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ai-journey",
    component: () => (
      <ElderlyLayout>
        <AIJourneyPage />
      </ElderlyLayout>
    ),
  });
  const caregiverRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/caregiver",
    component: () => (
      <AppLayout>
        <CaregiverDashboardPage />
      </AppLayout>
    ),
  });
  const healthcareRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/healthcare",
    component: () => (
      <AppLayout>
        <HealthcareDashboardPage />
      </AppLayout>
    ),
  });
  const demoRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/demo",
    component: () => (
      <AppLayout>
        <DemoModePage />
      </AppLayout>
    ),
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
    component: () => (
      <ElderlyLayout>
        <SettingsPage />
      </ElderlyLayout>
    ),
  });

  return rootRoute.addChildren([
    landingRoute,
    roleRoute,
    elderlyRoute,
    brainGymRoute,
    gameRoute,
    myDayRoute,
    voiceRoute,
    profileRoute,
    socialRoute,
    aiJourneyRoute,
    caregiverRoute,
    healthcareRoute,
    demoRoute,
    settingsRoute,
  ]);
}

export async function renderAtPath(path: string) {
  const routeTree = buildRouteTree();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

export function renderElement(element: ReactElement) {
  return render(element);
}
