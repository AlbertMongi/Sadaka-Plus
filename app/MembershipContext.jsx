// MembershipContext.js
import React, { createContext, useContext, useState } from 'react';

const MembershipContext = createContext();

export function MembershipProvider({ children }) {
  // memberships: { [communityId]: boolean }
  const [memberships, setMemberships] = useState({});

  const updateMembership = (communityId, isMember) => {
    setMemberships(prev => ({ ...prev, [communityId]: isMember }));
  };

  return (
    <MembershipContext.Provider value={{ memberships, updateMembership }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  return useContext(MembershipContext);
}
