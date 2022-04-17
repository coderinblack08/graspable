export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  subject: string;
  lessons: string[]; // order of lessons
}

export interface Lesson {
  id: string;
  name: string;
}
