import { createContext, useContext, useState, FC, ReactNode } from 'react';

type UserContextType = {
  role: string | null;
  name: string | null;
  anhDaiDien: string | null; // thêm avatar
  setRole: (role: string) => void;
  setName: (name: string) => void;
  setAnhDaiDien: (url: string) => void; // setter cho avatar
};

const UserContext = createContext<UserContextType>({
  role: null,
  name: null,
  anhDaiDien: null,
  setRole: () => {},
  setName: () => {},
  setAnhDaiDien: () => {},
});

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [name, setName] = useState<string | null>(localStorage.getItem('name'));
  const [anhDaiDien, setAnhDaiDien] = useState<string | null>(localStorage.getItem('anhDaiDien'));

  return (
    <UserContext.Provider value={{ role, name, anhDaiDien, setRole, setName, setAnhDaiDien }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
