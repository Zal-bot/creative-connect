import { Prisma } from '@prisma/client';

export type JobPost = Prisma.JobPostGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        profilePic: true;
        bio: true;
        skills: true;
        portfolioUrl: true;
      };
    };
  };
}>;

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    profilePic: true;
    bio: true;
    skills: true;
    portfolioUrl: true;
  };
}>;

export type JobApplication = Prisma.JobApplicationGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        profilePic: true;
      };
    };
  };
}>; 