import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditProfileForm } from '@/components/EditProfileForm';

interface ProfileSettingsModalProps {
  children?: React.ReactNode;
}

export function ProfileSettingsModal({ children }: ProfileSettingsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <button className='flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors w-full'>
            <Settings className='w-4 h-4' />
            <span>Profile Settings</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <EditProfileForm />
      </DialogContent>
    </Dialog>
  );
}
