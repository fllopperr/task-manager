export const typeDefs = `
  # ============================================
  # ENUMS
  # ============================================

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum BoardRole {
    ADMIN
    MEMBER
  }

  enum PresenceStatus {
    online
    offline
    away
  }

  # ============================================
  # TYPES
  # ============================================

  type User {
    id: ID!
    username: String!
    email: String!
    boards: [Board!]!
  }

  type Board {
    id: ID!
    title: String!
    icon: String
    owner: User!
    columns: [Column!]!
    _count: BoardCount
    members: [BoardMember!]!
  }

  type BoardMember {
    id: ID!
    role: BoardRole!
    userId: String!
    boardId: String!
    user: User!
    board: Board!
  }

  type BoardCount {
    columns: Int!
    tasks: Int!
  }

  type Column {
    id: ID!
    title: String!
    position: Float!
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    position: Float!
    priority: Priority
    tags: [String!]
    columnId: String!
    ownerId: String!
    assigneeId: String
    column: Column
    owner: User
    assignee: User
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
    taskId: String!
    ownerId: String!
    userId: String!
    task: Task!
    owner: User!
    user: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type BoardStats {
    totalTasks: Int!
    updatedAt: String!
  }

  # ============================================
  # REAL-TIME COLLABORATION TYPES
  # ============================================

  type UserPresence {
    userId: ID!
    status: PresenceStatus!
  }

  type UserTyping {
    userId: ID!
    userName: String!
  }

  # ============================================
  # QUERIES
  # ============================================

  type Query {
    me: User
    users: [User!]!
    boards: [Board!]!
    board(id: ID!): Board!
    boardStats(boardId: String!): BoardStats!
  }

  # ============================================
  # SUBSCRIPTIONS (Real-time Events)
  # ============================================

  type Subscription {
    # Task Events
    taskCreated(boardId: ID!): Task!
    taskUpdated(boardId: ID!): Task!
    taskDeleted(boardId: ID!): ID!
    taskMoved(boardId: ID!): Task!

    # Comment Events
    commentAdded(boardId: ID!): Comment!
    commentUpdated(boardId: ID!): Comment!
    commentDeleted(boardId: ID!): ID!

    # Board Member Events
    boardMemberAdded(boardId: ID!): BoardMember!
    boardMemberRemoved(boardId: ID!): ID!

    # Column Events
    columnCreated(boardId: ID!): Column!
    columnUpdated(boardId: ID!): Column!
    columnDeleted(boardId: ID!): ID!

    # Presence & Activity
    userPresence(boardId: ID!): UserPresence!
    userTyping(taskId: ID!): UserTyping!
  }

  # ============================================
  # MUTATIONS
  # ============================================

  type Mutation {
    # -------------------- Auth --------------------
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!

    # -------------------- Boards --------------------
    createBoard(input: CreateBoardInput!): Board!
    deleteBoard(id: ID!): Boolean!
    addBoardMember(boardId: ID!, email: String!, role: BoardRole): BoardMember!
    removeBoardMember(boardId: ID!, userId: ID!): Boolean!

    # -------------------- Tasks --------------------
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    moveTask(input: MoveTaskInput!): Task!
    deleteTask(id: ID!): Boolean!

    # -------------------- Comments --------------------
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, input: UpdateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!

    # -------------------- Columns --------------------
    createColumn(input: CreateColumnInput!): Column!
    updateColumn(id: ID!, input: UpdateColumnInput!): Column!
    deleteColumn(id: ID!): Boolean!

    # -------------------- Real-time Collaboration --------------------
    updatePresence(boardId: ID!, status: PresenceStatus!): Boolean!
    setTyping(taskId: ID!, isTyping: Boolean!): Boolean!
  }

  # ============================================
  # INPUT TYPES
  # ============================================

  # Auth Inputs
  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    email: String!
    password: String!
    username: String!
  }

  # Board Inputs
  input CreateBoardInput {
    title: String!
    icon: String
  }

  # Task Inputs
  input CreateTaskInput {
    title: String!
    columnId: String!
    priority: Priority
    description: String
    tags: [String!]
  }

  input UpdateTaskInput {
    title: String
    priority: Priority
    description: String
    tags: [String!]
    assigneeId: String
  }

  input MoveTaskInput {
    taskId: ID!
    newColumnId: String!
    newPosition: Float!
  }

  # Comment Inputs
  input CreateCommentInput {
    content: String!
    taskId: String!
  }

  input UpdateCommentInput {
    content: String!
  }

  # Column Inputs
  input CreateColumnInput {
    title: String!
    boardId: String!
    position: Float!
  }

  input UpdateColumnInput {
    title: String
    position: Float
  }
`
