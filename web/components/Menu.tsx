import React from "react";
import { Menu as HeadlessMenu, Portal } from "@headlessui/react";

interface MenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
}

const Menu = ({ children, trigger }: MenuProps) => {
  return (
    <HeadlessMenu as="div" className="relative inline-block text-left">
      <HeadlessMenu.Button>{trigger}</HeadlessMenu.Button>
      <HeadlessMenu.Items className="absolute left-0 mt-4 w-56 origin-top-left rounded-lg bg-gray-800 p-1.5 shadow-lg focus:outline-none">
        {children}
      </HeadlessMenu.Items>
    </HeadlessMenu>
  );
};

interface ItemProps {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  onClick?: any;
}

const Item: React.FC<ItemProps> = ({ children, onClick }) => {
  return (
    <HeadlessMenu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={`flex w-full select-none rounded-lg px-4 py-1.5 focus:outline-none ${
            active ? "bg-gray-700" : ""
          }`}
        >
          {children}
        </button>
      )}
    </HeadlessMenu.Item>
  );
};

Menu.Item = Item;
export default Menu;
