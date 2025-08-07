import React, {useContext} from 'react';
import { ProviderRevenueStats } from './ProviderRevenueStats';
import { AuthContext } from "@/context/authContext";
import { ProviderTourStats } from './ProviderTourStats';
export const ProviderRevenueStatsWrapper: React.FC = () => {
  const { user } = useContext(AuthContext);
  
  // Lấy providerId từ user context
  const providerId = user?.providerId || user?.id || 1;
  
  return (
    <>
      <ProviderRevenueStats providerId={providerId} />
      <ProviderTourStats providerId={providerId} />
    </>
  );
}; 