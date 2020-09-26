/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        channelID
        author
        body
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getDoctor = /* GraphQL */ `
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
      id
      title
      fullName
      specialty
      clinic
      createdAt
      updatedAt
    }
  }
`;
export const listDoctors = /* GraphQL */ `
  query ListDoctors(
    $filter: ModelDoctorFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDoctors(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        fullName
        specialty
        clinic
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getPatient = /* GraphQL */ `
  query GetPatient($id: ID!) {
    getPatient(id: $id) {
      id
      fullName
      operation
      surgeryAt
      clinic
      createdAt
      updatedAt
    }
  }
`;
export const listPatients = /* GraphQL */ `
  query ListPatients(
    $filter: ModelPatientFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPatients(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fullName
        operation
        surgeryAt
        clinic
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const messagesByChannelId = /* GraphQL */ `
  query MessagesByChannelId(
    $channelID: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByChannelID(
      channelID: $channelID
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        channelID
        author
        body
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
