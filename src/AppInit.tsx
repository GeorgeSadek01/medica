import React, { useEffect } from 'react';
import { useAppDispatch } from './store';
import { fetchCurrentUser } from './store/authSlice';

const AppInit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <>{children}</>;
};

export default AppInit;
