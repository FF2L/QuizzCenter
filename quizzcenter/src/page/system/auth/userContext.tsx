import { createContext, useContext, useState, FC, ReactNode } from 'react';

type UserContextType = {
  role: string | null;
  name: string | null;
  setRole: (role: string) => void;
  setName: (name: string) => void;
};

const UserContext = createContext<UserContextType>({
  role: null,
  name: null,
  setRole: () => {},
  setName: () => {},
});

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [name, setName] = useState<string | null>(localStorage.getItem('name')); // lưu tên từ localStorage nếu có
  return (
    <UserContext.Provider value={{ role, name, setRole, setName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
