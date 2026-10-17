import React, { useEffect } from 'react';
import { MyNodeCard } from '../landing/MyNodeCard';
import { RoleConfigurationOptimizer } from './RoleConfigurationOptimizer';
import { useAppStore } from '../../store/useAppStore';

export const MyNodePage: React.FC = () => {
  const { roleSuggestions, isLoadingRoleSuggestions, fetchRoleSuggestions } = useAppStore();

  useEffect(() => {
    if (!roleSuggestions) fetchRoleSuggestions();
  }, [roleSuggestions, fetchRoleSuggestions]);

  return (
    <div className="h-full w-full overflow-y-auto bg-surface px-4 pb-8 pt-16 text-on-background transition-colors sm:px-6 md:p-6 md:pt-6">
      <div className="mx-auto w-full max-w-container-max space-y-6">
        <header className="flex flex-col items-start justify-between gap-2 border-b border-outline-variant pb-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Role Optimizer</h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Find a node and review role suggestions based on its importance in the network.
            </p>
          </div>
          <span className="hidden shrink-0 font-label-mono text-[10px] uppercase tracking-wider text-outline sm:block">Network role analysis</span>
        </header>

        <MyNodeCard language="en" />

        {roleSuggestions ? (
          <RoleConfigurationOptimizer />
        ) : isLoadingRoleSuggestions ? (
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" aria-label="Loading role suggestions" />
          </div>
        ) : null}
      </div>
    </div>
  );
};
