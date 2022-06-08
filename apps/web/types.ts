export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  userId: string;
  subject: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  userId: string;
  courseId: string;
  name: string;
}
