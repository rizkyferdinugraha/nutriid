import AppMobileLayout from '@/layouts/app/app-mobile-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, ...props }: AppLayoutProps) => (
    <AppMobileLayout {...props}>
        {children}
    </AppMobileLayout>
);
