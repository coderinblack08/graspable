import {
  Box,
  Button,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { IconPlus } from "@tabler/icons";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { Select } from "../lib/chakra-theme";
import { auth, db } from "../lib/firebase-client";
import { Course } from "../types";

interface NewCourseModalProps {}

export const NewCourseModal: React.FC<NewCourseModalProps> = ({}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cache = useQueryClient();
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm();

  return (
    <>
      <Button
        w="full"
        size="lg"
        onClick={onOpen}
        leftIcon={<Icon as={IconPlus} boxSize={6} />}
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
              cache.setQueryData<Course[]>("/api/courses", (old) =>
                old ? [...old, { ...data, id } as any] : []
              );
              router.push("/courses/[id]", `/courses/${id}`);
              onClose();
            })}
          >
            <ModalBody py={6}>
              <VStack spacing={3}>
                <Select
                  iconColor="gray.300"
                  iconSize={24}
                  size="lg"
                  {...register("subject")}
                >
                  <option value="mathematics">Mathematics</option>
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="language">Language</option>
                </Select>
                <Input size="lg" placeholder="Name" {...register("name")} />
                <Button
                  isLoading={isSubmitting}
                  w="full"
                  size="lg"
                  type="submit"
                >
                  Submit
                </Button>
              </VStack>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};
