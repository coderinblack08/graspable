import {
  Avatar,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import axios from "axios";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import React from "react";
import { HiOutlineChevronDown } from "react-icons/hi";
import useSWR, { useSWRConfig } from "swr";
import { auth } from "../lib/firebase-client";
import { User } from "../types";

interface AccountDropdownProps {}

export const AccountDropdown: React.FC<AccountDropdownProps> = ({}) => {
  const router = useRouter();
  const { cache } = useSWRConfig();
  const { data: account } = useSWR<User>("/api/auth/account");

  return (
    <Menu placement="bottom-end">
      <MenuButton
        px={2}
        leftIcon={<Avatar rounded="md" size="xs" name={account?.name} />}
        rightIcon={<Icon as={HiOutlineChevronDown} />}
        iconSpacing={3}
        variant="outline"
        as={Button}
      >
        {account?.name}
      </MenuButton>
      <Portal>
        <MenuList>
          <MenuItem>Settings</MenuItem>
          <MenuItem>Subscription</MenuItem>
          <MenuDivider />
          <MenuItem
            color="red.400"
            _hover={{ bg: "red.50" }}
            _focus={{ bg: "red.50" }}
            onClick={async () => {
              await signOut(auth);
              await axios.post("/api/auth/logout", null, {
                withCredentials: true,
              });
              cache.clear();
              router.push("/");
            }}
          >
            Log Out
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};
