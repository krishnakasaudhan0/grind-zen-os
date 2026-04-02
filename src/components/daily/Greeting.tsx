import { useStore } from '@/stores/useStore';
import { format } from 'date-fns';

export function Greeting() {
  const { userName } = useStore();
  const hour = new Date().getHours();

  let greeting = "Evening grind. Finish strong.";
  if (hour < 12) greeting = "GM, dev. Lock in.";
  else if (hour < 17) greeting = "Afternoon session. Stay focused.";

  const name = userName || 'dev';

  return (
    <div className="mb-6">
      <h1 className="text-xl md:text-2xl font-mono font-bold text-foreground">
        {hour < 12 ? `GM, ${name}. Lock in.` : hour < 17 ? `Afternoon session, ${name}. Stay focused.` : `Evening grind, ${name}. Finish strong.`}
      </h1>
      <p className="font-mono text-sm text-muted-foreground mt-1">
        {format(new Date(), 'EEEE, MMMM d, yyyy · HH:mm')}
      </p>
    </div>
  );
}
