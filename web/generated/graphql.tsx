import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type CreateOrganizationArgs = {
  name: Scalars['String'];
};

export type CreateWorkspaceArgs = {
  name: Scalars['String'];
  organizationId: Scalars['Float'];
};

export type DateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type EmailPasswordInput = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};

export type EnumMemberRoleFilter = {
  equals?: InputMaybe<MemberRole>;
  in?: InputMaybe<Array<MemberRole>>;
  not?: InputMaybe<NestedEnumMemberRoleFilter>;
  notIn?: InputMaybe<Array<MemberRole>>;
};

export type FieldErrorObject = {
  __typename?: 'FieldErrorObject';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type IntFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type IntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type Member = {
  __typename?: 'Member';
  organizationId: Scalars['Int'];
  role: MemberRole;
  userId: Scalars['Int'];
};

export type MemberListRelationFilter = {
  every?: InputMaybe<MemberWhereInput>;
  none?: InputMaybe<MemberWhereInput>;
  some?: InputMaybe<MemberWhereInput>;
};

export type MemberOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type MemberOrderByWithRelationInput = {
  organization?: InputMaybe<OrganizationOrderByWithRelationInput>;
  organizationId?: InputMaybe<SortOrder>;
  role?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
  userId?: InputMaybe<SortOrder>;
};

export enum MemberRole {
  Admin = 'admin',
  Editor = 'editor',
  Owner = 'owner',
  Viewer = 'viewer'
}

export enum MemberScalarFieldEnum {
  OrganizationId = 'organizationId',
  Role = 'role',
  UserId = 'userId'
}

export type MemberUserIdOrganizationIdCompoundUniqueInput = {
  organizationId: Scalars['Int'];
  userId: Scalars['Int'];
};

export type MemberWhereInput = {
  AND?: InputMaybe<Array<MemberWhereInput>>;
  NOT?: InputMaybe<Array<MemberWhereInput>>;
  OR?: InputMaybe<Array<MemberWhereInput>>;
  organization?: InputMaybe<OrganizationRelationFilter>;
  organizationId?: InputMaybe<IntFilter>;
  role?: InputMaybe<EnumMemberRoleFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<IntFilter>;
};

export type MemberWhereUniqueInput = {
  userId_organizationId?: InputMaybe<MemberUserIdOrganizationIdCompoundUniqueInput>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createOrganization: Organization;
  createWorkspace?: Maybe<Workspace>;
  login: UserObject;
  logout: Scalars['Boolean'];
  register: UserObject;
};


export type MutationCreateOrganizationArgs = {
  args: CreateOrganizationArgs;
};


export type MutationCreateWorkspaceArgs = {
  args: CreateWorkspaceArgs;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRegisterArgs = {
  options: EmailPasswordInput;
};

export type NestedDateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type NestedEnumMemberRoleFilter = {
  equals?: InputMaybe<MemberRole>;
  in?: InputMaybe<Array<MemberRole>>;
  not?: InputMaybe<NestedEnumMemberRoleFilter>;
  notIn?: InputMaybe<Array<MemberRole>>;
};

export type NestedIntFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type NestedIntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type NestedStringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NestedStringFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type Organization = {
  __typename?: 'Organization';
  _count?: Maybe<OrganizationCount>;
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  members: Array<Member>;
  name: Scalars['String'];
  ownerId: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  user: User;
  workspaces: Array<Workspace>;
};


export type OrganizationMembersArgs = {
  cursor?: InputMaybe<MemberWhereUniqueInput>;
  distinct?: InputMaybe<Array<MemberScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<MemberOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<MemberWhereInput>;
};


export type OrganizationWorkspacesArgs = {
  cursor?: InputMaybe<WorkspaceWhereUniqueInput>;
  distinct?: InputMaybe<Array<WorkspaceScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<WorkspaceOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WorkspaceWhereInput>;
};

export type OrganizationCount = {
  __typename?: 'OrganizationCount';
  members: Scalars['Int'];
  workspaces: Scalars['Int'];
};

export type OrganizationListRelationFilter = {
  every?: InputMaybe<OrganizationWhereInput>;
  none?: InputMaybe<OrganizationWhereInput>;
  some?: InputMaybe<OrganizationWhereInput>;
};

export type OrganizationOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type OrganizationOrderByWithRelationInput = {
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  members?: InputMaybe<MemberOrderByRelationAggregateInput>;
  name?: InputMaybe<SortOrder>;
  ownerId?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
  workspaces?: InputMaybe<WorkspaceOrderByRelationAggregateInput>;
};

export type OrganizationRelationFilter = {
  is?: InputMaybe<OrganizationWhereInput>;
  isNot?: InputMaybe<OrganizationWhereInput>;
};

export type OrganizationWhereInput = {
  AND?: InputMaybe<Array<OrganizationWhereInput>>;
  NOT?: InputMaybe<Array<OrganizationWhereInput>>;
  OR?: InputMaybe<Array<OrganizationWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<IntFilter>;
  members?: InputMaybe<MemberListRelationFilter>;
  name?: InputMaybe<StringFilter>;
  ownerId?: InputMaybe<IntFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  workspaces?: InputMaybe<WorkspaceListRelationFilter>;
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String'];
  me?: Maybe<User>;
  organizations: Array<Organization>;
};

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive'
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<QueryMode>;
  not?: InputMaybe<NestedStringFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  _count?: Maybe<UserCount>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  password: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type UserCount = {
  __typename?: 'UserCount';
  memberships: Scalars['Int'];
  organizations: Scalars['Int'];
};

export type UserObject = {
  __typename?: 'UserObject';
  errors?: Maybe<Array<FieldErrorObject>>;
  user?: Maybe<User>;
};

export type UserOrderByWithRelationInput = {
  createdAt?: InputMaybe<SortOrder>;
  email?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  memberships?: InputMaybe<MemberOrderByRelationAggregateInput>;
  name?: InputMaybe<SortOrder>;
  organizations?: InputMaybe<OrganizationOrderByRelationAggregateInput>;
  password?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type UserRelationFilter = {
  is?: InputMaybe<UserWhereInput>;
  isNot?: InputMaybe<UserWhereInput>;
};

export type UserWhereInput = {
  AND?: InputMaybe<Array<UserWhereInput>>;
  NOT?: InputMaybe<Array<UserWhereInput>>;
  OR?: InputMaybe<Array<UserWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<IntFilter>;
  memberships?: InputMaybe<MemberListRelationFilter>;
  name?: InputMaybe<StringFilter>;
  organizations?: InputMaybe<OrganizationListRelationFilter>;
  password?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type Workspace = {
  __typename?: 'Workspace';
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  organizationId?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['DateTime'];
};

export type WorkspaceListRelationFilter = {
  every?: InputMaybe<WorkspaceWhereInput>;
  none?: InputMaybe<WorkspaceWhereInput>;
  some?: InputMaybe<WorkspaceWhereInput>;
};

export type WorkspaceOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type WorkspaceOrderByWithRelationInput = {
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  organization?: InputMaybe<OrganizationOrderByWithRelationInput>;
  organizationId?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export enum WorkspaceScalarFieldEnum {
  CreatedAt = 'createdAt',
  Id = 'id',
  Name = 'name',
  OrganizationId = 'organizationId',
  UpdatedAt = 'updatedAt'
}

export type WorkspaceWhereInput = {
  AND?: InputMaybe<Array<WorkspaceWhereInput>>;
  NOT?: InputMaybe<Array<WorkspaceWhereInput>>;
  OR?: InputMaybe<Array<WorkspaceWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<IntFilter>;
  name?: InputMaybe<StringFilter>;
  organization?: InputMaybe<OrganizationRelationFilter>;
  organizationId?: InputMaybe<IntNullableFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type WorkspaceWhereUniqueInput = {
  id?: InputMaybe<Scalars['Int']>;
};

export type ErrorFragment = { __typename?: 'FieldErrorObject', field: string, message: string };

export type OrganizationFragment = { __typename?: 'Organization', id: number, name: string, ownerId: number };

export type UserFragment = { __typename?: 'User', id: number, email: string, name: string, createdAt: any };

export type WorkspaceFragment = { __typename?: 'Workspace', id: number, name: string, organizationId?: number | null };

export type CreateOrganizationMutationVariables = Exact<{
  args: CreateOrganizationArgs;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization: { __typename?: 'Organization', id: number, name: string, ownerId: number } };

export type CreateWorkspaceMutationVariables = Exact<{
  args: CreateWorkspaceArgs;
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace?: { __typename?: 'Workspace', id: number, name: string, organizationId?: number | null } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserObject', user?: { __typename?: 'User', id: number, email: string, name: string, createdAt: any } | null, errors?: Array<{ __typename?: 'FieldErrorObject', field: string, message: string }> | null } };

export type RegisterMutationVariables = Exact<{
  options: EmailPasswordInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserObject', user?: { __typename?: 'User', id: number, email: string, name: string, createdAt: any } | null, errors?: Array<{ __typename?: 'FieldErrorObject', field: string, message: string }> | null } };

export type HelloQueryVariables = Exact<{ [key: string]: never; }>;


export type HelloQuery = { __typename?: 'Query', hello: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, email: string, name: string, createdAt: any } | null };

export type OrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationsQuery = { __typename?: 'Query', organizations: Array<{ __typename?: 'Organization', id: number, name: string, ownerId: number, workspaces: Array<{ __typename?: 'Workspace', id: number, name: string, organizationId?: number | null }> }> };

export const ErrorFragmentDoc = gql`
    fragment Error on FieldErrorObject {
  field
  message
}
    `;
export const OrganizationFragmentDoc = gql`
    fragment Organization on Organization {
  id
  name
  ownerId
}
    `;
export const UserFragmentDoc = gql`
    fragment User on User {
  id
  email
  name
  createdAt
}
    `;
export const WorkspaceFragmentDoc = gql`
    fragment Workspace on Workspace {
  id
  name
  organizationId
}
    `;
export const CreateOrganizationDocument = gql`
    mutation CreateOrganization($args: CreateOrganizationArgs!) {
  createOrganization(args: $args) {
    ...Organization
  }
}
    ${OrganizationFragmentDoc}`;
export type CreateOrganizationMutationFn = Apollo.MutationFunction<CreateOrganizationMutation, CreateOrganizationMutationVariables>;

/**
 * __useCreateOrganizationMutation__
 *
 * To run a mutation, you first call `useCreateOrganizationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrganizationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrganizationMutation, { data, loading, error }] = useCreateOrganizationMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useCreateOrganizationMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrganizationMutation, CreateOrganizationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrganizationMutation, CreateOrganizationMutationVariables>(CreateOrganizationDocument, options);
      }
export type CreateOrganizationMutationHookResult = ReturnType<typeof useCreateOrganizationMutation>;
export type CreateOrganizationMutationResult = Apollo.MutationResult<CreateOrganizationMutation>;
export type CreateOrganizationMutationOptions = Apollo.BaseMutationOptions<CreateOrganizationMutation, CreateOrganizationMutationVariables>;
export const CreateWorkspaceDocument = gql`
    mutation CreateWorkspace($args: CreateWorkspaceArgs!) {
  createWorkspace(args: $args) {
    ...Workspace
  }
}
    ${WorkspaceFragmentDoc}`;
export type CreateWorkspaceMutationFn = Apollo.MutationFunction<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;

/**
 * __useCreateWorkspaceMutation__
 *
 * To run a mutation, you first call `useCreateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkspaceMutation, { data, loading, error }] = useCreateWorkspaceMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useCreateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>(CreateWorkspaceDocument, options);
      }
export type CreateWorkspaceMutationHookResult = ReturnType<typeof useCreateWorkspaceMutation>;
export type CreateWorkspaceMutationResult = Apollo.MutationResult<CreateWorkspaceMutation>;
export type CreateWorkspaceMutationOptions = Apollo.BaseMutationOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    user {
      ...User
    }
    errors {
      ...Error
    }
  }
}
    ${UserFragmentDoc}
${ErrorFragmentDoc}`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($options: EmailPasswordInput!) {
  register(options: $options) {
    user {
      ...User
    }
    errors {
      ...Error
    }
  }
}
    ${UserFragmentDoc}
${ErrorFragmentDoc}`;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      options: // value for 'options'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const HelloDocument = gql`
    query Hello {
  hello
}
    `;

/**
 * __useHelloQuery__
 *
 * To run a query within a React component, call `useHelloQuery` and pass it any options that fit your needs.
 * When your component renders, `useHelloQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHelloQuery({
 *   variables: {
 *   },
 * });
 */
export function useHelloQuery(baseOptions?: Apollo.QueryHookOptions<HelloQuery, HelloQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HelloQuery, HelloQueryVariables>(HelloDocument, options);
      }
export function useHelloLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HelloQuery, HelloQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HelloQuery, HelloQueryVariables>(HelloDocument, options);
        }
export type HelloQueryHookResult = ReturnType<typeof useHelloQuery>;
export type HelloLazyQueryHookResult = ReturnType<typeof useHelloLazyQuery>;
export type HelloQueryResult = Apollo.QueryResult<HelloQuery, HelloQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const OrganizationsDocument = gql`
    query Organizations {
  organizations {
    ...Organization
    workspaces {
      ...Workspace
    }
  }
}
    ${OrganizationFragmentDoc}
${WorkspaceFragmentDoc}`;

/**
 * __useOrganizationsQuery__
 *
 * To run a query within a React component, call `useOrganizationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrganizationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrganizationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useOrganizationsQuery(baseOptions?: Apollo.QueryHookOptions<OrganizationsQuery, OrganizationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrganizationsQuery, OrganizationsQueryVariables>(OrganizationsDocument, options);
      }
export function useOrganizationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrganizationsQuery, OrganizationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrganizationsQuery, OrganizationsQueryVariables>(OrganizationsDocument, options);
        }
export type OrganizationsQueryHookResult = ReturnType<typeof useOrganizationsQuery>;
export type OrganizationsLazyQueryHookResult = ReturnType<typeof useOrganizationsLazyQuery>;
export type OrganizationsQueryResult = Apollo.QueryResult<OrganizationsQuery, OrganizationsQueryVariables>;