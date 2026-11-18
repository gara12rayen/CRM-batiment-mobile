import { dashboardMock } from "./dashboard.mock";
import { Dashboard } from "./types";

export async function getDashboard(): Promise<Dashboard> {
  // Daba: mock. Mn b3d: return (await apiClient.get("/admin/dashboard")).data;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return dashboardMock;
}