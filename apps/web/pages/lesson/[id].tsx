import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { NavbarLayout } from "../../layouts/NavbarLayout";

const LessonPage: NextPage = () => {
  return (
    <NavbarLayout>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Courses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Geometry</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Heading mt={2}>Untitled</Heading>
    </NavbarLayout>
  );
};

export default LessonPage;
