import React, { ReactNode } from "react";
import MenuBar from "../common/menubar";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
    style={{
        display: "flex",        // layout 2 cột
        width: "100vw",         // full chiều ngang màn hình
        height: "100vh",        // full chiều cao màn hình
        overflow: "hidden",     // không cho MainLayout scroll
      }}
    >
      {/* MenuBar bên trái */}
      <div style={{ flexShrink: 0 }}>  {/* không co lại */}
        <MenuBar />
      </div>

      {/* Nội dung bên phải */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
