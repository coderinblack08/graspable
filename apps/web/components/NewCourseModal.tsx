import {
  Box,
  Button,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { addDoc, collection } from "firebase/firestore";
import React from "react";
import { useForm } from "react-hook-form";
import { HiOutlineFolderAdd } from "react-icons/hi";
import { useSWRConfig } from "swr";
import { auth, db } from "../lib/firebase-client";

interface NewCourseModalProps {}

export const NewCourseModal: React.FC<NewCourseModalProps> = ({}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate } = useSWRConfig();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm();

  return (
    <>
      <Button
        onClick={onOpen}
        leftIcon={<Icon as={HiOutlineFolderAdd} boxSize={5} />}
        colorScheme="blue"
        mt={4}
      >
        New Course
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Course</ModalHeader>
          <ModalCloseButton />
          <Box
            as="form"
            onSubmit={handleSubmit(async (values) => {
              const data = {
                ...values,
                lessons: [],
                userId: auth.currentUser?.uid,
              };
              const { id } = await addDoc(collection(db, "courses"), data);
              mutate("/api/courses", (old: any[]) =>
                old.concat({ ...data, id })
              );
              onClose();
            })}
          >
            <ModalBody>
              <VStack>
                <Select {...register("subject")}>
                  <option value="mathematics">Mathematics</option>
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="language">Language</option>
                </Select>
                <Input placeholder="Name" {...register("name")} />
              </VStack>
            </ModalBody>
            <ModalFooter pb={6}>
              <Button
                isLoading={isSubmitting}
                colorScheme="blue"
                w="full"
                type="submit"
              >
                Submit
              </Button>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};
