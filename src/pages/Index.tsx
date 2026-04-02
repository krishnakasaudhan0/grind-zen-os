import { useStore } from '@/stores/useStore';
import { Layout } from '@/components/Layout';
import { Onboarding } from '@/components/Onboarding';
import { DailyTab } from '@/components/tabs/DailyTab';
import { TasksTab } from '@/components/tabs/TasksTab';
import { ProjectsTab } from '@/components/tabs/ProjectsTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';

const Index = () => {
  const { onboarded } = useStore();

  if (!onboarded) return <Onboarding />;

  return (
    <Layout>
      <DailyTab />
      <TasksTab />
      <ProjectsTab />
      <StatsTab />
    </Layout>
  );
};

export default Index;
